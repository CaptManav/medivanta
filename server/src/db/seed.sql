-- ============================================================
-- MEDIVANTA — Seed Data
-- Source: Survey forms from Dr. Awari Hospital and Samarth
--         Ayurved College Hospital & Research Centre
-- ============================================================
-- Default passwords (bcrypt hash of 'admin123'):
--   $2a$10$XQCg1z4YX1J5MzGMKOYLiOQm8VJ0VPxJZGRMzWBK5e9R1xGHJKdFe
-- Default patient password (bcrypt hash of 'patient123'):
--   $2a$10$RqH5b3B8Z5F5J7N2L1K4AeWV5V0VX1JZGRMzWBK5e9R1xGHJKdABC

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, name) VALUES
    (1, 'General Medicine'),
    (2, 'Ayurveda'),
    (3, 'Homeopathy'),
    (4, 'Surgery'),
    (5, 'Pediatrics'),
    (6, 'Gynecology'),
    (7, 'Orthopedics'),
    (8, 'ENT'),
    (9, 'Dermatology'),
    (10, 'Ophthalmology'),
    (11, 'Panchakarma'),
    (12, 'Emergency Medicine');

-- ============================================================
-- 2. HOSPITALS
-- ============================================================

-- Dr. Awari Hospital — small private clinic, Sangamner
INSERT INTO hospitals (
    id, name, type, address, taluka, district, state,
    lat, lng, phone, alt_phone, email, website,
    is_24x7, pmjay, cashless, consent_demo, consent_logo
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'Dr. Awari Hospital',
    'private',
    'A/P Bota, Tal. Sangamner, Ahmednagar, Maharashtra 422605',
    'Sangamner',
    'Ahmednagar',
    'Maharashtra',
    19.3496, 74.0863,
    '9763245875', '9763245875', NULL, NULL,
    FALSE, FALSE, FALSE, TRUE, TRUE
);

-- Samarth Ayurved College Hospital — 100-bed college hospital, Junnar
INSERT INTO hospitals (
    id, name, type, address, taluka, district, state,
    lat, lng, phone, alt_phone, email, website,
    is_24x7, pmjay, cashless, consent_demo, consent_logo
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'Samarth Ayurved College Hospital & Research Centre',
    'college',
    'Nagar-Kalyan Highway, Bangarwadi, Belhe, Tal. Junnar, Pune, Maharashtra 412410',
    'Junnar',
    'Pune',
    'Maharashtra',
    19.2277, 73.8567,
    '8624843303', '9867253399', 'samarth.aayurvedic123@gmail.com', NULL,
    TRUE, TRUE, FALSE, TRUE, TRUE
);

-- ============================================================
-- 3. HOSPITAL_DEPARTMENTS
-- ============================================================
-- Awari: Homeopathy, General Medicine
INSERT INTO hospital_departments (hospital_id, department_id) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 1),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 3);

-- Samarth: Ayurveda, General Medicine, Surgery, Panchakarma, Emergency
INSERT INTO hospital_departments (hospital_id, department_id) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 1),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 2),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 4),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 11),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 12);

-- ============================================================
-- 4. DOCTORS
-- ============================================================

-- Awari: Dr. Ashish Awari (BHMS)
INSERT INTO doctors (
    id, hospital_id, department_id, name, qualification, specialization, appointment_required
) VALUES (
    'dddddddd-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    3,
    'Dr. Ashish Awari',
    'BHMS',
    'Homeopathy & General Medicine',
    FALSE
);

-- Samarth: Doctor 1 — Dr. Ramesh Padekar (Senior Ayurved Physician & Dy Superintendent)
INSERT INTO doctors (
    id, hospital_id, department_id, name, qualification, specialization, appointment_required
) VALUES (
    'dddddddd-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    2,
    'Dr. Ramesh Padekar',
    'BAMS, MD (Ayurveda)',
    'Kayachikitsa (General Medicine)',
    FALSE
);

