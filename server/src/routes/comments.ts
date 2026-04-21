import { Router } from 'express';
import * as commentsController from '../controllers/comments';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateCommentSchema } from '../schemas/comment.schema';

const router = Router();

// Create a new comment (requires authentication)
router.post('/', authenticate, validateBody(CreateCommentSchema), commentsController.createComment);

export default router;
