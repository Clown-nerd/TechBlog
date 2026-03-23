import { Router } from 'express';
import * as subscribersController from '../controllers/subscribers';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { SubscribeSchema } from '../schemas/subscriber.schema';
import rateLimit from 'express-rate-limit';

const subscribeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many subscription requests from this IP.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/', subscribeRateLimiter, validateBody(SubscribeSchema), subscribersController.subscribe);
router.get('/', authenticate, subscribersController.getSubscribers);

export default router;
