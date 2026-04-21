import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { createError } from '../middleware/errorHandler';
import {
  ArticleListQuery,
  CreateArticleInput,
  UpdateArticleInput,
} from '../schemas/article.schema';
import { mockArticlesList, mockArticlesFull } from '../mock/data';

const USE_MOCK = process.env.USE_MOCK === 'true';


// ---------------------------------------------------------------------------
// GET /api/articles
// ---------------------------------------------------------------------------
export const getArticles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (USE_MOCK) {
    const { status, category } = req.query as any;
    let data = mockArticlesList;
    if (status) data = data.filter((a: any) => a.status === status);
    else data = data.filter((a: any) => a.status === 'published');
    if (category) data = data.filter((a: any) => a.category?.slug === category);
    res.json({ data, meta: { page: 1, limit: 20, total: data.length, totalPages: 1 } });
    return;
  }
  try {
    const q: ArticleListQuery = (req as any).validatedQuery;
    const { page, limit, category, tag, status, sort, dir } = q;
    const offset = (page - 1) * limit;

    const params: unknown[] = [];
    const conditions: string[] = [];

    let sql = '';
    let countSql = '';

    if (sort === 'view_count') {
      // Query mv_trending_articles for trending logic
      if (category) {
        params.push(category);
        conditions.push(`category->>'slug' = $${params.length}`);
      }

      if (tag) {
        params.push(tag);
        conditions.push(
          `EXISTS (
            SELECT 1 FROM article_tags at2
            JOIN tags t ON t.id = at2.tag_id
            WHERE at2.article_id = mv_trending_articles.id AND t.slug = $${params.length}
          )`,
        );
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      params.push(limit);
      const limitIdx = params.length;
      params.push(offset);
      const offsetIdx = params.length;

      sql = `
        SELECT
          id, title, slug, excerpt, cover_image_url,
          NULL AS youtube_video_id, 'published' AS status, reading_time_minutes,
          view_count, published_at, published_at AS created_at,
          author, category
        FROM mv_trending_articles
        ${where}
        ORDER BY trending_score DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;

      countSql = `
        SELECT COUNT(*) AS total
        FROM mv_trending_articles
        ${where}
      `;
    } else {
      const sortDir = dir === 'asc' ? 'ASC' : 'DESC';

      if (status) {
        params.push(status);
        conditions.push(`a.status = $${params.length}`);
      } else {
        conditions.push(`a.status = 'published'`);
      }

      if (category) {
        params.push(category);
        conditions.push(`c.slug = $${params.length}`);
      }

      if (tag) {
        params.push(tag);
        conditions.push(
          `EXISTS (
            SELECT 1 FROM article_tags at2
            JOIN tags t ON t.id = at2.tag_id
            WHERE at2.article_id = a.id AND t.slug = $${params.length}
          )`,
        );
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      params.push(limit);
      const limitIdx = params.length;
      params.push(offset);
      const offsetIdx = params.length;

      sql = `
        SELECT
          a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
          a.youtube_video_id, a.status, a.reading_time_minutes,
          a.view_count, a.published_at, a.created_at,
          json_build_object('id', au.id, 'name', au.display_name, 'handle', au.username, 'avatar_url', au.avatar_url) AS author,
          json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)                                    AS category
        FROM articles a
        LEFT JOIN users      au ON au.id = a.author_id
        LEFT JOIN categories c  ON c.id  = a.category_id
        ${where}
        ORDER BY a.published_at ${sortDir} NULLS LAST
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;

      countSql = `
        SELECT COUNT(*) AS total
        FROM articles a
        LEFT JOIN categories c ON c.id = a.category_id
        ${where}
      `;
    }

    const [rows, countRow] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, params.slice(0, params.length - 2)),
    ]);

    const total = parseInt(countRow.rows[0].total, 10);

    res.json({
      data: rows.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/articles/:slug
// ---------------------------------------------------------------------------
export const getArticleBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (USE_MOCK) {
    const article = mockArticlesFull.find(a => a.slug === req.params.slug && a.status === 'published');
    if (!article) { next(createError('Article not found', 404)); return; }
    res.json(article);
    return;
  }


  try {
    const { slug } = req.params;
    // Atomically increment view_count and return the updated row
    const result = await db.query(
      `UPDATE articles SET view_count = view_count + 1
       WHERE slug = $1 AND status = 'published'
       RETURNING
         id, title, slug, excerpt, body, cover_image_url,
         youtube_video_id, status, reading_time_minutes,
         view_count, published_at, created_at, author_id, category_id`,
      [slug],
    );

    if (result.rowCount === 0) {
      return next(createError('Article not found', 404));
    }

    const article = result.rows[0];

    // Fetch related data
    const [authorRow, categoryRow, tagsRow] = await Promise.all([
      db.query('SELECT id, display_name AS name, username AS handle, bio, avatar_url, role, expertise FROM users WHERE id = $1', [
        article.author_id,
      ]),
      article.category_id
        ? db.query('SELECT id, name, slug FROM categories WHERE id = $1', [article.category_id])
        : Promise.resolve({ rows: [null] }),
      db.query(
        `SELECT t.id, t.name, t.slug FROM tags t
         JOIN article_tags at2 ON at2.tag_id = t.id
         WHERE at2.article_id = $1`,
        [article.id],
      ),
    ]);

    res.json({
      ...article,
      author: authorRow.rows[0] ?? null,
      category: categoryRow.rows[0] ?? null,
      tags: tagsRow.rows,
    });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// POST /api/articles  (admin only)
// ---------------------------------------------------------------------------
export const createArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input: CreateArticleInput = req.body;
    const { tag_ids, ...fields } = input;

    const result = await db.query(
      `INSERT INTO articles
         (title, slug, excerpt, body, cover_image_url, youtube_video_id,
          status, reading_time_minutes, author_id, category_id,
          published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
               CASE WHEN $7 = 'published' THEN NOW() ELSE NULL END)
       RETURNING *`,
      [
        fields.title,
        fields.slug,
        fields.excerpt ?? null,
        fields.body,
        fields.cover_image_url ?? null,
        fields.youtube_video_id ?? null,
        fields.status,
        fields.reading_time_minutes,
        fields.author_id,
        fields.category_id ?? null,
      ],
    );

    const article = result.rows[0];

    // Insert tag associations
    if (tag_ids.length > 0) {
      const tagValues = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
      await db.query(
        `INSERT INTO article_tags (article_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
        [article.id, ...tag_ids],
      );
    }

    res.status(201).json(article);
  } catch (err: any) {
    if (err.code === '23505') {
      return next(createError('A slug with that name already exists', 409));
    }
    next(err);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/articles/:id  (admin only)
// ---------------------------------------------------------------------------
export const updateArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const input: UpdateArticleInput = req.body;
    const { tag_ids, ...fields } = input as any;

    // Build SET clause dynamically from provided fields
    const allowed = [
      'title', 'excerpt', 'body', 'cover_image_url', 'youtube_video_id',
      'status', 'reading_time_minutes', 'author_id', 'category_id',
    ] as const;

    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const key of allowed) {
      if (key in fields) {
        params.push(fields[key] ?? null);
        setClauses.push(`${key} = $${params.length}`);
      }
    }

    // Auto-set published_at when transitioning to published
    if (fields.status === 'published') {
      setClauses.push(`published_at = COALESCE(published_at, NOW())`);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    params.push(id);
    const result = await db.query(
      `UPDATE articles SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );

    if (result.rowCount === 0) {
      return next(createError('Article not found', 404));
    }

    // Sync tags if provided
    if (Array.isArray(tag_ids)) {
      await db.query('DELETE FROM article_tags WHERE article_id = $1', [id]);
      if (tag_ids.length > 0) {
        const tagValues = tag_ids.map((_: number, i: number) => `($1, $${i + 2})`).join(', ');
        await db.query(
          `INSERT INTO article_tags (article_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
          [id, ...tag_ids],
        );
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/articles/:id  (admin only) — soft delete → 'archived'
// ---------------------------------------------------------------------------
export const deleteArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    const result = await db.query(
      `UPDATE articles SET status = 'archived' WHERE id = $1 AND status != 'archived' RETURNING id, slug, status`,
      [id],
    );

    if (result.rowCount === 0) {
      return next(createError('Article not found or already archived', 404));
    }

    res.json({ message: 'Article archived', article: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
