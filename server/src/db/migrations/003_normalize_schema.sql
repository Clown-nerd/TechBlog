-- =============================================================================
-- Migration: 003_normalize_schema.sql
-- Project:   Bash n Build — Pan-African Tech Blog
-- Description:
--   1. Creates a unified `users` table with admin/author/subscriber roles
--   2. Migrates existing authors and subscribers into the `users` table
--   3. Re-points articles.author_id FK to users(id)
--   4. Adds hierarchical comments (adjacency list + materialized path)
--   5. Links subscribers table to users via user_id FK
--   6. Adds read-optimized composite & partial indexes
--   7. Creates mv_trending_articles materialized view
--   8. Fixes category count trigger to only count published articles
-- =============================================================================


-- =============================================================================
-- STEP 1: USER_ROLE ENUM & USERS TABLE
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'author', 'subscriber');

CREATE TABLE users (
  id            SERIAL        PRIMARY KEY,
  email         VARCHAR(254)  NOT NULL UNIQUE,
  username      VARCHAR(100)  NOT NULL UNIQUE,
  display_name  VARCHAR(150)  NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  password_hash VARCHAR(255),
  role          user_role     NOT NULL DEFAULT 'subscriber',
  expertise     TEXT[]        NOT NULL DEFAULT '{}',
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role     ON users (role);

-- Auto-update updated_at on users (reuses the existing set_updated_at function)
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- STEP 2: MIGRATE AUTHORS → USERS
-- =============================================================================

INSERT INTO users (
  id, email, username, display_name, bio, avatar_url,
  password_hash, role, expertise, is_active, created_at, updated_at
)
SELECT
  a.id,
  -- Synthetic email: use handle as local part if no email column exists
  a.handle || '@bashnbuild.dev',
  a.handle,
  a.name,
  a.bio,
  a.avatar_url,
  a.password_hash,
  CASE a.role::text
    WHEN 'admin'       THEN 'admin'::user_role
    WHEN 'editor'      THEN 'admin'::user_role       -- promote editors to admin
    WHEN 'contributor' THEN 'author'::user_role
  END,
  a.expertise,
  COALESCE(a.is_active, TRUE),
  a.created_at,
  a.updated_at
FROM authors a;

-- Reset the sequence so new user IDs don't collide with migrated author IDs
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));


-- =============================================================================
-- STEP 3: MIGRATE SUBSCRIBERS → USERS
--   Only inserts subscribers whose email doesn't already exist in users.
-- =============================================================================

INSERT INTO users (email, username, display_name, role, is_active, created_at)
SELECT
  s.email,
  LOWER(REPLACE(SPLIT_PART(s.email, '@', 1), '.', '_'))
    || '_' || s.id::text,                              -- ensure uniqueness
  COALESCE(
    NULLIF(TRIM(CONCAT(s.first_name, ' ', s.last_name)), ''),
    SPLIT_PART(s.email, '@', 1)
  ),
  'subscriber'::user_role,
  s.is_active,
  s.subscribed_at
FROM subscribers s
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = s.email
);


-- =============================================================================
-- STEP 4: RE-POINT articles.author_id FK → users(id)
--   The column name stays author_id but the FK now targets the users table.
-- =============================================================================

-- 4a. Add a temporary column to hold the new FK
ALTER TABLE articles ADD COLUMN _new_author_id INT;

-- 4b. Copy existing author_id values (they match users.id because we
--     preserved IDs during the author migration above)
UPDATE articles SET _new_author_id = author_id;

-- 4c. Drop the old FK constraint pointing at authors(id)
ALTER TABLE articles DROP CONSTRAINT articles_author_id_fkey;

-- 4d. Drop the old column and rename the new one
ALTER TABLE articles DROP COLUMN author_id;
ALTER TABLE articles RENAME COLUMN _new_author_id TO author_id;

-- 4e. Apply NOT NULL and add the new FK → users(id)
ALTER TABLE articles ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE articles
  ADD CONSTRAINT fk_articles_author
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT;

-- 4f. Re-create the index on author_id (the old one was dropped with the column)
CREATE INDEX idx_articles_author ON articles (author_id);


-- =============================================================================
-- STEP 5: HIERARCHICAL COMMENTS TABLE
--   Adjacency list (parent_comment_id) + materialized path for efficient
--   subtree queries. Soft-delete via is_deleted preserves thread structure.
-- =============================================================================

