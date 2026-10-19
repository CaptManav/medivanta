import { z } from 'zod';
import * as authService from '../services/auth.service.js';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const adminLoginSchema = z.object({
  hospitalId: z.string().uuid('Valid hospital ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await authService.createUser(name, email, phone, password);
    const loginResult = await authService.loginUser(email, password);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: loginResult,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error during signup',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      error: err.message || 'Authentication failed',
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { hospitalId, email, password } = req.body;
    const result = await authService.loginAdmin(hospitalId, email, password);
    return res.status(200).json({
      success: true,
      message: 'Hospital admin login successful',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      error: err.message || 'Hospital admin authentication failed',
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }
    const result = authService.refreshAccessToken(refreshToken);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 401).json({ success: false, error: err.message });
  }
};
