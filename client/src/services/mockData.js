// MEDIVANTA — Mock / Offline Fallback Engine & Real Survey Data
// Provides high-fidelity real survey data for Dr. Awari Hospital and Samarth Hospital
// Persists local modifications to localStorage so changes reflect immediately across the app!

const AWARI_ID = 'a1b2c3d4-e5f6-7890-abcd-111111111111';
const SAMARTH_ID = 'a1b2c3d4-e5f6-7890-abcd-222222222222';

const initialHospitals = [
  {
    id: AWARI_ID,
    name: 'Dr. Awari Hospital',
    type: 'private',
    address: 'A/P Bota, Tal. Sangamner, Ahmednagar, Maharashtra 422605',
    taluka: 'Sangamner',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    lat: 19.3496,
    lng: 74.0863,
    phone: '9763245875',
    alt_phone: '9763245875',
    email: 'awari@medivanta.in',
    website: null,
    is_24x7: false,
    pmjay: false,
    cashless: false,
    consent_demo: true,
    consent_logo: true,
    general_total: 10,
    general_avail: 10,
    icu_total: 0,
    icu_avail: 0,
    vent_total: 0,
    vent_avail: 0,
    emergency_beds: 1,
    oxygen_beds: 5,
    isolation_beds: 0,
    beds_updated_at: new Date().toISOString(),
    primary_photo: '/photos/awari/dr_awari_consultation.jpeg',
    photos: [
      {
        url: '/photos/awari/dr_awari_consultation.jpeg',
        title: 'Dr. Ashish Awari (BHMS) Consultation Room',
        caption: 'Dr. Ashish Awari at consultation desk in Dr. Awari Hospital, Bota, Sangamner.',
        category: 'Doctor & Consultation',
        date: 'October 2026',
      },
    ],
  },
  {
    id: SAMARTH_ID,
    name: 'Samarth Ayurved College Hospital & Research Centre',
    type: 'college',
    address: 'Nagar-Kalyan Highway, Bangarwadi, Belhe, Tal. Junnar, Pune, Maharashtra 412410',
    taluka: 'Junnar',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 19.2277,
    lng: 73.8567,
    phone: '8624843303',
    alt_phone: '9867253399',
    email: 'samarth.aayurvedic123@gmail.com',
    website: 'https://samarthhospital.org',
    is_24x7: true,
    pmjay: true,
    cashless: false,
    consent_demo: true,
    consent_logo: true,
    general_total: 100,
    general_avail: 85,
    icu_total: 5,
    icu_avail: 5,
    vent_total: 1,
    vent_avail: 1,
    emergency_beds: 2,
    oxygen_beds: 7,
    isolation_beds: 4,
    beds_updated_at: new Date().toISOString(),
    primary_photo: '/photos/samarth/samarth_building_entrance.jpeg',
    photos: [
      {
        url: '/photos/samarth/samarth_building_entrance.jpeg',
        title: 'Samarth Hospital Campus & Main Entrance',
        caption: 'Front view of Samarth Ayurved College Hospital & Research Centre, Belhe campus on Kalyan-Nagar Highway.',
        category: 'Campus Building',
        date: 'October 2026',
      },
      {
        url: '/photos/samarth/samarth_reception_board.jpeg',
        title: 'Hospital Reception Counter & Welcome Board',
        caption: 'Reception counter showing official signboard: समर्थ हॉस्पिटल अँड रिसर्च सेंटर, बेल्हे (Direct Appointment Line: 8624843303).',
        category: 'Reception & Helpdesk',
        date: 'October 2026',
      },
      {
        url: '/photos/samarth/samarth_reception_desk.jpeg',
        title: 'Reception Registration & Patient Intake',
        caption: 'Hospital reception staff registering patients and coordinating OPD tokens.',
        category: 'Patient Care Desk',
        date: 'October 2026',
      },
      {
        url: '/photos/samarth/dr_ramesh_padekar.jpeg',
        title: 'Dr. Ramesh Padekar (M.O. & Deputy Superintendent)',
        caption: 'Dr. Ramesh Padekar (Senior Physician) with medical officers in hospital consultation chamber.',
        category: 'Physicians & Doctors',
        date: 'October 2026',
      },
      {
        url: '/photos/samarth/samarth_admin_office.jpeg',
        title: 'Administrative Office & Records Section',
        caption: 'Hospital administration desk managing bed admissions, PM-JAY documentation, and hospital operations.',
        category: 'Administration',
        date: 'October 2026',
      },
    ],
  },
];

