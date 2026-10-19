import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyAdminToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All admin routes strictly require valid hospital admin token
router.use(verifyAdminToken);

// Beds
router.get('/beds', adminController.getBeds);
router.patch('/beds', validate(adminController.updateBedsSchema), adminController.updateBeds);

// Doctors
router.get('/doctors', adminController.getDoctors);
router.post('/doctors', validate(adminController.doctorSchema), adminController.addDoctor);
router.put('/doctors/:id', validate(adminController.doctorSchema), adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);
router.patch('/doctors/:id/status', validate(adminController.updateDoctorStatusSchema), adminController.setDoctorStatus);

// Appointments
router.get('/appointments', adminController.getAppointments);
router.patch('/appointments/:id', validate(adminController.updateAppointmentStatusSchema), adminController.setAppointmentStatus);

// Profile & Audit
router.put('/profile', adminController.updateProfile);
router.get('/audit-log', adminController.getAuditLog);

export default router;
