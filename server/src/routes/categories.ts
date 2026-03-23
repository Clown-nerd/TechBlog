import { Router } from 'express';
import * as categoriesController from '../controllers/categories';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', categoriesController.getCategories);
router.get('/:slug/articles', categoriesController.getArticlesByCategory);
router.post('/', authenticate, categoriesController.createCategory);

export default router;
