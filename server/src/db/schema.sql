-- ============================================================
-- MEDIVANTA — Database Schema
-- PostgreSQL 16
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DEPARTMENTS (lookup table)
-- ============================================================
CREATE TABLE departments (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- HOSPITALS
-- ============================================================
CREATE TABLE hospitals (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(200) NOT NULL,
    type          VARCHAR(50)  NOT NULL CHECK (type IN ('private', 'government', 'trust', 'college')),
    address       TEXT         NOT NULL,
    taluka        VARCHAR(100),
    district      VARCHAR(100),
    state         VARCHAR(100) DEFAULT 'Maharashtra',
    lat           DECIMAL(10, 7),
    lng           DECIMAL(10, 7),
    phone         VARCHAR(20),
    alt_phone     VARCHAR(20),
    email         VARCHAR(150),
    website       VARCHAR(255),
    is_24x7       BOOLEAN      DEFAULT FALSE,
    pmjay         BOOLEAN      DEFAULT FALSE,
    cashless      BOOLEAN      DEFAULT FALSE,
    consent_demo  BOOLEAN      DEFAULT FALSE,
    consent_logo  BOOLEAN      DEFAULT FALSE,
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- HOSPITAL_DEPARTMENTS (junction)
-- ============================================================
CREATE TABLE hospital_departments (
    hospital_id   UUID REFERENCES hospitals(id)   ON DELETE CASCADE,
    department_id INT  REFERENCES departments(id)  ON DELETE CASCADE,
    PRIMARY KEY (hospital_id, department_id)
);

-- ============================================================
-- USERS (patients + super_admin)
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'patient'
                               CHECK (role IN ('patient', 'super_admin')),
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- HOSPITAL_ADMINS
-- ============================================================
CREATE TABLE hospital_admins (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id   UUID         NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE doctors (
    id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id          UUID         NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id        INT          REFERENCES departments(id),
    name                 VARCHAR(150) NOT NULL,
    qualification        VARCHAR(100),
    specialization       VARCHAR(100),
    appointment_required BOOLEAN      DEFAULT FALSE,
    created_at           TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- OPD_SCHEDULES
-- ============================================================
CREATE TABLE opd_schedules (
    id         UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id  UUID     NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    weekday    SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),  -- 0 = Sunday
    start_time TIME     NOT NULL,
    end_time   TIME     NOT NULL,
    UNIQUE (doctor_id, weekday, start_time)
);

-- ============================================================
-- DOCTOR_STATUS (live)
-- ============================================================
CREATE TABLE doctor_status (
    doctor_id  UUID        PRIMARY KEY REFERENCES doctors(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'not_in_opd'
                           CHECK (status IN ('in_opd', 'not_in_opd', 'on_leave')),
    updated_at TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- BED_STATUS (live — one row per hospital)
-- ============================================================
CREATE TABLE bed_status (
    hospital_id    UUID      PRIMARY KEY REFERENCES hospitals(id) ON DELETE CASCADE,
    general_total  INT       NOT NULL DEFAULT 0,
    general_avail  INT       NOT NULL DEFAULT 0,
    icu_total      INT       NOT NULL DEFAULT 0,
    icu_avail      INT       NOT NULL DEFAULT 0,
    emergency_beds INT       NOT NULL DEFAULT 0,
    oxygen_beds    INT       NOT NULL DEFAULT 0,
    isolation_beds INT       NOT NULL DEFAULT 0,
    vent_total     INT       NOT NULL DEFAULT 0,
    vent_avail     INT       NOT NULL DEFAULT 0,
    updated_at     TIMESTAMP DEFAULT NOW(),
    updated_by     UUID      REFERENCES hospital_admins(id),

    CONSTRAINT chk_general   CHECK (general_avail >= 0 AND general_avail <= general_total),
    CONSTRAINT chk_icu       CHECK (icu_avail >= 0     AND icu_avail <= icu_total),
    CONSTRAINT chk_vent      CHECK (vent_avail >= 0    AND vent_avail <= vent_total),
    CONSTRAINT chk_emergency CHECK (emergency_beds >= 0),
    CONSTRAINT chk_oxygen    CHECK (oxygen_beds >= 0),
    CONSTRAINT chk_isolation CHECK (isolation_beds >= 0)
);

-- ============================================================
-- AMBULANCES
-- ============================================================
CREATE TABLE ambulances (
    id          UUID       PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID       NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    type        VARCHAR(10) NOT NULL CHECK (type IN ('BLS', 'ALS')),
    contact     VARCHAR(20),
    is_24x7     BOOLEAN    DEFAULT FALSE
);

-- ============================================================
-- HOSPITAL_SERVICES
-- ============================================================
CREATE TABLE hospital_services (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID        NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    category    VARCHAR(50) NOT NULL,  -- diagnostic, pharmacy, insurance, facility
    name        VARCHAR(150) NOT NULL,
    timing      VARCHAR(100),
    notes       TEXT
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id     UUID        NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id   UUID        NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    date          DATE        NOT NULL,
    slot_or_token VARCHAR(50),
    status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes         TEXT,
    created_at    TIMESTAMP   DEFAULT NOW(),
    updated_at    TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- CHAT_LOGS
-- ============================================================
CREATE TABLE chat_logs (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
    hospital_id  UUID        REFERENCES hospitals(id) ON DELETE SET NULL,
    user_message TEXT        NOT NULL,
    bot_reply    TEXT        NOT NULL,
    intent       VARCHAR(50),
    answered     BOOLEAN     DEFAULT TRUE,
    created_at   TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- AUDIT_LOG
-- ============================================================
CREATE TABLE audit_log (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id    UUID         NOT NULL REFERENCES hospital_admins(id),
    hospital_id UUID         NOT NULL REFERENCES hospitals(id),
    action      VARCHAR(100) NOT NULL,
    old_value   JSONB,
    new_value   JSONB,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_hospitals_district        ON hospitals(district);
CREATE INDEX idx_hospitals_taluka          ON hospitals(taluka);
CREATE INDEX idx_hospitals_is_24x7        ON hospitals(is_24x7);
CREATE INDEX idx_hospitals_type            ON hospitals(type);
CREATE INDEX idx_doctors_hospital          ON doctors(hospital_id);
CREATE INDEX idx_opd_schedules_doctor      ON opd_schedules(doctor_id);
CREATE INDEX idx_appointments_user         ON appointments(user_id);
CREATE INDEX idx_appointments_hospital_date ON appointments(hospital_id, date);
CREATE INDEX idx_appointments_status       ON appointments(status);
CREATE INDEX idx_audit_log_hospital        ON audit_log(hospital_id);
CREATE INDEX idx_audit_log_created         ON audit_log(created_at);
CREATE INDEX idx_chat_logs_answered        ON chat_logs(answered);
CREATE INDEX idx_bed_status_updated        ON bed_status(updated_at);
