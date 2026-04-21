import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { CreateCommentInput } from '../schemas/comment.schema';
import { createError } from '../middleware/errorHandler';

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input: CreateCommentInput = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return next(createError('Unauthorized', 401));
    }

    // Verify the article exists
    const articleCheck = await db.query(
      'SELECT 1 FROM articles WHERE id = $1',
      [input.article_id]
    );

    if (articleCheck.rowCount === 0) {
      return next(createError('Article not found', 404));
    }

    // If it's a reply, verify parent comment exists and belongs to the same article
    if (input.parent_comment_id) {
      const parentCheck = await db.query(
        'SELECT article_id FROM comments WHERE id = $1',
        [input.parent_comment_id]
      );
      if (parentCheck.rowCount === 0) {
        return next(createError('Parent comment not found', 404));
      }
      if (parentCheck.rows[0].article_id !== input.article_id) {
        return next(createError('Parent comment belongs to a different article', 400));
      }
    }

    const result = await db.query(
      `INSERT INTO comments (article_id, user_id, parent_comment_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, article_id, user_id, parent_comment_id, body, materialized_path, created_at`,
      [
        input.article_id,
        user_id,
        input.parent_comment_id || null,
        input.body,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
