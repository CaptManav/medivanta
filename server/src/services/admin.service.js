import { query, getClient } from '../config/db.js';

// ── Bed Status ─────────────────────────────────────────────

/** Get current bed status for admin's hospital. */
export const getBedStatus = async (hospitalId) => {
  const result = await query('SELECT * FROM bed_status WHERE hospital_id = $1', [hospitalId]);
  return result.rows[0] || null;
};

/** Update bed counts. Returns { oldValue, newValue } for audit log. */
export const updateBeds = async (hospitalId, adminId, updates) => {
  const old = await getBedStatus(hospitalId);
  if (!old) {
    throw Object.assign(new Error('Bed status record not found.'), { status: 404 });
  }

  const fields = ['general_total', 'general_avail', 'icu_total', 'icu_avail',
    'emergency_beds', 'oxygen_beds', 'isolation_beds', 'vent_total', 'vent_avail'];
  
  const setClauses = [];
  const params = [];
  let idx = 1;

  for (const field of fields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${idx++}`);
      params.push(updates[field]);
    }
  }

  if (setClauses.length === 0) {
    throw Object.assign(new Error('No fields to update.'), { status: 400 });
  }

  setClauses.push(`updated_at = NOW()`);
  setClauses.push(`updated_by = $${idx++}`);
  params.push(adminId);
  params.push(hospitalId);

  const result = await query(
    `UPDATE bed_status SET ${setClauses.join(', ')} WHERE hospital_id = $${idx} RETURNING *`,
    params
  );

  return { oldValue: old, newValue: result.rows[0] };
};

// ── Doctors ────────────────────────────────────────────────

/** List doctors for admin's hospital. */
export const listDoctors = async (hospitalId) => {
  const result = await query(
    `SELECT d.*, dep.name AS department, ds.status AS current_status
     FROM doctors d
     LEFT JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN doctor_status ds ON ds.doctor_id = d.id
     WHERE d.hospital_id = $1
     ORDER BY d.name`,
    [hospitalId]
  );

  for (const doc of result.rows) {
    const schedules = await query(
      'SELECT id, weekday, start_time, end_time FROM opd_schedules WHERE doctor_id = $1 ORDER BY weekday, start_time',
      [doc.id]
    );
    doc.opd_schedules = schedules.rows;
  }

  return result.rows;
};

/** Add a doctor + initial status. */
export const addDoctor = async (hospitalId, data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO doctors (hospital_id, department_id, name, qualification, specialization, appointment_required)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [hospitalId, data.departmentId, data.name, data.qualification, data.specialization, data.appointmentRequired || false]
    );
    const doctor = result.rows[0];

    await client.query(
      "INSERT INTO doctor_status (doctor_id, status) VALUES ($1, 'not_in_opd')",
      [doctor.id]
    );

    // Insert OPD schedules if provided
    if (data.opdSchedules && data.opdSchedules.length > 0) {
      for (const sched of data.opdSchedules) {
        await client.query(
          'INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [doctor.id, sched.weekday, sched.startTime, sched.endTime]
        );
      }
    }

    await client.query('COMMIT');
    return doctor;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/** Update a doctor (must belong to admin's hospital). */
export const updateDoctor = async (doctorId, hospitalId, data) => {
  const doc = await query('SELECT * FROM doctors WHERE id = $1 AND hospital_id = $2', [doctorId, hospitalId]);
  if (doc.rows.length === 0) {
    throw Object.assign(new Error('Doctor not found.'), { status: 404 });
  }

  const result = await query(
    `UPDATE doctors SET name = $1, qualification = $2, specialization = $3, 
     department_id = $4, appointment_required = $5 WHERE id = $6 RETURNING *`,
    [data.name, data.qualification, data.specialization, data.departmentId, data.appointmentRequired || false, doctorId]
  );

  // Update OPD schedules if provided
  if (data.opdSchedules) {
    await query('DELETE FROM opd_schedules WHERE doctor_id = $1', [doctorId]);
    for (const sched of data.opdSchedules) {
      await query(
        'INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES ($1, $2, $3, $4)',
        [doctorId, sched.weekday, sched.startTime, sched.endTime]
      );
    }
  }

  return { oldValue: doc.rows[0], newValue: result.rows[0] };
};

/** Delete a doctor (must belong to admin's hospital). */
export const deleteDoctor = async (doctorId, hospitalId) => {
  const doc = await query('SELECT * FROM doctors WHERE id = $1 AND hospital_id = $2', [doctorId, hospitalId]);
  if (doc.rows.length === 0) {
    throw Object.assign(new Error('Doctor not found.'), { status: 404 });
  }
  await query('DELETE FROM doctors WHERE id = $1', [doctorId]);
  return doc.rows[0];
};

/** Toggle doctor status. */
export const updateDoctorStatus = async (doctorId, hospitalId, status) => {
  const doc = await query('SELECT id FROM doctors WHERE id = $1 AND hospital_id = $2', [doctorId, hospitalId]);
  if (doc.rows.length === 0) {
    throw Object.assign(new Error('Doctor not found.'), { status: 404 });
  }

  const old = await query('SELECT * FROM doctor_status WHERE doctor_id = $1', [doctorId]);
  const result = await query(
    'UPDATE doctor_status SET status = $1, updated_at = NOW() WHERE doctor_id = $2 RETURNING *',
    [status, doctorId]
  );
  return { oldValue: old.rows[0], newValue: result.rows[0] };
};

// ── Appointments (Admin) ───────────────────────────────────

/** Get today's appointment queue for a hospital. */
export const getAppointmentQueue = async (hospitalId) => {
  const result = await query(
    `SELECT a.*, d.name AS doctor_name, d.specialization, u.name AS patient_name, u.phone AS patient_phone
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users u ON u.id = a.user_id
     WHERE a.hospital_id = $1 AND a.date = CURRENT_DATE
     ORDER BY a.created_at`,
    [hospitalId]
  );
  return result.rows;
};

/** Update appointment status (admin). */
export const updateAppointmentStatus = async (appointmentId, hospitalId, status) => {
  const appt = await query('SELECT * FROM appointments WHERE id = $1 AND hospital_id = $2', [appointmentId, hospitalId]);
  if (appt.rows.length === 0) {
    throw Object.assign(new Error('Appointment not found.'), { status: 404 });
  }
  const result = await query(
    'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, appointmentId]
  );
  return { oldValue: appt.rows[0], newValue: result.rows[0] };
};

// ── Hospital Profile ───────────────────────────────────────

/** Update hospital profile. */
export const updateHospitalProfile = async (hospitalId, data) => {
  const old = await query('SELECT * FROM hospitals WHERE id = $1', [hospitalId]);
  if (old.rows.length === 0) {
    throw Object.assign(new Error('Hospital not found.'), { status: 404 });
  }

  const result = await query(
    `UPDATE hospitals SET name = $1, address = $2, phone = $3, alt_phone = $4, 
     email = $5, website = $6, is_24x7 = $7, pmjay = $8, cashless = $9, updated_at = NOW()
     WHERE id = $10 RETURNING *`,
    [data.name, data.address, data.phone, data.altPhone, data.email, data.website,
     data.is24x7, data.pmjay, data.cashless, hospitalId]
  );

  return { oldValue: old.rows[0], newValue: result.rows[0] };
};

// ── Audit Log ──────────────────────────────────────────────

/** Write an audit log entry. */
export const writeAuditLog = async (adminId, hospitalId, action, oldValue, newValue) => {
  await query(
    'INSERT INTO audit_log (admin_id, hospital_id, action, old_value, new_value) VALUES ($1, $2, $3, $4, $5)',
    [adminId, hospitalId, action, JSON.stringify(oldValue), JSON.stringify(newValue)]
  );
};

/** Get audit log for a hospital. */
export const getAuditLog = async (hospitalId, limit = 50) => {
  const result = await query(
    `SELECT al.*, ha.email AS admin_email
     FROM audit_log al
     JOIN hospital_admins ha ON ha.id = al.admin_id
     WHERE al.hospital_id = $1
     ORDER BY al.created_at DESC
     LIMIT $2`,
    [hospitalId, limit]
  );
  return result.rows;
};
