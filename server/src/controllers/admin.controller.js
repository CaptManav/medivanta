import { z } from 'zod';
import * as adminService from '../services/admin.service.js';
import { emitBedUpdate, emitDoctorStatus } from '../sockets/bedSocket.js';

export const updateBedsSchema = z.object({
  general_total: z.number().int().nonnegative().optional(),
  general_avail: z.number().int().nonnegative().optional(),
  icu_total: z.number().int().nonnegative().optional(),
  icu_avail: z.number().int().nonnegative().optional(),
  emergency_beds: z.number().int().nonnegative().optional(),
  oxygen_beds: z.number().int().nonnegative().optional(),
  isolation_beds: z.number().int().nonnegative().optional(),
  vent_total: z.number().int().nonnegative().optional(),
  vent_avail: z.number().int().nonnegative().optional(),
}).refine((data) => {
  if (data.general_avail !== undefined && data.general_total !== undefined) {
    return data.general_avail <= data.general_total;
  }
  return true;
}, { message: 'Available general beds cannot exceed total general beds' })
.refine((data) => {
  if (data.icu_avail !== undefined && data.icu_total !== undefined) {
    return data.icu_avail <= data.icu_total;
  }
  return true;
}, { message: 'Available ICU beds cannot exceed total ICU beds' })
.refine((data) => {
  if (data.vent_avail !== undefined && data.vent_total !== undefined) {
    return data.vent_avail <= data.vent_total;
  }
  return true;
}, { message: 'Available ventilators cannot exceed total ventilators' });

export const doctorSchema = z.object({
  name: z.string().min(2, 'Doctor name is required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  departmentId: z.number().int().optional(),
  appointmentRequired: z.boolean().optional(),
  opdSchedules: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
});

export const updateDoctorStatusSchema = z.object({
  status: z.enum(['in_opd', 'not_in_opd', 'on_leave']),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
});

// --- Controller Actions ---

export const getBeds = async (req, res) => {
  try {
    const beds = await adminService.getBedStatus(req.admin.hospitalId);
    return res.status(200).json({ success: true, data: beds });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBeds = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const { oldValue, newValue } = await adminService.updateBeds(hospitalId, adminId, req.body);

    // Audit log
    await adminService.writeAuditLog(adminId, hospitalId, 'UPDATE_BED_STATUS', oldValue, newValue);

    // Broadcast live update via Socket.IO
    emitBedUpdate(hospitalId, newValue);

    return res.status(200).json({ success: true, message: 'Beds updated successfully', data: newValue });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await adminService.listDoctors(req.admin.hospitalId);
    return res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const doctor = await adminService.addDoctor(hospitalId, req.body);

    await adminService.writeAuditLog(adminId, hospitalId, 'CREATE_DOCTOR', null, doctor);

    return res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const { oldValue, newValue } = await adminService.updateDoctor(req.params.id, hospitalId, req.body);

    await adminService.writeAuditLog(adminId, hospitalId, 'UPDATE_DOCTOR', oldValue, newValue);

    return res.status(200).json({ success: true, message: 'Doctor updated successfully', data: newValue });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const deleted = await adminService.deleteDoctor(req.params.id, hospitalId);

    await adminService.writeAuditLog(adminId, hospitalId, 'DELETE_DOCTOR', deleted, null);

    return res.status(200).json({ success: true, message: 'Doctor removed successfully' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const setDoctorStatus = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const { oldValue, newValue } = await adminService.updateDoctorStatus(req.params.id, hospitalId, req.body.status);

    await adminService.writeAuditLog(adminId, hospitalId, 'UPDATE_DOCTOR_STATUS', oldValue, newValue);

    // Broadcast doctor status update
    emitDoctorStatus(hospitalId, { doctorId: req.params.id, ...newValue });

    return res.status(200).json({ success: true, message: 'Doctor status updated', data: newValue });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const queue = await adminService.getAppointmentQueue(req.admin.hospitalId);
    return res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const setAppointmentStatus = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const { oldValue, newValue } = await adminService.updateAppointmentStatus(req.params.id, hospitalId, req.body.status);

    await adminService.writeAuditLog(adminId, hospitalId, 'UPDATE_APPOINTMENT_STATUS', oldValue, newValue);

    return res.status(200).json({ success: true, message: 'Appointment status updated', data: newValue });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { hospitalId, id: adminId } = req.admin;
    const { oldValue, newValue } = await adminService.updateHospitalProfile(hospitalId, req.body);

    await adminService.writeAuditLog(adminId, hospitalId, 'UPDATE_HOSPITAL_PROFILE', oldValue, newValue);

    return res.status(200).json({ success: true, message: 'Hospital profile updated', data: newValue });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

export const getAuditLog = async (req, res) => {
  try {
    const logs = await adminService.getAuditLog(req.admin.hospitalId);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
