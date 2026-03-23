import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { createError } from '../middleware/errorHandler';
import { mockCategories, mockArticlesList } from '../mock/data';

const USE_MOCK = process.env.USE_MOCK === 'true';

// ---------------------------------------------------------------------------
// GET /api/categories
// ---------------------------------------------------------------------------
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (USE_MOCK) { res.json(mockCategories); return; }
  try {
    const result = await db.query(
      `SELECT id, name, slug, icon_svg, article_count, created_at
       FROM categories
       ORDER BY name ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// GET /api/categories/:slug/articles
// ---------------------------------------------------------------------------
export const getArticlesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const page  = Math.max(1, parseInt((req.query.page  as string) || '1',  10));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '10', 10));
    const offset = (page - 1) * limit;

    // Verify category exists
    const catResult = await db.query(
      'SELECT id, name, slug, icon_svg, article_count FROM categories WHERE slug = $1',
      [slug],
    );
    if (catResult.rowCount === 0) {
      return next(createError('Category not found', 404));
    }

    const category = catResult.rows[0];

    const articlesResult = await db.query(
      `SELECT
         a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
         a.youtube_video_id, a.reading_time_minutes,
         a.view_count, a.published_at,
         json_build_object('id', au.id, 'name', au.name, 'handle', au.handle, 'avatar_url', au.avatar_url) AS author
       FROM articles a
       JOIN authors au ON au.id = a.author_id
       WHERE a.category_id = $1 AND a.status = 'published'
       ORDER BY a.published_at DESC NULLS LAST
       LIMIT $2 OFFSET $3`,
      [category.id, limit, offset],
    );

    res.json({
      category,
      data: articlesResult.rows,
      meta: { page, limit },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/categories  (admin only)
// ---------------------------------------------------------------------------
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, slug, icon_svg } = req.body;
    const result = await db.query(
      `INSERT INTO categories (name, slug, icon_svg) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, icon_svg ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return next(createError('Category slug already exists', 409));
    }
    next(err);
  }
};
