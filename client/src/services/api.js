import axios from 'axios';
import {
  AWARI_ID,
  SAMARTH_ID,
  getStoredHospitals,
  saveStoredHospitals,
  getStoredDoctors,
  saveStoredDoctors,
  getStoredAppointments,
  saveStoredAppointments,
  initialServices,
  initialEmergency,
} from './mockData.js';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medivanta_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback router
const handleMockFallback = async (method, url, data = null) => {
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];
  const queryParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

  // Log fallback in dev
  console.info(`[MEDIVANTA Engine] Serving: ${method.toUpperCase()} ${cleanUrl}`);

  // 1. Hospitals List
  if (method === 'get' && cleanUrl === '/hospitals') {
    let list = getStoredHospitals();
    const taluka = queryParams.get('taluka');
    const is24 = queryParams.get('is_24x7');
    const pmjay = queryParams.get('pmjay');
    const search = queryParams.get('search');

    if (taluka) list = list.filter((h) => h.taluka?.toLowerCase() === taluka.toLowerCase());
    if (is24 === 'true') list = list.filter((h) => h.is_24x7);
    if (pmjay === 'true') list = list.filter((h) => h.pmjay);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.taluka?.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q)
      );
    }
    return { data: { success: true, data: list } };
  }

  // 2. Single Hospital Details
  const singleHospitalMatch = cleanUrl.match(/^\/hospitals\/([a-zA-Z0-9-]+)$/);
  if (method === 'get' && singleHospitalMatch) {
    const id = singleHospitalMatch[1];
    const hospitals = getStoredHospitals();
    const found = hospitals.find((h) => h.id === id) || hospitals[0];
    return { data: { success: true, data: found } };
  }

  // 3. Hospital Doctors
  const hospitalDoctorsMatch = cleanUrl.match(/^\/hospitals\/([a-zA-Z0-9-]+)\/doctors$/);
  if (method === 'get' && hospitalDoctorsMatch) {
    const id = hospitalDoctorsMatch[1];
    const doctors = getStoredDoctors();
    const list = doctors.filter((d) => d.hospital_id === id);
    return { data: { success: true, data: list } };
  }

  // 4. Hospital Services
  const hospitalServicesMatch = cleanUrl.match(/^\/hospitals\/([a-zA-Z0-9-]+)\/services$/);
  if (method === 'get' && hospitalServicesMatch) {
    const id = hospitalServicesMatch[1];
    const svcs = initialServices[id] || [];
    return { data: { success: true, data: svcs } };
  }

  // 5. Hospital Emergency
  const hospitalEmergencyMatch = cleanUrl.match(/^\/hospitals\/([a-zA-Z0-9-]+)\/emergency$/);
  if (method === 'get' && hospitalEmergencyMatch) {
    const id = hospitalEmergencyMatch[1];
    const em = initialEmergency[id] || initialEmergency[SAMARTH_ID];
    return { data: { success: true, data: em } };
  }

  // 6. Global Doctors List
  if (method === 'get' && cleanUrl === '/doctors') {
    const doctors = getStoredDoctors();
    const hospitals = getStoredHospitals();
    const combined = doctors.map((d) => {
      const h = hospitals.find((item) => item.id === d.hospital_id);
      return {
        ...d,
        hospital_name: h?.name || 'Medical Center',
        hospital_taluka: h?.taluka || '',
        hospital_address: h?.address || '',
        hospital_phone: h?.phone || '',
      };
    });
    return { data: { success: true, data: combined } };
  }

  // 7. Patient Login
  if (method === 'post' && cleanUrl === '/auth/login') {
    const user = {
      id: 'aaaaaaaa-0000-0000-0000-000000000002',
      name: data?.email?.split('@')[0] || 'Demo Patient',
      email: data?.email || 'patient@demo.com',
      role: 'patient',
    };
    return {
      data: {
        success: true,
        data: {
          accessToken: 'mock_jwt_token_patient_' + Date.now(),
          user,
        },
      },
    };
  }

  // 8. Staff / Hospital Admin Login
  if (method === 'post' && cleanUrl === '/auth/admin/login') {
    const hospitals = getStoredHospitals();
    const hospital = hospitals.find((h) => h.id === data?.hospitalId) || hospitals[0];
    const admin = {
      id: 'bbbbbbbb-0000-0000-0000-000000000001',
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      email: data?.email || (hospital.id === AWARI_ID ? 'awari@medivanta.in' : 'samarth@medivanta.in'),
      role: 'hospital_admin',
    };
    return {
      data: {
        success: true,
        data: {
          accessToken: 'mock_jwt_token_admin_' + Date.now(),
          admin,
        },
      },
    };
  }

  // 9. Signup
  if (method === 'post' && cleanUrl === '/auth/signup') {
    const user = {
      id: 'usr_' + Date.now(),
      name: data?.name || 'New Patient',
      email: data?.email || 'patient@example.com',
      phone: data?.phone || '',
      role: 'patient',
    };
    return {
      data: {
        success: true,
        data: {
          accessToken: 'mock_jwt_token_patient_' + Date.now(),
          user,
        },
      },
    };
  }

  // 10. Admin: Get Beds
  if (method === 'get' && cleanUrl === '/admin/beds') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const hospitals = getStoredHospitals();
    const h = hospitals.find((item) => item.id === hospitalId) || hospitals[0];
    return {
      data: {
        success: true,
        data: {
          general_avail: h.general_avail,
          general_total: h.general_total,
          icu_avail: h.icu_avail,
          icu_total: h.icu_total,
          vent_avail: h.vent_avail,
          vent_total: h.vent_total,
          emergency_beds: h.emergency_beds,
          oxygen_beds: h.oxygen_beds,
          isolation_beds: h.isolation_beds,
          updated_at: h.beds_updated_at || new Date().toISOString(),
        },
      },
    };
  }

  // 11. Admin: Update Beds
  if (method === 'patch' && cleanUrl === '/admin/beds') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const hospitals = getStoredHospitals();
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          ...data,
          beds_updated_at: new Date().toISOString(),
        };
      }
      return h;
    });
    saveStoredHospitals(updated);
    const curr = updated.find((h) => h.id === hospitalId);
    return {
      data: {
        success: true,
        data: {
          ...data,
          updated_at: curr.beds_updated_at,
        },
      },
    };
  }

  // 12. Admin: Get Doctors
  if (method === 'get' && cleanUrl === '/admin/doctors') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const docs = getStoredDoctors().filter((d) => d.hospital_id === hospitalId);
    return { data: { success: true, data: docs } };
  }

  // 13. Admin: Update Doctor Status
  const docStatusMatch = cleanUrl.match(/^\/admin\/doctors\/([a-zA-Z0-9-]+)\/status$/);
  if (method === 'patch' && docStatusMatch) {
    const docId = docStatusMatch[1];
    const doctors = getStoredDoctors();
    const updated = doctors.map((d) => (d.id === docId ? { ...d, current_status: data.status } : d));
    saveStoredDoctors(updated);
    return { data: { success: true, data: { doctorId: docId, status: data.status } } };
  }

  // 14. Admin: Add Doctor
  if (method === 'post' && cleanUrl === '/admin/doctors') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const doctors = getStoredDoctors();
    const newDoc = {
      id: 'doc_' + Date.now(),
      hospital_id: hospitalId,
      name: data.name,
      qualification: data.qualification,
      specialization: data.specialization,
      appointment_required: data.appointmentRequired || false,
      current_status: 'in_opd',
      opd_schedules: [],
    };
    doctors.push(newDoc);
    saveStoredDoctors(doctors);
    return { data: { success: true, data: newDoc } };
  }

  // 15. Admin: Edit Doctor
  const editDocMatch = cleanUrl.match(/^\/admin\/doctors\/([a-zA-Z0-9-]+)$/);
  if (method === 'put' && editDocMatch) {
    const docId = editDocMatch[1];
    const doctors = getStoredDoctors();
    const updated = doctors.map((d) =>
      d.id === docId
        ? {
            ...d,
            name: data.name,
            qualification: data.qualification,
            specialization: data.specialization,
            appointment_required: data.appointmentRequired,
          }
        : d
    );
    saveStoredDoctors(updated);
    return { data: { success: true, data: updated.find((d) => d.id === docId) } };
  }

  // 16. Admin: Delete Doctor
  if (method === 'delete' && editDocMatch) {
    const docId = editDocMatch[1];
    const doctors = getStoredDoctors().filter((d) => d.id !== docId);
    saveStoredDoctors(doctors);
    return { data: { success: true, message: 'Deleted' } };
  }

  // 17. Admin: Update Hospital Profile
  if (method === 'put' && cleanUrl === '/admin/profile') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const hospitals = getStoredHospitals();
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          name: data.name || h.name,
          address: data.address || h.address,
          phone: data.phone || h.phone,
          alt_phone: data.altPhone || h.alt_phone,
          email: data.email || h.email,
          website: data.website || h.website,
          is_24x7: data.is24x7 !== undefined ? data.is24x7 : h.is_24x7,
          pmjay: data.pmjay !== undefined ? data.pmjay : h.pmjay,
          cashless: data.cashless !== undefined ? data.cashless : h.cashless,
        };
      }
      return h;
    });
    saveStoredHospitals(updated);
    return { data: { success: true, data: updated.find((h) => h.id === hospitalId) } };
  }

  // 18. Appointments: Create
  if (method === 'post' && cleanUrl === '/appointments') {
    const appointments = getStoredAppointments();
    const hospitals = getStoredHospitals();
    const doctors = getStoredDoctors();
    const h = hospitals.find((item) => item.id === data.hospitalId);
    const d = doctors.find((item) => item.id === data.doctorId);
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');

    const newApt = {
      id: 'apt-' + Date.now(),
      hospital_id: data.hospitalId,
      hospital_name: h?.name || 'Hospital',
      doctor_id: data.doctorId,
      doctor_name: d?.name || 'Doctor',
      patient_id: user.id || 'patient-demo',
      patient_name: user.name || 'Demo Patient',
      date: data.date,
      slot_or_token: data.slotOrToken || 'Morning OPD',
      notes: data.notes || '',
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    appointments.unshift(newApt);
    saveStoredAppointments(appointments);
    return { data: { success: true, data: newApt } };
  }

  // 19. Appointments: Patient List
  if (method === 'get' && cleanUrl === '/appointments/patient') {
    return { data: { success: true, data: getStoredAppointments() } };
  }

  // 20. Appointments: Admin List
  if (method === 'get' && cleanUrl === '/admin/appointments') {
    const user = JSON.parse(localStorage.getItem('medivanta_user') || '{}');
    const hospitalId = user.hospitalId || AWARI_ID;
    const list = getStoredAppointments().filter((a) => a.hospital_id === hospitalId);
    return { data: { success: true, data: list } };
  }

  // 21. Chatbot query fallback
  if (method === 'post' && cleanUrl === '/chatbot/query') {
    const q = (data?.message || '').toLowerCase();
    let reply = "Hello! I am MediBot. You can ask me about free beds, OPD timings, doctor presence, emergency numbers, or hospital addresses in Sangamner and Junnar.";

    if (q.includes('bed') || q.includes('khali') || q.includes('kiti')) {
      reply = "📊 Live Bed Status:\n• Dr. Awari Hospital (Bota): 10 General Beds, 5 Oxygen Beds\n• Samarth Hospital (Belhe): 85/100 General Beds, 5 ICU Beds, 1 Ventilator available.";
    } else if (q.includes('doctor') || q.includes('opd') || q.includes('dr')) {
      reply = "👨‍⚕️ Doctor Availability:\n• Dr. Ashish Awari (BHMS) at Dr. Awari Hospital: Monday to Saturday, 10 AM-2 PM & 4 PM-8 PM\n• Dr. Ramesh Padekar (General Medicine) at Samarth: Monday to Saturday, 9:30 AM-4:30 PM\n• Dr. Shubhangi Kokate (Panchakarma): Monday to Wednesday, 9 AM-3 PM.";
    } else if (q.includes('emergency') || q.includes('ambulance') || q.includes('call') || q.includes('phone')) {
      reply = "🚨 Emergency Contacts:\n• Dr. Awari Hospital, Bota: 9763245875\n• Samarth Hospital, Belhe: 8624843303\n• 24x7 Ambulance (Samarth): 9561035760\n• National Emergency: 108 / 112";
    } else if (q.includes('bota') || q.includes('address') || q.includes('where') || q.includes('location')) {
      reply = "📍 Hospital Locations:\n• Dr. Awari Hospital: A/P Bota, Taluka Sangamner, Dist. Ahmednagar\n• Samarth Ayurved College Hospital: Nagar-Kalyan Highway, Bangarwadi, Belhe, Tal. Junnar, Dist. Pune.";
    }
    return { data: { success: true, data: { reply, intent: 'auto_reply' } } };
  }

  return { data: { success: true, data: null } };
};

