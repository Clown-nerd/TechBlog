import { readFileSync } from 'fs';
import path from 'path';
import db from './index';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations() {
  // Simple ordered runner — reads each .sql file alphabetically and executes it
  const files = [
    '001_initial.sql',
    '002_add_auth_and_roles.sql',
  ]; // Extend this list as you add migrations

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`Running migration: ${file}`);
    await db.query(sql);
    console.log(`  ✓ ${file} applied successfully`);
  }

  console.log('\nAll migrations applied.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
