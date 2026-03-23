import { Router } from 'express';
import * as articlesController from '../controllers/articles';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { ArticleListQuerySchema, CreateArticleSchema, UpdateArticleSchema } from '../schemas/article.schema';

const router = Router();

// Public
router.get('/', validateQuery(ArticleListQuerySchema), articlesController.getArticles);
router.get('/:slug', articlesController.getArticleBySlug);

// Admin-only
router.post('/', authenticate, validateBody(CreateArticleSchema), articlesController.createArticle);
router.put('/:id', authenticate, validateBody(UpdateArticleSchema), articlesController.updateArticle);
router.delete('/:id', authenticate, articlesController.deleteArticle);

export default router;