CREATE TABLE comments (
  id                SERIAL      PRIMARY KEY,
  article_id        INT         NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id           INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_comment_id INT                  REFERENCES comments(id) ON DELETE CASCADE,
  materialized_path TEXT        NOT NULL DEFAULT '',
  body              TEXT        NOT NULL,
  is_deleted        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- All comments on an article, ordered chronologically
CREATE INDEX idx_comments_article ON comments (article_id, created_at);

-- All direct replies to a specific comment
CREATE INDEX idx_comments_parent  ON comments (parent_comment_id);

-- Subtree queries: WHERE materialized_path LIKE '42.%'
CREATE INDEX idx_comments_path    ON comments USING BTREE (materialized_path text_pattern_ops);

-- A user's comment history
CREATE INDEX idx_comments_user    ON comments (user_id);

-- Auto-update updated_at
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Materialized path trigger
-- Automatically sets materialized_path on INSERT based on parent chain.
-- Root comments: path = '<own_id>'
-- Replies:       path = '<parent_path>.<own_id>'
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_comment_materialized_path()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_comment_id IS NULL THEN
    -- Root-level comment — path is just the comment's own ID
    NEW.materialized_path := NEW.id::TEXT;
  ELSE
    SELECT materialized_path INTO parent_path
      FROM comments
     WHERE id = NEW.parent_comment_id;

    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent comment % does not exist', NEW.parent_comment_id;
    END IF;

    NEW.materialized_path := parent_path || '.' || NEW.id::TEXT;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_comment_path
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION set_comment_materialized_path();


-- =============================================================================
-- STEP 6: LINK SUBSCRIBERS TABLE → USERS
--   Preserves the subscribers table for newsletter/mailing-list integrations
--   while linking each subscriber to their unified user account.
-- =============================================================================

ALTER TABLE subscribers ADD COLUMN user_id INT UNIQUE;

ALTER TABLE subscribers
  ADD CONSTRAINT fk_subscribers_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Backfill: match subscribers to users by email
UPDATE subscribers s
SET user_id = u.id
FROM users u
WHERE u.email = s.email;


-- =============================================================================
-- STEP 7: READ-HEAVY COMPOSITE & PARTIAL INDEXES
--   Tailored to the query patterns in the articles controller.
-- =============================================================================

-- Covers the default listing: published articles sorted by published_at DESC
CREATE INDEX idx_articles_published_listing
  ON articles (published_at DESC NULLS LAST)
  WHERE status = 'published';

-- Covers trending sorts: published articles sorted by view_count DESC
CREATE INDEX idx_articles_published_views
  ON articles (view_count DESC)
  WHERE status = 'published';

-- Fast single-article lookup by slug (published only)
CREATE INDEX idx_articles_slug_published
  ON articles (slug)
  WHERE status = 'published';

-- NOTE: article_tags already has a composite PK (article_id, tag_id)
-- which covers lookups by article_id. No additional index needed.


-- =============================================================================
-- STEP 8: TRENDING ARTICLES MATERIALIZED VIEW
--   Pre-computes a ranked list of trending articles using a time-decayed
--   scoring formula: views / (hours_since_publish + 2) ^ 1.5
--   Designed to be refreshed periodically (e.g. every 15 min via pg_cron).
-- =============================================================================

CREATE MATERIALIZED VIEW mv_trending_articles AS
SELECT
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.cover_image_url,
  a.reading_time_minutes,
  a.view_count,
  a.published_at,
  -- Time-decayed trending score (Hacker News-style)
  -- The +2 in the denominator prevents division-by-zero and gives a slight
  -- boost to freshly published articles.
  ROUND(
    a.view_count::NUMERIC /
    POWER(
      EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 3600.0 + 2,
      1.5
    ),
    4
  ) AS trending_score,
  json_build_object(
    'id',           u.id,
    'display_name', u.display_name,
    'username',     u.username,
    'avatar_url',   u.avatar_url
  ) AS author,
  json_build_object(
    'id',   c.id,
    'name', c.name,
    'slug', c.slug
  ) AS category,
  (
    SELECT COUNT(*)
      FROM comments cm
     WHERE cm.article_id = a.id
       AND cm.is_deleted = FALSE
  ) AS comment_count
FROM articles a
JOIN      users      u ON u.id = a.author_id
LEFT JOIN categories c ON c.id = a.category_id
WHERE a.status = 'published'
  AND a.published_at >= NOW() - INTERVAL '30 days'
ORDER BY trending_score DESC
LIMIT 50
WITH NO DATA;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_trending_id ON mv_trending_articles (id);

-- Usage:
--   Initial population:   REFRESH MATERIALIZED VIEW mv_trending_articles;
--   Subsequent refreshes: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_articles;


-- =============================================================================
-- STEP 9: FIX CATEGORY COUNT TRIGGER
--   The original trigger counts ALL articles (including drafts/archived).
--   This replacement only counts published articles via a subquery recount.
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_category_article_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Recount the OLD category (on DELETE, UPDATE of category_id, or status change)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.category_id IS NOT NULL THEN
    UPDATE categories
       SET article_count = (
             SELECT COUNT(*)
               FROM articles
              WHERE category_id = OLD.category_id
                AND status = 'published'
           )
     WHERE id = OLD.category_id;
  END IF;

  -- Recount the NEW category (on INSERT, UPDATE of category_id, or status change)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.category_id IS NOT NULL THEN
    UPDATE categories
       SET article_count = (
             SELECT COUNT(*)
               FROM articles
              WHERE category_id = NEW.category_id
                AND status = 'published'
           )
     WHERE id = NEW.category_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Re-create the trigger to also fire on status changes
DROP TRIGGER IF EXISTS trg_sync_category_count ON articles;

CREATE TRIGGER trg_sync_category_count
  AFTER INSERT OR UPDATE OF category_id, status OR DELETE ON articles
  FOR EACH ROW EXECUTE FUNCTION sync_category_article_count();


-- =============================================================================
-- END OF MIGRATION 003_normalize_schema.sql
-- =============================================================================
