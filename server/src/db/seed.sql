-- =============================================================================
-- Seed Script: server/src/db/seed.sql
-- Project:     Bash n Build — Pan-African Tech Blog
-- Description: Populates the database with mock data for local development.
-- =============================================================================

-- Clear existing data (in reverse order of dependencies)
TRUNCATE users, categories, articles, comments, tags, article_tags RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 1. MOCK USERS
-- Roles: admin, author, subscriber
-- Passwords: 'password123' (hashed using a generic bcrypt-like string)
-- -----------------------------------------------------------------------------
INSERT INTO users (email, username, display_name, role, bio, expertise, password_hash)
VALUES
  (
    'admin@bashnbuild.dev',
    'admin',
    'System Admin',
    'admin',
    'Platform administrator and lead architect.',
    '{Cloud, Security, Architecture}',
    '$2b$10$6p7uI.WbO5E8U2aUqYfW7.4HqI8iQY1G9nL5V9w.Z2y5.3e8Y6.7'
  ),
  (
    'john.doe@bashnbuild.dev',
    'jdoe_dev',
    'John Doe',
    'author',
    'Senior Software Engineer focusing on distributed systems and Go.',
    '{Go, Kubernetes, Microservices}',
    '$2b$10$6p7uI.WbO5E8U2aUqYfW7.4HqI8iQY1G9nL5V9w.Z2y5.3e8Y6.7'
  ),
  (
    'jane.smith@bashnbuild.dev',
    'jsmith_tech',
    'Jane Smith',
    'author',
    'Technical Writer and Frontend Developer passionate about UX.',
    '{React, TypeScript, CSS, UI/UX}',
    '$2b$10$6p7uI.WbO5E8U2aUqYfW7.4HqI8iQY1G9nL5V9w.Z2y5.3e8Y6.7'
  );

-- -----------------------------------------------------------------------------
-- 2. TECH CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO categories (name, slug, icon_svg)
VALUES
  ('Software Engineering', 'software-engineering', '<svg>...</svg>'),
  ('Cloud Computing',      'cloud-computing',      '<svg>...</svg>'),
  ('Cybersecurity',        'cybersecurity',        '<svg>...</svg>'),
  ('Artificial Intelligence', 'ai-machine-learning', '<svg>...</svg>'),
  ('DevOps',               'devops',               '<svg>...</svg>');

-- -----------------------------------------------------------------------------
-- 3. MOCK TAGS
-- -----------------------------------------------------------------------------
INSERT INTO tags (name, slug)
VALUES
  ('React', 'react'),
  ('Node.js', 'nodejs'),
  ('PostgreSQL', 'postgresql'),
  ('Docker', 'docker'),
  ('AWS', 'aws'),
  ('Python', 'python');

-- -----------------------------------------------------------------------------
-- 4. SAMPLE ARTICLES (10 Published)
-- -----------------------------------------------------------------------------
INSERT INTO articles (title, slug, excerpt, body, author_id, category_id, status, view_count, published_at)
VALUES
  (
    'Mastering PostgreSQL Indexing',
    'mastering-postgresql-indexing',
    'A deep dive into B-Tree, GIN, and GiST indexes for performance.',
    'Full content of the article goes here...',
    2, 1, 'published', 1500, NOW() - INTERVAL '5 days'
  ),
  (
    'Serverless vs Containers in 2026',
    'serverless-vs-containers-2026',
    'Comparing AWS Lambda with Fargate for scalable workloads.',
    'Full content of the article goes here...',
    2, 2, 'published', 800, NOW() - INTERVAL '10 days'
  ),
  (
    'Building Type-Safe APIs with Next.js',
    'type-safe-apis-nextjs',
    'How to use Zod and TypeScript for robust backend validation.',
    'Full content of the article goes here...',
    3, 1, 'published', 2100, NOW() - INTERVAL '2 days'
  ),
  (
    'The Rise of Agentic AI Workflow',
    'agentic-ai-workflows',
    'Moving from simple chat to autonomous AI agents.',
    'Full content of the article goes here...',
    1, 4, 'published', 4500, NOW() - INTERVAL '1 day'
  ),
  (
    'Zero Trust Architecture for Startups',
    'zero-trust-startups',
    'Why your perimeter is no longer safe.',
    'Full content of the article goes here...',
    2, 3, 'published', 320, NOW() - INTERVAL '15 days'
  ),
  (
    'Kubernetes Cost Optimization',
    'k8s-cost-optimization',
    'Saving money on your EKS/GKE clusters.',
    'Full content of the article goes here...',
    1, 5, 'published', 670, NOW() - INTERVAL '20 days'
  ),
  (
    'CSS Container Queries: A Game Changer',
    'css-container-queries',
    'Finally, component-based responsiveness is here.',
    'Full content of the article goes here...',
    3, 1, 'published', 1200, NOW() - INTERVAL '7 days'
  ),
  (
    'Introduction to Rust for Web Devs',
    'rust-for-web-devs',
    'Why you should care about memory safety.',
    'Full content of the article goes here...',
    2, 1, 'published', 950, NOW() - INTERVAL '12 days'
  ),
  (
    'Securing your CI/CD Pipeline',
    'securing-cicd-pipeline',
    'Preventing supply chain attacks in GitHub Actions.',
    'Full content of the article goes here...',
    1, 5, 'published', 1100, NOW() - INTERVAL '8 days'
  ),
  (
    'LLMs in Production: Best Practices',
    'llms-production-best-practices',
    'Scaling inference without breaking the bank.',
    'Full content of the article goes here...',
    1, 4, 'published', 2800, NOW() - INTERVAL '3 days'
  );

