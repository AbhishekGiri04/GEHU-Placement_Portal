-- ============================================================
--  GEHU Placement Portal — PostgreSQL Schema
--  Converted from MySQL → PostgreSQL
--  Compatible with: PostgreSQL 14+ / Render PostgreSQL 18
-- ============================================================

-- Drop tables in reverse FK order (safe re-run)
DROP TABLE IF EXISTS announcements   CASCADE;
DROP TABLE IF EXISTS messages        CASCADE;
DROP TABLE IF EXISTS participation   CASCADE;
DROP TABLE IF EXISTS events          CASCADE;
DROP TABLE IF EXISTS companies       CASCADE;
DROP TABLE IF EXISTS students        CASCADE;
DROP TABLE IF EXISTS admins          CASCADE;

-- ─── ADMINS ──────────────────────────────────────────────────
CREATE TABLE admins (
    admin_id          BIGSERIAL PRIMARY KEY,
    admin_name        VARCHAR(255) NOT NULL,
    email_address     VARCHAR(255) NOT NULL UNIQUE,
    phone_number      VARCHAR(20),
    city              VARCHAR(100),
    department        VARCHAR(100),
    date_of_birth     DATE,
    password          VARCHAR(255) NOT NULL,
    reset_token       VARCHAR(255) DEFAULT NULL,
    reset_token_expires TIMESTAMPTZ DEFAULT NULL,
    last_login        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUDENTS ────────────────────────────────────────────────
CREATE TABLE students (
    student_admission_number  VARCHAR(20) PRIMARY KEY,
    student_first_name        VARCHAR(50)  NOT NULL,
    student_last_name         VARCHAR(50)  NOT NULL,
    father_name               VARCHAR(100),
    mother_name               VARCHAR(100),
    date_of_birth             DATE,
    gender                    VARCHAR(10)  CHECK (gender IN ('Female','Male','Others')),
    mobile_no                 VARCHAR(15),
    email_id                  VARCHAR(100),
    college_email_id          VARCHAR(100),
    department                VARCHAR(100),
    batch                     VARCHAR(10),
    cgpa                      DOUBLE PRECISION,
    tenth_percentage          DOUBLE PRECISION,
    twelfth_percentage        DOUBLE PRECISION,
    back_logs_count           INT DEFAULT 0,
    address                   TEXT,
    resume_link               VARCHAR(500),
    photograph_link           VARCHAR(500),
    course                    VARCHAR(100),
    student_university_roll_no VARCHAR(20),
    student_enrollment_no     VARCHAR(20),
    password                  VARCHAR(255) DEFAULT NULL,
    reset_token               VARCHAR(255) DEFAULT NULL,
    reset_token_expires       TIMESTAMPTZ  DEFAULT NULL,
    last_login                TIMESTAMPTZ,
    created_at                TIMESTAMPTZ  DEFAULT NOW(),
    updated_at                TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── COMPANIES ───────────────────────────────────────────────
CREATE TABLE companies (
    company_id   VARCHAR(255) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    hr_name      VARCHAR(255) NOT NULL,
    hr_email     VARCHAR(255) NOT NULL UNIQUE,
    hr_phone     VARCHAR(20),
    photo_link   VARCHAR(500),
    password     VARCHAR(255),
    reset_token  VARCHAR(255) DEFAULT NULL,
    reset_token_expires TIMESTAMPTZ DEFAULT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EVENTS ──────────────────────────────────────────────────
CREATE TABLE events (
    event_id             BIGSERIAL PRIMARY KEY,
    event_name           VARCHAR(255) NOT NULL,
    company_id           VARCHAR(255) NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    expected_cgpa        DOUBLE PRECISION,
    job_role             VARCHAR(100),
    registration_start   TIMESTAMPTZ NOT NULL,
    registration_end     TIMESTAMPTZ NOT NULL,
    event_mode           VARCHAR(10)  DEFAULT 'ONLINE' CHECK (event_mode IN ('ONLINE','OFFLINE','HYBRID')),
    expected_package     DOUBLE PRECISION,
    event_description    TEXT NOT NULL,
    eligible_departments TEXT,
    status               VARCHAR(15)  DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING','ONGOING','COMPLETED','CANCELLED')),
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── PARTICIPATION ───────────────────────────────────────────
CREATE TABLE participation (
    student_admission_number VARCHAR(20) NOT NULL REFERENCES students(student_admission_number) ON DELETE CASCADE,
    event_id                 BIGINT      NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    event_description        TEXT,
    participation_status     VARCHAR(15) DEFAULT 'REGISTERED'
                             CHECK (participation_status IN ('REGISTERED','ATTEMPTED','COMPLETED','ABSENT','SELECTED','REJECTED')),
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (student_admission_number, event_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE messages (
    id           BIGSERIAL PRIMARY KEY,
    sender_name  VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_role  VARCHAR(10)  DEFAULT 'guest' CHECK (sender_role IN ('student','company','guest')),
    subject      VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    reply        TEXT DEFAULT NULL,
    replied_at   TIMESTAMPTZ DEFAULT NULL,
    status       VARCHAR(10)  DEFAULT 'new' CHECK (status IN ('new','read','replied')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
CREATE TABLE announcements (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at TRIGGER ─────────────────────────
-- PostgreSQL does not have ON UPDATE CURRENT_TIMESTAMP like MySQL,
-- so we use a trigger function instead.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated_at        BEFORE UPDATE ON admins        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_students_updated_at      BEFORE UPDATE ON students      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at     BEFORE UPDATE ON companies     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at        BEFORE UPDATE ON events        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_participation_updated_at BEFORE UPDATE ON participation FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_messages_updated_at      BEFORE UPDATE ON messages      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_student_dept_cgpa    ON students(department, cgpa);
CREATE INDEX idx_student_batch        ON students(batch);
CREATE INDEX idx_event_company_status ON events(company_id, status);
CREATE INDEX idx_event_dates          ON events(registration_start, registration_end);
CREATE INDEX idx_participation_student ON participation(student_admission_number);
CREATE INDEX idx_participation_event  ON participation(event_id);
CREATE INDEX idx_message_status       ON messages(status);
CREATE INDEX idx_announcement_created ON announcements(created_at);

-- ─── SAMPLE DATA ─────────────────────────────────────────────
-- Passwords: admin123 / comp@123 / gehu@123 (bcrypt hashes)

INSERT INTO admins (admin_name, email_address, phone_number, city, department, password) VALUES
('Dr. Priya Sharma',  'admin@gehu.edu', '+91-9876543210', 'Dehradun', 'Placement Cell',
 '$2a$10$lKUIO0DVlBFjbqM/vSjmGeEcvCMEUKD8sHqeYesM4FiF3BiwVC9Cm'),
('Prof. Rajesh Kumar', 'tpo@gehu.edu',  '+91-9876543211', 'Dehradun', 'Placement Cell',
 '$2a$10$lKUIO0DVlBFjbqM/vSjmGeEcvCMEUKD8sHqeYesM4FiF3BiwVC9Cm');

INSERT INTO companies (company_id, company_name, hr_name, hr_email, hr_phone, password) VALUES
('TCS001', 'Tata Consultancy Services', 'Rahul Verma',  'hr@tcs.com',     '+91-9876500011', '$2a$10$t805vcM7bh3L1S/iKDbPhO/zgNn9QpRK8.Z7KMOzoMyBtdKNr.H56'),
('INF001', 'Infosys Limited',           'Anita Kapoor', 'hr@infosys.com', '+91-9876500022', '$2a$10$t805vcM7bh3L1S/iKDbPhO/zgNn9QpRK8.Z7KMOzoMyBtdKNr.H56'),
('AMZ001', 'Amazon India',              'Priya Singh',  'hr@amazon.in',   '+91-9876500033', '$2a$10$t805vcM7bh3L1S/iKDbPhO/zgNn9QpRK8.Z7KMOzoMyBtdKNr.H56'),
('GOG001', 'Google India',              'Amit Sharma',  'hr@google.com',  '+91-9876500044', '$2a$10$t805vcM7bh3L1S/iKDbPhO/zgNn9QpRK8.Z7KMOzoMyBtdKNr.H56');

INSERT INTO students (
  student_admission_number, student_first_name, student_last_name,
  father_name, mother_name, date_of_birth, gender, mobile_no,
  email_id, college_email_id, department, batch, cgpa,
  tenth_percentage, twelfth_percentage, course,
  student_university_roll_no, student_enrollment_no, password
) VALUES
('2318169','Abhishek','Giri','Ved Vart Giri','Kaanta Devi','2004-10-18','Male',
 '+91-9876543210','abhishekgiri1978@gmail.com','abhishekgiri230111589@gehu.ac.in',
 'Computer Science & Engineering','2023',9.10,85.5,88.2,'B.Tech','2318169','230111589',
 '$2a$10$kpT5NLnGPqoBNPI9cMFLtuneOKKDu5dRtxdf5xxkmcqDzyIHr7t6e'),
('2318699','Deepali','Chauhan','Rajesh Chauhan','Meera Chauhan','2004-12-16','Female',
 '+91-7012340001','deepalic1612@gmail.com','deepali230121490@gehu.ac.in',
 'Computer Science & Engineering','2023',8.75,82.3,85.7,'B.Tech','2318699','230121490',
 '$2a$10$kpT5NLnGPqoBNPI9cMFLtuneOKKDu5dRtxdf5xxkmcqDzyIHr7t6e'),
('2318583','Ayush','Chauhan','Sanjay Chauhan','Sunita Chauhan','2004-08-25','Male',
 '+91-7012340002','ayushchauhan54989@gmail.com','ayush230111585@gehu.ac.in',
 'Computer Science & Engineering','2023',8.90,87.1,89.5,'B.Tech','2318583','230111585',
 '$2a$10$kpT5NLnGPqoBNPI9cMFLtuneOKKDu5dRtxdf5xxkmcqDzyIHr7t6e'),
('2319640','Sidh','Khurana','Sanjay Khurana','Priya Khurana','2004-06-06','Male',
 '+91-7012340003','sidhkhurana06@gmail.com','sidh230115124@gehu.ac.in',
 'Computer Science & Engineering','2023',8.65,84.2,86.8,'B.Tech','2319640','230115124',
 '$2a$10$kpT5NLnGPqoBNPI9cMFLtuneOKKDu5dRtxdf5xxkmcqDzyIHr7t6e');

INSERT INTO events (event_name, company_id, job_role, expected_cgpa, registration_start, registration_end, event_mode, expected_package, event_description, eligible_departments, status) VALUES
('TCS Campus Drive 2025','TCS001','Software Analyst',6.0,
 '2025-01-20 09:00:00','2025-12-25 23:59:59','OFFLINE',3.5,
 'TCS is conducting campus recruitment for Software Analyst positions.',
 'Computer Science & Engineering,Information Technology,Electronics & Communication','UPCOMING'),
('Infosys PowerProgrammer 2025','INF001','System Engineer',6.5,
 '2025-01-22 09:00:00','2025-12-28 23:59:59','HYBRID',4.0,
 'Infosys PowerProgrammer recruitment drive for fresh graduates.',
 'Computer Science & Engineering,Information Technology','UPCOMING'),
('Amazon SDE Internship','AMZ001','Software Development Engineer Intern',8.0,
 '2025-01-25 09:00:00','2025-12-30 23:59:59','ONLINE',15.0,
 'Amazon Summer Internship Program for SDE roles.',
 'Computer Science & Engineering','UPCOMING'),
('Google STEP Internship','GOG001','Software Engineer Intern',8.5,
 '2025-02-01 09:00:00','2025-12-07 23:59:59','ONLINE',18.0,
 'Google Student Training in Engineering Program.',
 'Computer Science & Engineering','UPCOMING');

INSERT INTO participation (student_admission_number, event_id, participation_status) VALUES
('2318169',1,'REGISTERED'),
('2318699',1,'SELECTED'),
('2318583',1,'ATTEMPTED'),
('2319640',2,'REGISTERED'),
('2318169',2,'REGISTERED');

INSERT INTO announcements (title, content, created_by) VALUES
('Welcome to GEHU Placement Portal 2025',
 'The placement season 2025 has officially begun. All eligible students are requested to complete their profiles and upload updated resumes before applying to any drive.',
 'Dr. Priya Sharma'),
('TCS Campus Drive Registration Open',
 'TCS is conducting a campus drive for Software Analyst roles. Minimum CGPA 6.0 required. Registration closes on December 25, 2025. Apply from the Drives section.',
 'Prof. Rajesh Kumar'),
('Resume Submission Deadline',
 'All students must upload their latest resume by December 15, 2025. Profiles without resumes will not be considered for shortlisting by companies.',
 'Dr. Priya Sharma');

INSERT INTO messages (sender_name, sender_email, sender_role, subject, message, status) VALUES
('Abhishek Giri', 'abhishekgiri1978@gmail.com', 'student',
 'Query about TCS Drive eligibility',
 'I have a CGPA of 9.10 and belong to CSE department. Am I eligible for the TCS Campus Drive 2025?',
 'new'),
('Rahul Verma', 'hr@tcs.com', 'company',
 'Campus Visit Schedule',
 'We would like to schedule our campus visit for the first week of January 2026. Please confirm the available dates.',
 'new');