-- Samarth: Doctor 2 — Dr. Rawal Gunjal (General Surgery)
INSERT INTO doctors (
    id, hospital_id, department_id, name, qualification, specialization, appointment_required
) VALUES (
    'dddddddd-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    4,
    'Dr. Rawal Gunjal',
    'BAMS, MS (Shalya Tantra)',
    'Shalya Tantra (Surgery)',
    FALSE
);

-- Samarth: Doctor 3 — Dr. Shubhangi Kokate (Panchakarma)
INSERT INTO doctors (
    id, hospital_id, department_id, name, qualification, specialization, appointment_required
) VALUES (
    'dddddddd-4444-4444-4444-444444444444',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    11,
    'Dr. Shubhangi Kokate',
    'BAMS, MD (Kayachikitsa)',
    'Panchakarma',
    FALSE
);

-- ============================================================
-- 5. OPD_SCHEDULES
-- ============================================================

-- Awari: Mon–Sat (weekday 1–6), two sessions: 10:00–14:00 and 16:00–20:00
INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES
    -- Monday
    ('dddddddd-1111-1111-1111-111111111111', 1, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 1, '16:00', '20:00'),
    -- Tuesday
    ('dddddddd-1111-1111-1111-111111111111', 2, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 2, '16:00', '20:00'),
    -- Wednesday
    ('dddddddd-1111-1111-1111-111111111111', 3, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 3, '16:00', '20:00'),
    -- Thursday
    ('dddddddd-1111-1111-1111-111111111111', 4, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 4, '16:00', '20:00'),
    -- Friday
    ('dddddddd-1111-1111-1111-111111111111', 5, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 5, '16:00', '20:00'),
    -- Saturday
    ('dddddddd-1111-1111-1111-111111111111', 6, '10:00', '14:00'),
    ('dddddddd-1111-1111-1111-111111111111', 6, '16:00', '20:00');

-- Samarth Senior Physician: Mon–Sat, 09:30–16:30
INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES
    ('dddddddd-2222-2222-2222-222222222222', 1, '09:30', '16:30'),
    ('dddddddd-2222-2222-2222-222222222222', 2, '09:30', '16:30'),
    ('dddddddd-2222-2222-2222-222222222222', 3, '09:30', '16:30'),
    ('dddddddd-2222-2222-2222-222222222222', 4, '09:30', '16:30'),
    ('dddddddd-2222-2222-2222-222222222222', 5, '09:30', '16:30'),
    ('dddddddd-2222-2222-2222-222222222222', 6, '09:30', '16:30');

-- Samarth Surgeon: Mon–Fri, 10:00–15:00
INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES
    ('dddddddd-3333-3333-3333-333333333333', 1, '10:00', '15:00'),
    ('dddddddd-3333-3333-3333-333333333333', 2, '10:00', '15:00'),
    ('dddddddd-3333-3333-3333-333333333333', 3, '10:00', '15:00'),
    ('dddddddd-3333-3333-3333-333333333333', 4, '10:00', '15:00'),
    ('dddddddd-3333-3333-3333-333333333333', 5, '10:00', '15:00');

-- Samarth Panchakarma: Mon–Sat, 09:00–13:00
INSERT INTO opd_schedules (doctor_id, weekday, start_time, end_time) VALUES
    ('dddddddd-4444-4444-4444-444444444444', 1, '09:00', '13:00'),
    ('dddddddd-4444-4444-4444-444444444444', 2, '09:00', '13:00'),
    ('dddddddd-4444-4444-4444-444444444444', 3, '09:00', '13:00'),
    ('dddddddd-4444-4444-4444-444444444444', 4, '09:00', '13:00'),
    ('dddddddd-4444-4444-4444-444444444444', 5, '09:00', '13:00'),
    ('dddddddd-4444-4444-4444-444444444444', 6, '09:00', '13:00');