const initialDoctors = [
  {
    id: 'dddddddd-1111-1111-1111-111111111111',
    hospital_id: AWARI_ID,
    department_id: 3,
    name: 'Dr. Ashish Awari',
    qualification: 'BHMS',
    specialization: 'Homeopathy & General Medicine',
    appointment_required: false,
    current_status: 'in_opd',
    phone: '9763245875',
    photo: '/photos/awari/dr_awari_consultation.jpeg',
    opd_schedules: [
      { weekday: 1, start_time: '10:00', end_time: '14:00' },
      { weekday: 1, start_time: '16:00', end_time: '20:00' },
      { weekday: 2, start_time: '10:00', end_time: '14:00' },
      { weekday: 2, start_time: '16:00', end_time: '20:00' },
      { weekday: 3, start_time: '10:00', end_time: '14:00' },
      { weekday: 3, start_time: '16:00', end_time: '20:00' },
      { weekday: 4, start_time: '10:00', end_time: '14:00' },
      { weekday: 4, start_time: '16:00', end_time: '20:00' },
      { weekday: 5, start_time: '10:00', end_time: '14:00' },
      { weekday: 5, start_time: '16:00', end_time: '20:00' },
      { weekday: 6, start_time: '10:00', end_time: '14:00' },
      { weekday: 6, start_time: '16:00', end_time: '20:00' },
    ],
  },
  {
    id: 'dddddddd-2222-2222-2222-222222222222',
    hospital_id: SAMARTH_ID,
    department_id: 2,
    name: 'Dr. Ramesh Padekar',
    qualification: 'BAMS, MD (Ayurveda)',
    specialization: 'Kayachikitsa (General Medicine) & Dy Superintendent',
    appointment_required: false,
    current_status: 'in_opd',
    phone: '9867253399',
    photo: '/photos/samarth/dr_ramesh_padekar.jpeg',
    opd_schedules: [
      { weekday: 1, start_time: '09:30', end_time: '16:30' },
      { weekday: 2, start_time: '09:30', end_time: '16:30' },
      { weekday: 3, start_time: '09:30', end_time: '16:30' },
      { weekday: 4, start_time: '09:30', end_time: '16:30' },
      { weekday: 5, start_time: '09:30', end_time: '16:30' },
      { weekday: 6, start_time: '09:30', end_time: '16:30' },
    ],
  },
  {
    id: 'dddddddd-4444-4444-4444-444444444444',
    hospital_id: SAMARTH_ID,
    department_id: 11,
    name: 'Dr. Shubhangi Kokate',
    qualification: 'BAMS, MD (Kayachikitsa)',
    specialization: 'Panchakarma & Medicine',
    appointment_required: false,
    current_status: 'in_opd',
    phone: '8624843303',
    photo: null,
    opd_schedules: [
      { weekday: 1, start_time: '09:00', end_time: '15:00' },
      { weekday: 2, start_time: '09:00', end_time: '15:00' },
      { weekday: 3, start_time: '09:00', end_time: '15:00' },
    ],
  },
  {
    id: 'dddddddd-3333-3333-3333-333333333333',
    hospital_id: SAMARTH_ID,
    department_id: 4,
    name: 'Dr. Rawal Gunjal',
    qualification: 'BAMS, MS (Shalya Tantra)',
    specialization: 'Shalya Tantra (Surgery)',
    appointment_required: false,
    current_status: 'not_in_opd',
    phone: '8624843303',
    photo: null,
    opd_schedules: [
      { weekday: 1, start_time: '10:00', end_time: '15:00' },
      { weekday: 2, start_time: '10:00', end_time: '15:00' },
      { weekday: 3, start_time: '10:00', end_time: '15:00' },
      { weekday: 4, start_time: '10:00', end_time: '15:00' },
      { weekday: 5, start_time: '10:00', end_time: '15:00' },
    ],
  },
  {
    id: 'dddddddd-5555-5555-5555-555555555555',
    hospital_id: SAMARTH_ID,
    department_id: 2,
    name: 'Dr. Velhekar',
    qualification: 'BAMS',
    specialization: 'Ayurveda Consultant',
    appointment_required: false,
    current_status: 'in_opd',
    phone: '8624843303',
    photo: null,
    opd_schedules: [
      { weekday: 1, start_time: '09:00', end_time: '17:00' },
      { weekday: 2, start_time: '09:00', end_time: '17:00' },
      { weekday: 3, start_time: '09:00', end_time: '17:00' },
      { weekday: 4, start_time: '09:00', end_time: '17:00' },
      { weekday: 5, start_time: '09:00', end_time: '17:00' },
      { weekday: 6, start_time: '09:00', end_time: '17:00' },
    ],
  },
  {
    id: 'dddddddd-6666-6666-6666-666666666666',
    hospital_id: SAMARTH_ID,
    department_id: 2,
    name: 'Dr. Gaikwad',
    qualification: 'BAMS',
    specialization: 'Ayurveda Consultant',
    appointment_required: false,
    current_status: 'not_in_opd',
    phone: '8624843303',
    photo: null,
    opd_schedules: [
      { weekday: 1, start_time: '10:00', end_time: '16:00' },
      { weekday: 3, start_time: '10:00', end_time: '16:00' },
      { weekday: 5, start_time: '10:00', end_time: '16:00' },
    ],
  },
];

