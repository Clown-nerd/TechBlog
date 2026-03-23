import { Router } from 'express';
import * as mediaController from '../controllers/media';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, mediaController.getMedia);
router.post('/upload', authenticate, upload.single('file'), mediaController.uploadMedia);

export default router;
