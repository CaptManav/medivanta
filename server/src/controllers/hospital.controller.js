import * as hospitalService from '../services/hospital.service.js';

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalService.listHospitals(req.query);
    return res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching hospitals' });
  }
};

export const getHospital = async (req, res) => {
  try {
    const hospital = await hospitalService.getHospitalById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }
    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching hospital' });
  }
};

export const getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await hospitalService.getHospitalDoctors(req.params.id);
    return res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching doctors' });
  }
};

export const getHospitalBeds = async (req, res) => {
  try {
    const beds = await hospitalService.getHospitalBeds(req.params.id);
    if (!beds) {
      return res.status(404).json({ success: false, error: 'Bed information not found for this hospital' });
    }
    return res.status(200).json({ success: true, data: beds });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching bed status' });
  }
};

export const getHospitalServices = async (req, res) => {
  try {
    const services = await hospitalService.getHospitalServices(req.params.id);
    return res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching services' });
  }
};

export const getHospitalEmergency = async (req, res) => {
  try {
    const emergencyInfo = await hospitalService.getHospitalEmergency(req.params.id);
    return res.status(200).json({ success: true, data: emergencyInfo });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error fetching emergency details' });
  }
};
