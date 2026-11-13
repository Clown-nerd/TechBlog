import { Router } from 'express';
import * as articlesController from '../controllers/articles';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { ArticleListQuerySchema, CreateArticleSchema, UpdateArticleSchema } from '../schemas/article.schema';

const router = Router();

// Public
router.get('/', validateQuery(ArticleListQuerySchema), articlesController.getArticles);
router.get('/:slug', articlesController.getArticleBySlug);

router.post('/', authenticate, requireRole('admin', 'author'), validateBody(CreateArticleSchema), articlesController.createArticle);
router.put('/:id', authenticate, requireRole('admin', 'author'), validateBody(UpdateArticleSchema), articlesController.updateArticle);
router.delete('/:id', authenticate, requireRole('admin', 'author'), articlesController.deleteArticle);

export default router;
