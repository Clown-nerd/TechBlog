import { readFileSync } from 'fs';
import path from 'path';
import db from './index';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Idempotent migration runner.
 *
 * Creates a `schema_migrations` tracking table on first run. Each migration
 * file is executed at most once; subsequent runs skip already-applied files.
 *
 * Register new migrations by appending to the `files` array below.
 */
async function runMigrations() {
  // ── Ensure tracking table exists ──────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT        PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // ── Ordered list of migration files ───────────────────────────────────────
  const files = [
    '001_initial.sql',
    '002_add_auth_and_roles.sql',
    '003_normalize_schema.sql',
  ];

  for (const file of files) {
    // Check if this migration has already been applied
    const existing = await db.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [file],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      console.log(`  ⏭  ${file} — already applied, skipping`);
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`  ▶  Running migration: ${file}`);

    try {
      await db.query('BEGIN');
      await db.query(sql);
      await db.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file],
      );
      await db.query('COMMIT');
      console.log(`  ✓  ${file} applied successfully`);
    } catch (err) {
      await db.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err}`);
    }
  }

  console.log('\n✅ All migrations applied.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
