import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { createError } from '../middleware/errorHandler';

// ---------------------------------------------------------------------------
// GET /api/authors
// ---------------------------------------------------------------------------
export const getAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      `SELECT id, display_name AS name, username AS handle, avatar_url, bio, role, expertise
       FROM users
       WHERE role IN ('author', 'admin') AND is_active = TRUE
       ORDER BY display_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/authors/:id
// ---------------------------------------------------------------------------
export const getAuthorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await db.query(
      `SELECT id, display_name AS name, username AS handle, avatar_url, bio, role, expertise
       FROM users
       WHERE id = $1 AND role IN ('author', 'admin')`,
      [id]
    );
    if (result.rowCount === 0) {
      return next(createError('Author not found', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