-- ============================================================
-- 6. DOCTOR_STATUS (initial — all not in OPD)
-- ============================================================
INSERT INTO doctor_status (doctor_id, status) VALUES
    ('dddddddd-1111-1111-1111-111111111111', 'not_in_opd'),
    ('dddddddd-2222-2222-2222-222222222222', 'not_in_opd'),
    ('dddddddd-3333-3333-3333-333333333333', 'not_in_opd'),
    ('dddddddd-4444-4444-4444-444444444444', 'not_in_opd');

-- ============================================================
-- 7. BED_STATUS
-- ============================================================

-- Awari: 10 general beds, no ICU, no ventilators
INSERT INTO bed_status (
    hospital_id, general_total, general_avail,
    icu_total, icu_avail, emergency_beds, oxygen_beds,
    isolation_beds, vent_total, vent_avail
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    10, 7,
    0, 0, 0, 0,
    0, 0, 0
);

-- Samarth: 100 general beds, 5 ICU, 1 ventilator
INSERT INTO bed_status (
    hospital_id, general_total, general_avail,
    icu_total, icu_avail, emergency_beds, oxygen_beds,
    isolation_beds, vent_total, vent_avail
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    100, 72,
    5, 3, 5, 10,
    4, 1, 1
);

-- ============================================================
-- 8. AMBULANCES
-- ============================================================

-- Samarth: 1 BLS ambulance
INSERT INTO ambulances (hospital_id, type, contact, is_24x7) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'BLS', '9561035760', TRUE);

-- ============================================================
-- 9. HOSPITAL_SERVICES
-- ============================================================

-- Awari services
INSERT INTO hospital_services (hospital_id, category, name, timing, notes) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'facility', 'General Consultation', 'Mon–Sat 10:00–14:00, 16:00–20:00', NULL),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'facility', 'Inpatient Care', 'As available', '10-bed facility');

-- Samarth services
INSERT INTO hospital_services (hospital_id, category, name, timing, notes) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'pharmacy',    'Pharmacy',                '24×7',                       'In-house pharmacy'),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'facility',    'Emergency Department',     '24×7',                       'Round-the-clock emergency care'),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'facility',    'ICU',                      '24×7',                       '5-bed ICU with 1 ventilator'),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'facility',    'Panchakarma Centre',       'Mon–Sat 09:00–13:00',        NULL),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'insurance',   'PM-JAY (Ayushman Bharat)', 'During admission',           'Cashless not available'),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'diagnostic',  'Pathology Lab',            'Mon–Sat 08:00–16:00',        'Basic lab tests'),
    ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'facility',    'Ambulance Service',        '24×7',                       '1 BLS ambulance');

-- ============================================================
-- 10. DEMO ACCOUNTS
-- ============================================================

-- Super admin (email: admin@medivanta.in / password: admin123)
-- bcrypt hash generated with 10 rounds
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'MEDIVANTA Admin',
    'admin@medivanta.in',
    NULL,
    '$2a$10$SNPuyW4L7GxLYMsi8nkrqOxbPbvtKJGdhfJY/zknPdAi/lM0QlLgO',
    'super_admin'
);

-- Demo patient (email: patient@demo.com / password: patient123)
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Demo Patient',
    'patient@demo.com',
    '9876543210',
    '$2a$10$ahvQ77njplT7fX2srd3dQuu6KdG5EMV9wGA61k8YmGhnFXn7O75h2',
    'patient'
);

-- Hospital admin: Awari (email: awari@medivanta.in / password: admin123)
INSERT INTO hospital_admins (id, hospital_id, email, password_hash, is_active) VALUES (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'awari@medivanta.in',
    '$2a$10$SNPuyW4L7GxLYMsi8nkrqOxbPbvtKJGdhfJY/zknPdAi/lM0QlLgO',
    TRUE
);

-- Hospital admin: Samarth (email: samarth@medivanta.in / password: admin123)
INSERT INTO hospital_admins (id, hospital_id, email, password_hash, is_active) VALUES (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'samarth@medivanta.in',
    '$2a$10$SNPuyW4L7GxLYMsi8nkrqOxbPbvtKJGdhfJY/zknPdAi/lM0QlLgO',
    TRUE
);
