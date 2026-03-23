import { Router } from 'express';
import { search } from '../controllers/search';
import { validateQuery } from '../middleware/validate';
import { SearchQuerySchema } from '../schemas/search.schema';
import rateLimit from 'express-rate-limit';

const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many search requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get('/', searchRateLimiter, validateQuery(SearchQuerySchema), search);

export default router;
