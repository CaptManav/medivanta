import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Verify patient/super_admin JWT token.
 */
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/**
 * Verify hospital admin JWT token.
 */
export const verifyAdminToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.role !== 'hospital_admin') {
      return res.status(403).json({ success: false, error: 'Hospital admin access required.' });
    }
    req.admin = { id: decoded.id, hospitalId: decoded.hospitalId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't fail without one.
 */
export const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
  } catch {
    req.user = null;
  }
  next();
};
