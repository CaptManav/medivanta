import { query } from '../config/db.js';

/** Get all appointments for a patient. */
export const getPatientAppointments = async (userId) => {
  const result = await query(
    `SELECT a.*, d.name AS doctor_name, d.specialization, h.name AS hospital_name
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     JOIN hospitals h ON h.id = a.hospital_id
     WHERE a.user_id = $1
     ORDER BY a.date DESC, a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

/** Book an appointment. */
export const bookAppointment = async ({ userId, doctorId, hospitalId, date, slotOrToken, notes }) => {
  // Check doctor belongs to hospital
  const doc = await query('SELECT id FROM doctors WHERE id = $1 AND hospital_id = $2', [doctorId, hospitalId]);
  if (doc.rows.length === 0) {
    throw Object.assign(new Error('Doctor not found in this hospital.'), { status: 404 });
  }

  // Check for duplicate booking
  const dup = await query(
    `SELECT id FROM appointments 
     WHERE user_id = $1 AND doctor_id = $2 AND date = $3 AND status IN ('pending', 'confirmed')`,
    [userId, doctorId, date]
  );
  if (dup.rows.length > 0) {
    throw Object.assign(new Error('You already have a booking with this doctor on this date.'), { status: 409 });
  }

  const result = await query(
    `INSERT INTO appointments (user_id, doctor_id, hospital_id, date, slot_or_token, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, doctorId, hospitalId, date, slotOrToken, notes]
  );
  return result.rows[0];
};

/** Cancel an appointment (patient — must own it). */
export const cancelAppointment = async (appointmentId, userId) => {
  const appt = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
  if (appt.rows.length === 0) {
    throw Object.assign(new Error('Appointment not found.'), { status: 404 });
  }
  if (appt.rows[0].user_id !== userId) {
    throw Object.assign(new Error('You can only cancel your own appointments.'), { status: 403 });
  }
  if (appt.rows[0].status === 'cancelled' || appt.rows[0].status === 'completed') {
    throw Object.assign(new Error('This appointment cannot be cancelled.'), { status: 400 });
  }

  const result = await query(
    "UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
    [appointmentId]
  );
  return result.rows[0];
};
