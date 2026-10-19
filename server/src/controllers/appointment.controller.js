import { z } from 'zod';
import * as appointmentService from '../services/appointment.service.js';

export const bookAppointmentSchema = z.object({
  hospitalId: z.string().uuid('Valid hospital ID is required'),
  doctorId: z.string().uuid('Valid doctor ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slotOrToken: z.string().optional(),
  notes: z.string().optional(),
});

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getPatientAppointments(req.user.id);
    return res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching appointments' });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { hospitalId, doctorId, date, slotOrToken, notes } = req.body;
    const appointment = await appointmentService.bookAppointment({
      userId: req.user.id,
      hospitalId,
      doctorId,
      date,
      slotOrToken: slotOrToken || 'Token Walk-in',
      notes,
    });
    return res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message || 'Error booking appointment' });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const updated = await appointmentService.cancelAppointment(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: 'Appointment cancelled', data: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message || 'Error cancelling appointment' });
  }
};
