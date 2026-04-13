import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';
import type { AuthPayload } from '../middleware/auth';

const DEFAULT_SECRET = 'supersecret_key_change_in_production';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { handle, password } = req.body;

  if (!handle || !password) {
    res.status(400).json({ error: 'handle and password are required' });
    return;
  }

  try {
    const result = await db.query(
      'SELECT id, handle, role, password_hash, is_active FROM authors WHERE handle = $1',
      [handle],
    );

    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    if (!user.password_hash) {
      res.status(401).json({ error: 'Password not set for this account' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload: AuthPayload = {
      id: user.id,
      handle: user.handle,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || DEFAULT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