-- -----------------------------------------------------------------------------
-- 5. ARTICLE TAGS
-- -----------------------------------------------------------------------------
INSERT INTO article_tags (article_id, tag_id)
VALUES
  (1, 3), (2, 4), (2, 5), (3, 1), (3, 2), (4, 6), (6, 4), (9, 4);

-- -----------------------------------------------------------------------------
-- 6. HIERARCHICAL COMMENTS (20)
-- Scattered across articles with nesting.
-- Note: materialized_path is auto-populated by trg_comment_path on insert.
-- -----------------------------------------------------------------------------

-- Article 1 Comments
INSERT INTO comments (article_id, user_id, body) VALUES (1, 3, 'Great article on indexing! I learned a lot about GIN indexes.'); -- ID 1
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (1, 2, 1, 'Glad you liked it, Jane! Do you use GIN for full-text search?'); -- ID 2
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (1, 3, 2, 'Yes, combined with tsvector. It is super fast.'); -- ID 3
INSERT INTO comments (article_id, user_id, body) VALUES (1, 1, 'Wait, you missed BRIN indexes! They are great for large time-series data.'); -- ID 4

-- Article 4 Comments (Trending)
INSERT INTO comments (article_id, user_id, body) VALUES (4, 2, 'Agentic AI is the future. LangGraph is a great tool for this.'); -- ID 5
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (4, 1, 5, 'Agreed. The state management in LangGraph is key.'); -- ID 6
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (4, 3, 6, 'Is there a steep learning curve for frontend devs?'); -- ID 7
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (4, 2, 7, 'A bit, but if you know React state, it feels familiar.'); -- ID 8
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (4, 1, 8, 'I actually think the logic is more similar to Redux.'); -- ID 9

-- Article 3 Comments
INSERT INTO comments (article_id, user_id, body) VALUES (3, 2, 'Zod is amazing. No more manual validation.'); -- ID 10
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (3, 1, 10, 'Pairing it with tRPC makes it even better.'); -- ID 11
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (3, 3, 11, 'Next.js Server Actions also work great with Zod.'); -- ID 12

-- Article 7 Comments
INSERT INTO comments (article_id, user_id, body) VALUES (7, 1, 'Container queries are finally stable in all browsers!'); -- ID 13
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (7, 3, 13, 'Yes! I can finally stop using window resize listeners.'); -- ID 14

-- More scattered comments to reach 20
INSERT INTO comments (article_id, user_id, body) VALUES (2, 1, 'Containers win for me because of the cold start issues in Lambda.'); -- ID 15
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (2, 2, 15, 'Lambda SnapStart fixes a lot of that for Java though.'); -- ID 16
INSERT INTO comments (article_id, user_id, body) VALUES (5, 3, 'Security starts with the culture, not just the tools.'); -- ID 17
INSERT INTO comments (article_id, user_id, body) VALUES (6, 2, 'Spot instances are the way to go for EKS savings.'); -- ID 18
INSERT INTO comments (article_id, user_id, parent_comment_id, body) VALUES (6, 1, 18, 'Until they get reclaimed during a peak! Haha.'); -- ID 19
INSERT INTO comments (article_id, user_id, body) VALUES (10, 3, 'Great summary of LLM costs.'); -- ID 20

-- Refresh the materialized view since it was created 'WITH NO DATA'
REFRESH MATERIALIZED VIEW mv_trending_articles;

-- Reset sequences for all tables to avoid collisions after manual inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles));
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));
