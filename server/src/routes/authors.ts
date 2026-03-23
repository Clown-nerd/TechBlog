import { Router } from 'express';
import * as authorsController from '../controllers/authors';

const router = Router();

router.get('/', authorsController.getAuthors);
router.get('/:id', authorsController.getAuthorById);

export default router;
