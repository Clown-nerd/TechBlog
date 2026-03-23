import { Router } from 'express';
import * as embedsController from '../controllers/embeds';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', embedsController.getEmbeds);
router.post('/', authenticate, embedsController.createEmbed);

export default router;
