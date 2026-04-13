import { Router } from 'express';
import * as authController from '../controllers/auth';

const router = Router();

router.post('/', authController.login);

export default router;
