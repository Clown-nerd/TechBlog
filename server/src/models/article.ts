import db from '../db';

// This is an example of raw pg models without an ORM

export interface Article {
  id?: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  category_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export const findAll = async (): Promise<Article[]> => {
  const result = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
  return result.rows;
};

export const findById = async (id: number): Promise<Article | null> => {
  const result = await db.query('SELECT * FROM articles WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const create = async (article: Article): Promise<Article> => {
  const { title, slug, content, author_id, category_id } = article;
  const result = await db.query(
    `INSERT INTO articles (title, slug, content, author_id, category_id) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, slug, content, author_id, category_id]
  );
  return result.rows[0];
};

export default {
  findAll,
  findById,
  create,
};
