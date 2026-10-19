import { Router } from 'express';
import * as superController from '../controllers/super.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Only super_admin can onboard hospitals or provision new hospital admins
router.use(verifyToken, requireRole('super_admin'));

router.post('/hospitals', validate(superController.onboardHospitalSchema), superController.onboard);
router.post('/admins', validate(superController.createAdminSchema), superController.createAdmin);

export default router;
