import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/signup', authLimiter, validate(authController.signupSchema), authController.signup);
router.post('/login', authLimiter, validate(authController.loginSchema), authController.login);
router.post('/admin/login', authLimiter, validate(authController.adminLoginSchema), authController.adminLogin);
router.post('/refresh', authController.refresh);

export default router;