// Safe API wrapper
const api = {
  get: async (url, config) => {
    try {
      const res = await axiosInstance.get(url, config);
      if (typeof res.data === 'string' && res.data.includes('<html')) {
        return await handleMockFallback('get', url);
      }
      return res;
    } catch (err) {
      return await handleMockFallback('get', url);
    }
  },

  post: async (url, data, config) => {
    try {
      const res = await axiosInstance.post(url, data, config);
      if (typeof res.data === 'string' && res.data.includes('<html')) {
        return await handleMockFallback('post', url, data);
      }
      return res;
    } catch (err) {
      return await handleMockFallback('post', url, data);
    }
  },

  put: async (url, data, config) => {
    try {
      const res = await axiosInstance.put(url, data, config);
      if (typeof res.data === 'string' && res.data.includes('<html')) {
        return await handleMockFallback('put', url, data);
      }
      return res;
    } catch (err) {
      return await handleMockFallback('put', url, data);
    }
  },

  patch: async (url, data, config) => {
    try {
      const res = await axiosInstance.patch(url, data, config);
      if (typeof res.data === 'string' && res.data.includes('<html')) {
        return await handleMockFallback('patch', url, data);
      }
      return res;
    } catch (err) {
      return await handleMockFallback('patch', url, data);
    }
  },

  delete: async (url, config) => {
    try {
      const res = await axiosInstance.delete(url, config);
      if (typeof res.data === 'string' && res.data.includes('<html')) {
        return await handleMockFallback('delete', url);
      }
      return res;
    } catch (err) {
      return await handleMockFallback('delete', url);
    }
  },
};

export default api;
