import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import db from '../db';
import { AuthPayload, UserRole } from '../middleware/auth';

const DEFAULT_SECRET = 'supersecret_key_change_in_production';

// Helpers to generate tokens
export const generateToken = (payload: AuthPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || DEFAULT_SECRET, { expiresIn: '1h' });
};

export const getAdminToken = () => generateToken({ id: 1, handle: 'admin', role: 'admin' });
export const getAuthorToken = () => generateToken({ id: 2, handle: 'jdoe_dev', role: 'author' });
export const getSubscriberToken = () => generateToken({ id: 4, handle: 'subscriber_user', role: 'subscriber' as UserRole });

// Wait, the subscriber role in the DB seed is not present. Let's create a subscriber token for a mock user id 999.
export const getMockSubscriberToken = () => generateToken({ id: 999, handle: 'sub_test', role: 'subscriber' as UserRole });

beforeAll(async () => {
  // Execute migrations
  const migrationsDir = path.join(__dirname, '../db/migrations');
  const migrationFiles = [
    '001_initial.sql',
    '002_add_auth_and_roles.sql',
    '003_normalize_schema.sql',
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await db.query(sql);
  }

  // Execute seeds
  const seedPath = path.join(__dirname, '../db/seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  await db.query(seedSql);
});

afterAll(async () => {
  await db.pool.end();
});
