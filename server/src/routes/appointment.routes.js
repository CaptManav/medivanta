import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All appointment routes require authenticated patient
router.use(verifyToken);

router.get('/', appointmentController.getMyAppointments);
router.post('/', validate(appointmentController.bookAppointmentSchema), appointmentController.createAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

export default router;
