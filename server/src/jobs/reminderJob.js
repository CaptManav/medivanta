import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Send email reminder for an appointment.
 */
const sendReminder = async (appointment) => {
  if (!transporter || !appointment.patient_email) {
    console.log(`[Reminder Skipped] Email: ${appointment.patient_email}, Appt: ${appointment.id}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"MEDIVANTA Healthcare" <${env.SMTP_USER}>`,
      to: appointment.patient_email,
      subject: `Appointment Reminder: ${appointment.hospital_name} Today`,
      text: `Hello ${appointment.patient_name},\n\nThis is a reminder for your appointment today with Dr. ${appointment.doctor_name} at ${appointment.hospital_name}.\nToken/Slot: ${appointment.slot_or_token || 'Walk-in'}\n\nPlease arrive on time. For emergencies, call 108.\n\nTeam MEDIVANTA`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0d9488;">MEDIVANTA Appointment Reminder</h2>
          <p>Hello <strong>${appointment.patient_name}</strong>,</p>
          <p>You have a scheduled appointment today:</p>
          <ul>
            <li><strong>Hospital:</strong> ${appointment.hospital_name}</li>
            <li><strong>Doctor:</strong> Dr. ${appointment.doctor_name} (${appointment.specialization || 'General'})</li>
            <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
            <li><strong>Slot/Token:</strong> ${appointment.slot_or_token || 'Walk-in Consultation'}</li>
          </ul>
          <p>Please arrive at least 15 minutes before your scheduled window.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Emergency Helpline: 108 / 112</p>
        </div>
      `,
    });
    console.log(`[Reminder Sent] Email: ${appointment.patient_email}, Appt: ${appointment.id}`);
  } catch (err) {
    console.error(`[Reminder Failed] Error sending to ${appointment.patient_email}:`, err.message);
  }
};

/**
 * Setup daily cron job at 08:00 AM.
 */
export const setupJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron Job] Checking today\'s confirmed appointments for reminders...');
    try {
      const res = await query(`
        SELECT a.id, a.date, a.slot_or_token,
               u.name AS patient_name, u.email AS patient_email,
               d.name AS doctor_name, d.specialization,
               h.name AS hospital_name
        FROM appointments a
        JOIN users u ON u.id = a.user_id
        JOIN doctors d ON d.id = a.doctor_id
        JOIN hospitals h ON h.id = a.hospital_id
        WHERE a.date = CURRENT_DATE AND a.status = 'confirmed'
      `);

      for (const appt of res.rows) {
        await sendReminder(appt);
      }
    } catch (err) {
      console.error('[Cron Job Error] Failed to process appointment reminders:', err.message);
    }
  });

  console.log('✓ Scheduled appointment reminder cron job (Runs daily at 08:00 AM)');
};
