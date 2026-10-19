import { z } from 'zod';
import * as superService from '../services/super.service.js';

export const onboardHospitalSchema = z.object({
  name: z.string().min(2, 'Hospital name is required'),
  type: z.enum(['private', 'government', 'trust', 'college']),
  address: z.string().min(5, 'Address is required'),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  is24x7: z.boolean().optional(),
  pmjay: z.boolean().optional(),
  cashless: z.boolean().optional(),
  consentDemo: z.boolean().optional(),
  consentLogo: z.boolean().optional(),
});

export const createAdminSchema = z.object({
  hospitalId: z.string().uuid('Valid hospital ID required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const onboard = async (req, res) => {
  try {
    const hospital = await superService.onboardHospital(req.body);
    return res.status(201).json({ success: true, message: 'Hospital onboarded successfully', data: hospital });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { hospitalId, email, password } = req.body;
    const admin = await superService.createAdmin(hospitalId, email, password);
    return res.status(201).json({ success: true, message: 'Hospital admin account created', data: admin });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};
