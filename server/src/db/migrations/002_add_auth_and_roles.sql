-- =============================================================================
-- Migration: 002_add_auth_and_roles.sql
-- Project:   Bash n Build — Pan-African Tech Blog
-- Description:
--   1. Extends the author_role enum to include 'admin'
--   2. Adds authentication columns (password_hash, is_active) to authors
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extend the author_role enum
--    NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block
--    in PostgreSQL < 12. In PG 12+ it can, but we commit first to be safe.
--    If your migrate runner wraps each file in BEGIN/COMMIT, split this step
--    into its own migration or run it outside a transaction.
-- -----------------------------------------------------------------------------
ALTER TYPE author_role ADD VALUE IF NOT EXISTS 'admin';

-- -----------------------------------------------------------------------------
-- 2. Add authentication columns to authors
-- -----------------------------------------------------------------------------
ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE;

-- =============================================================================
-- END OF MIGRATION 002_add_auth_and_roles.sql
-- =============================================================================
