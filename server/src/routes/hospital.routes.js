import { Router } from 'express';
import * as hospitalController from '../controllers/hospital.controller.js';

const router = Router();

router.get('/', hospitalController.getHospitals);
router.get('/:id', hospitalController.getHospital);
router.get('/:id/doctors', hospitalController.getHospitalDoctors);
router.get('/:id/beds', hospitalController.getHospitalBeds);
router.get('/:id/services', hospitalController.getHospitalServices);
router.get('/:id/emergency', hospitalController.getHospitalEmergency);

export default router;
