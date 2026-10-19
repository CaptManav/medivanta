import bcrypt from 'bcryptjs';
import { query, getClient } from '../config/db.js';

/** Onboard a new hospital — creates hospital + bed_status row. */
export const onboardHospital = async (data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const hospital = await client.query(
      `INSERT INTO hospitals (name, type, address, taluka, district, state, lat, lng, phone, alt_phone, email, website, is_24x7, pmjay, cashless, consent_demo, consent_logo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [data.name, data.type, data.address, data.taluka, data.district, data.state || 'Maharashtra',
       data.lat, data.lng, data.phone, data.altPhone, data.email, data.website,
       data.is24x7 || false, data.pmjay || false, data.cashless || false,
       data.consentDemo || false, data.consentLogo || false]
    );

    await client.query(
      'INSERT INTO bed_status (hospital_id) VALUES ($1)',
      [hospital.rows[0].id]
    );

    await client.query('COMMIT');
    return hospital.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/** Create admin account for a hospital. */
export const createAdmin = async (hospitalId, email, password) => {
  const existing = await query('SELECT id FROM hospital_admins WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('Admin email already exists.'), { status: 409 });
  }
  const hospital = await query('SELECT id FROM hospitals WHERE id = $1', [hospitalId]);
  if (hospital.rows.length === 0) {
    throw Object.assign(new Error('Hospital not found.'), { status: 404 });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO hospital_admins (hospital_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, hospital_id, email, is_active, created_at',
    [hospitalId, email, hash]
  );
  return result.rows[0];
};