const initialServices = {
  [AWARI_ID]: [
    { id: 1, category: 'facility', name: 'General Consultation', timing: 'Mon–Sat 10:00–14:00, 16:00–20:00', notes: 'Walk-ins welcome' },
    { id: 2, category: 'facility', name: 'Inpatient Ward', timing: 'Standard Care', notes: '10-bed facility in Bota' },
    { id: 3, category: 'diagnostic', name: 'Blood & Urine Tests', timing: 'Daytime', notes: 'Basic diagnostic testing' },
  ],
  [SAMARTH_ID]: [
    { id: 10, category: 'pharmacy', name: '24×7 In-House Pharmacy', timing: '24×7', notes: 'Contact: 8459576711' },
    { id: 11, category: 'facility', name: 'Emergency Casualty Department', timing: '24×7', notes: 'Direct Emergency Desk: 8624843303' },
    { id: 12, category: 'facility', name: '5-Bed ICU & Ventilator Unit', timing: '24×7', notes: 'Dedicated critical care team' },
    { id: 13, category: 'facility', name: 'Panchakarma Center', timing: 'Mon–Sat 09:00–13:00', notes: 'Classical Ayurvedic therapeutic unit' },
    { id: 14, category: 'insurance', name: 'PM-JAY (Ayushman Bharat)', timing: 'Admission Hours', notes: 'Government scheme enrolled' },
    { id: 15, category: 'diagnostic', name: 'Pathology & Diagnostic Lab', timing: '09:00 - 17:00', notes: 'X-Ray, ECG, Blood & Urine Tests' },
    { id: 16, category: 'facility', name: '24×7 BLS Ambulance Standby', timing: '24×7', notes: 'Driver contact: 9561035760' },
  ],
};

const initialEmergency = {
  [AWARI_ID]: {
    is_24x7: false,
    phone: '9763245875',
    alt_phone: '9763245875',
    ambulances: [],
  },
  [SAMARTH_ID]: {
    is_24x7: true,
    phone: '8624843303',
    alt_phone: '9867253399',
    ambulances: [
      {
        id: 'amb-1',
        type: 'BLS (Basic Life Support)',
        contact: '9561035760',
        is_24x7: true,
      },
    ],
  },
};

// Storage helpers
export const getStoredHospitals = () => {
  try {
    const raw = localStorage.getItem('medivanta_mock_hospitals');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return initialHospitals;
};

export const saveStoredHospitals = (hospitals) => {
  try {
    localStorage.setItem('medivanta_mock_hospitals', JSON.stringify(hospitals));
  } catch (e) {}
};

export const getStoredDoctors = () => {
  try {
    const raw = localStorage.getItem('medivanta_mock_doctors');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return initialDoctors;
};

export const saveStoredDoctors = (doctors) => {
  try {
    localStorage.setItem('medivanta_mock_doctors', JSON.stringify(doctors));
  } catch (e) {}
};

export const getStoredAppointments = () => {
  try {
    const raw = localStorage.getItem('medivanta_mock_appointments');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'apt-001',
      hospital_id: SAMARTH_ID,
      hospital_name: 'Samarth Ayurved College Hospital & Research Centre',
      doctor_id: 'dddddddd-2222-2222-2222-222222222222',
      doctor_name: 'Dr. Ramesh Padekar',
      patient_id: 'aaaaaaaa-0000-0000-0000-000000000002',
      patient_name: 'Demo Patient',
      date: new Date().toISOString().split('T')[0],
      slot_or_token: 'Morning OPD (10:00 - 13:00)',
      notes: 'General health consultation',
      status: 'confirmed',
      created_at: new Date().toISOString(),
    },
  ];
};

export const saveStoredAppointments = (appointments) => {
  try {
    localStorage.setItem('medivanta_mock_appointments', JSON.stringify(appointments));
  } catch (e) {}
};

export {
  AWARI_ID,
  SAMARTH_ID,
  initialHospitals,
  initialDoctors,
  initialServices,
  initialEmergency,
};
