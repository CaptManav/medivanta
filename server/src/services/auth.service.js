import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

/** Generate access + refresh tokens. */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

export const createUser = async (name, email, phone, password) => {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('Email already registered.'), { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
    [name, email, phone, hash, 'patient']
  );
  return result.rows[0];
};

export const loginUser = async (email, password) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }
  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }
  const tokens = generateTokens({ id: user.id, role: user.role, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  };
};

export const loginAdmin = async (hospitalId, email, password) => {
  const result = await query(
    'SELECT * FROM hospital_admins WHERE email = $1 AND hospital_id = $2 AND is_active = TRUE',
    [email, hospitalId]
  );
  if (result.rows.length === 0) {
    throw Object.assign(new Error('Invalid credentials or hospital.'), { status: 401 });
  }
  const admin = result.rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials or hospital.'), { status: 401 });
  }

  const hospital = await query('SELECT name FROM hospitals WHERE id = $1', [hospitalId]);

  const tokens = generateTokens({
    id: admin.id,
    hospitalId: admin.hospital_id,
    email: admin.email,
    role: 'hospital_admin',
  });
  return {
    admin: { id: admin.id, hospitalId: admin.hospital_id, email: admin.email, hospitalName: hospital.rows[0]?.name },
    ...tokens,
  };
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const { id, role, email, hospitalId } = decoded;
    const payload = hospitalId ? { id, role, email, hospitalId } : { id, role, email };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    return { accessToken };
  } catch {
    throw Object.assign(new Error('Invalid refresh token.'), { status: 401 });
  }
};
