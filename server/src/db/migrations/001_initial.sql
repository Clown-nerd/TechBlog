-- =============================================================================
-- Migration: 001_initial.sql
-- Project:   Bash n Build — Pan-African Tech Blog
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE author_role   AS ENUM ('editor', 'contributor');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AUTHORS
-- -----------------------------------------------------------------------------
CREATE TABLE authors (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  handle      VARCHAR(100) NOT NULL UNIQUE,  -- @handle, used in URLs
  bio         TEXT,
  avatar_url  TEXT,
  role        author_role  NOT NULL DEFAULT 'contributor',
  expertise   TEXT[]       NOT NULL DEFAULT '{}',  -- e.g. {'DevOps','FinTech','AI'}
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authors_handle ON authors (handle);

-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  icon_svg      TEXT,                          -- inline SVG string
  article_count INT          NOT NULL DEFAULT 0,  -- kept in sync via trigger
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);

-- -----------------------------------------------------------------------------
-- TAGS
-- -----------------------------------------------------------------------------
CREATE TABLE tags (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ARTICLES
-- -----------------------------------------------------------------------------
CREATE TABLE articles (
  id                   SERIAL          PRIMARY KEY,
  title                VARCHAR(300)    NOT NULL,
  slug                 VARCHAR(320)    NOT NULL UNIQUE,
  excerpt              TEXT,
  body                 TEXT            NOT NULL,          -- rich HTML string
  cover_image_url      TEXT,
  youtube_video_id     VARCHAR(20),                      -- just the 11-char YT ID, nullable
  status               article_status  NOT NULL DEFAULT 'draft',
  reading_time_minutes SMALLINT        NOT NULL DEFAULT 1,
  view_count           INT             NOT NULL DEFAULT 0,
  published_at         TIMESTAMPTZ,
  author_id            INT             NOT NULL REFERENCES authors(id)    ON DELETE RESTRICT,
  category_id          INT                      REFERENCES categories(id) ON DELETE SET NULL,
  -- Full-text search vector (title + excerpt + body weighted A, B, C)
  search_vector        TSVECTOR,
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Standard lookup indexes
CREATE INDEX idx_articles_slug           ON articles (slug);
CREATE INDEX idx_articles_status         ON articles (status);
CREATE INDEX idx_articles_author         ON articles (author_id);
CREATE INDEX idx_articles_category       ON articles (category_id);
CREATE INDEX idx_articles_published_at   ON articles (published_at DESC NULLS LAST);

-- GIN index for full-text search
CREATE INDEX idx_articles_search         ON articles USING GIN (search_vector);

-- -----------------------------------------------------------------------------
-- ARTICLE ↔ TAGS  (many-to-many join table)
-- -----------------------------------------------------------------------------
CREATE TABLE article_tags (
  article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     INT NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_tag ON article_tags (tag_id);

-- -----------------------------------------------------------------------------
-- SUBSCRIBERS
-- -----------------------------------------------------------------------------
CREATE TABLE subscribers (
  id                SERIAL       PRIMARY KEY,
  email             VARCHAR(254) NOT NULL UNIQUE,
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  topic_preferences TEXT[]       NOT NULL DEFAULT '{}',   -- e.g. {'AI','FinTech'}
  subscribed_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_subscribers_email     ON subscribers (email);
CREATE INDEX idx_subscribers_is_active ON subscribers (is_active);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Auto-update updated_at on authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Rebuild search_vector on articles INSERT / UPDATE
--    Weights: A = title, B = excerpt, C = body
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION articles_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title,   '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body,    '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_articles_search_vector
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

-- -----------------------------------------------------------------------------
-- 3. Keep categories.article_count in sync
--    Increments on INSERT to articles, decrements on DELETE, handles moves.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_category_article_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Decrement old category when a row is deleted or category changes
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.category_id IS NOT NULL THEN
    UPDATE categories
       SET article_count = GREATEST(article_count - 1, 0)
     WHERE id = OLD.category_id;
  END IF;

  -- Increment new category when a row is inserted or category changes
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.category_id IS NOT NULL THEN
    UPDATE categories
       SET article_count = article_count + 1
     WHERE id = NEW.category_id;
  END IF;

  RETURN NULL; -- AFTER trigger, return value ignored for row
END;
$$;

CREATE TRIGGER trg_sync_category_count
  AFTER INSERT OR UPDATE OF category_id OR DELETE ON articles
  FOR EACH ROW EXECUTE FUNCTION sync_category_article_count();

-- =============================================================================
-- END OF MIGRATION 001_initial.sql
-- =============================================================================
