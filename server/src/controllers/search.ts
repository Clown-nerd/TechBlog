import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { SearchQuery } from '../schemas/search.schema';

// ---------------------------------------------------------------------------
// GET /api/search?q=…&category=…
// ---------------------------------------------------------------------------
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q, category, page, limit }: SearchQuery = (req as any).validatedQuery;
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause
    const conditions: string[] = [
      `a.status = 'published'`,
      `a.search_vector @@ plainto_tsquery('english', $1)`,
    ];
    const params: (string | number)[] = [q];
    let paramIdx = 2;

    if (category) {
      conditions.push(`c.slug = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countResult = await db.query(
      `SELECT COUNT(*) AS total
       FROM articles a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE ${whereClause}`,
      params,
    );
    const totalCount = parseInt(countResult.rows[0]?.total || '0', 10);

    // Results query (ranked)
    const result = await db.query(
      `SELECT
         a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
         a.youtube_video_id, a.reading_time_minutes,
         a.view_count, a.published_at,
         ts_rank(a.search_vector, plainto_tsquery('english', $1)) AS rank,
         ts_headline(
           'english', a.excerpt,
           plainto_tsquery('english', $1),
           'StartSel=<mark>, StopSel=</mark>, MaxFragments=2'
         ) AS headline,
         au.name  AS author_name,
         au.handle AS author_handle,
         c.name   AS category_name,
         c.slug   AS category_slug
       FROM articles a
       LEFT JOIN authors    au ON au.id = a.author_id
       LEFT JOIN categories c  ON c.id  = a.category_id
       WHERE ${whereClause}
       ORDER BY rank DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset],
    );

    res.json({
      query: q,
      category: category || null,
      data: result.rows,
      meta: { page, limit, count: result.rowCount, total_count: totalCount },
    });
  } catch (err) {
    next(err);
  }
};
