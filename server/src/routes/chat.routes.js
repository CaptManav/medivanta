import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Chat is accessible to everyone; optionalAuth captures userId if logged in
router.post('/', apiLimiter, optionalAuth, chatController.chat);

export default router;
