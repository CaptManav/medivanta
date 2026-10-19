import { query } from '../config/db.js';

/** List hospitals with optional filters. */
export const listHospitals = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filters.district) {
    conditions.push(`h.district ILIKE $${idx++}`);
    params.push(`%${filters.district}%`);
  }
  if (filters.taluka) {
    conditions.push(`h.taluka ILIKE $${idx++}`);
    params.push(`%${filters.taluka}%`);
  }
  if (filters.type) {
    conditions.push(`h.type = $${idx++}`);
    params.push(filters.type);
  }
  if (filters.is_24x7 === 'true') {
    conditions.push('h.is_24x7 = TRUE');
  }
  if (filters.pmjay === 'true') {
    conditions.push('h.pmjay = TRUE');
  }
  if (filters.icu_available === 'true') {
    conditions.push('b.icu_avail > 0');
  }
  if (filters.search) {
    conditions.push(`(h.name ILIKE $${idx} OR h.address ILIKE $${idx} OR h.district ILIKE $${idx} OR h.taluka ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT h.*, 
           b.general_total, b.general_avail, b.icu_total, b.icu_avail,
           b.vent_total, b.vent_avail, b.updated_at AS beds_updated_at
    FROM hospitals h
    LEFT JOIN bed_status b ON b.hospital_id = h.id
    ${where}
    ORDER BY h.name
  `;

  const result = await query(sql, params);
  return result.rows;
};

/** Get single hospital detail. */
export const getHospitalById = async (id) => {
  const result = await query(
    `SELECT h.*, 
            b.general_total, b.general_avail, b.icu_total, b.icu_avail,
            b.emergency_beds, b.oxygen_beds, b.isolation_beds,
            b.vent_total, b.vent_avail, b.updated_at AS beds_updated_at
     FROM hospitals h
     LEFT JOIN bed_status b ON b.hospital_id = h.id
     WHERE h.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/** Get doctors for a hospital with schedules and live status. */
export const getHospitalDoctors = async (hospitalId) => {
  const doctors = await query(
    `SELECT d.id, d.name, d.qualification, d.specialization, d.appointment_required,
            dep.name AS department,
            ds.status AS current_status, ds.updated_at AS status_updated_at
     FROM doctors d
     LEFT JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN doctor_status ds ON ds.doctor_id = d.id
     WHERE d.hospital_id = $1
     ORDER BY d.name`,
    [hospitalId]
  );

  // Attach OPD schedules to each doctor
  for (const doc of doctors.rows) {
    const schedules = await query(
      'SELECT weekday, start_time, end_time FROM opd_schedules WHERE doctor_id = $1 ORDER BY weekday, start_time',
      [doc.id]
    );
    doc.opd_schedules = schedules.rows;
  }

  return doctors.rows;
};

/** Get bed status for a hospital. */
export const getHospitalBeds = async (hospitalId) => {
  const result = await query('SELECT * FROM bed_status WHERE hospital_id = $1', [hospitalId]);
  return result.rows[0] || null;
};

/** Get services for a hospital. */
export const getHospitalServices = async (hospitalId) => {
  const result = await query(
    'SELECT * FROM hospital_services WHERE hospital_id = $1 ORDER BY category, name',
    [hospitalId]
  );
  return result.rows;
};

/** Get emergency info + ambulances for a hospital. */
export const getHospitalEmergency = async (hospitalId) => {
  const hospital = await query(
    'SELECT id, name, phone, alt_phone, is_24x7 FROM hospitals WHERE id = $1',
    [hospitalId]
  );
  const ambulances = await query(
    'SELECT * FROM ambulances WHERE hospital_id = $1',
    [hospitalId]
  );
  return {
    hospital: hospital.rows[0] || null,
    ambulances: ambulances.rows,
  };
};
