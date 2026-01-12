DROP DATABASE IF EXISTS placement_portal;
CREATE DATABASE placement_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE placement_portal;

-- ADMINS TABLE (Based on Java Admin entity)
CREATE TABLE admins (
    admin_id BIGINT NOT NULL AUTO_INCREMENT,
    admin_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    city VARCHAR(100),
    department VARCHAR(100),
    date_of_birth DATE,
    password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id)
);

-- STUDENTS TABLE (Based on Java Student entity)
CREATE TABLE students (
    student_admission_number VARCHAR(20) NOT NULL,
    student_first_name VARCHAR(50) NOT NULL,
    student_last_name VARCHAR(50) NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('Female', 'Male', 'Others'),
    mobile_no VARCHAR(15),
    email_id VARCHAR(100),
    college_email_id VARCHAR(100),
    department VARCHAR(100),
    batch VARCHAR(10),
    cgpa DOUBLE,
    tenth_percentage DOUBLE,
    twelfth_percentage DOUBLE,
    back_logs_count INT DEFAULT 0,
    address TEXT,
    resume_link VARCHAR(500),
    photograph_link VARCHAR(500),
    course VARCHAR(100),
    student_university_roll_no VARCHAR(20),
    student_enrollment_no VARCHAR(20),
    password VARCHAR(255) DEFAULT 'gehu@123',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_admission_number)
);

-- COMPANIES TABLE (Based on Java Company entity)
CREATE TABLE companies (
    company_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    hr_name VARCHAR(255) NOT NULL,
    hr_email VARCHAR(255) NOT NULL UNIQUE,
    hr_phone VARCHAR(20),
    photo_link VARCHAR(500),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (company_id)
);

-- EVENTS TABLE (Based on Java Event entity)
CREATE TABLE events (
    event_id BIGINT NOT NULL AUTO_INCREMENT,
    event_name VARCHAR(255) NOT NULL,
    organizing_company VARCHAR(255) NOT NULL,
    expected_cgpa DOUBLE,
    job_role VARCHAR(100),
    registration_start DATETIME NOT NULL,
    registration_end DATETIME NOT NULL,
    event_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') DEFAULT 'ONLINE',
    expected_package DOUBLE,
    event_description TEXT NOT NULL,
    eligible_departments LONGTEXT,
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id)
);

-- PARTICIPATION TABLE (Based on Java Participation entity)
CREATE TABLE participation (
    student_admission_number VARCHAR(20) NOT NULL,
    event_id BIGINT NOT NULL,
    event_description TEXT,
    participation_status ENUM('REGISTERED', 'ATTEMPTED', 'COMPLETED', 'ABSENT', 'SELECTED', 'REJECTED') DEFAULT 'REGISTERED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_admission_number, event_id),
    FOREIGN KEY (student_admission_number) REFERENCES students(student_admission_number) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- MESSAGES TABLE (Based on Java Message entity)
CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_student_name ON students(student_first_name, student_last_name);
CREATE INDEX idx_student_department_cgpa ON students(department, cgpa);
CREATE INDEX idx_event_company_status ON events(organizing_company, status);
CREATE INDEX idx_event_dates ON events(registration_start, registration_end);
CREATE INDEX idx_participation_student ON participation(student_admission_number);
CREATE INDEX idx_participation_event ON participation(event_id);
CREATE INDEX idx_message_sender_date ON messages(sender_email, created_at);

-- INSERT SAMPLE DATA
INSERT INTO admins (admin_name, email_address, phone_number, city, department, password) VALUES 
('Dr. Priya Sharma', 'admin@gehu.edu', '+91-9876543210', 'Dehradun', 'Placement Cell', 'admin123'),
('Prof. Rajesh Kumar', 'tpo@gehu.edu', '+91-9876543211', 'Dehradun', 'Placement Cell', 'admin123');

INSERT INTO companies (company_id, company_name, hr_name, hr_email, hr_phone, password) VALUES
('TCS001', 'Tata Consultancy Services', 'Rahul Verma', 'hr@tcs.com', '+91-9876500011', 'comp1234'),
('INF001', 'Infosys Limited', 'Anita Kapoor', 'hr@infosys.com', '+91-9876500022', 'comp1234'),
('AMZ001', 'Amazon India', 'Priya Singh', 'hr@amazon.in', '+91-9876500033', 'comp1234'),
('GOG001', 'Google India', 'Amit Sharma', 'hr@google.com', '+91-9876500044', 'comp1234');

INSERT INTO students (student_admission_number, student_first_name, student_last_name, father_name, mother_name, date_of_birth, gender, mobile_no, email_id, college_email_id, department, batch, cgpa, tenth_percentage, twelfth_percentage, course, student_university_roll_no, student_enrollment_no, password) VALUES
('2318169', 'Abhishek', 'Giri', 'Ved Vart Giri', 'Kaanta Devi', '2004-10-18', 'Male', '+91-9876543210', 'abhishekgiri1978@gmail.com', 'abhishekgiri230111589@gehu.ac.in', 'Computer Science & Engineering', '2023', 9.10, 85.5, 88.2, 'B.Tech', '2318169', '230111589', 'gehu@123'),
('2318699', 'Deepali', 'Chauhan', 'Rajesh Chauhan', 'Meera Chauhan', '2004-12-16', 'Female', '+91-7012340001', 'deepalic1612@gmail.com', 'deepali230121490@gehu.ac.in', 'Computer Science & Engineering', '2023', 8.75, 82.3, 85.7, 'B.Tech', '2318699', '230121490', 'gehu@123'),
('2318583', 'Ayush', 'Chauhan', 'Sanjay Chauhan', 'Sunita Chauhan', '2004-08-25', 'Male', '+91-7012340002', 'ayushchauhan54989@gmail.com', 'ayush230111585@gehu.ac.in', 'Computer Science & Engineering', '2023', 8.90, 87.1, 89.5, 'B.Tech', '2318583', '230111585', 'gehu@123'),
('2319640', 'Sidh', 'Khurana', 'Sanjay Khurana', 'Priya Khurana', '2004-06-06', 'Male', '+91-7012340003', 'sidhkhurana06@gmail.com', 'sidh230115124@gehu.ac.in', 'Computer Science & Engineering', '2023', 8.65, 84.2, 86.8, 'B.Tech', '2319640', '230115124', 'gehu@123');

INSERT INTO events (event_name, organizing_company, job_role, expected_cgpa, registration_start, registration_end, event_mode, expected_package, event_description, eligible_departments, status) VALUES
('TCS Campus Drive 2025', 'Tata Consultancy Services', 'Software Analyst', 6.0, '2025-01-20 09:00:00', '2025-01-25 23:59:59', 'OFFLINE', 3.5, 'TCS is conducting campus recruitment for Software Analyst positions', 'Computer Science & Engineering,Information Technology,Electronics & Communication', 'UPCOMING'),
('Infosys PowerProgrammer 2025', 'Infosys Limited', 'System Engineer', 6.5, '2025-01-22 09:00:00', '2025-01-28 23:59:59', 'HYBRID', 4.0, 'Infosys PowerProgrammer recruitment drive for fresh graduates', 'Computer Science & Engineering,Information Technology', 'UPCOMING'),
('Amazon SDE Internship', 'Amazon India', 'Software Development Engineer Intern', 8.0, '2025-01-25 09:00:00', '2025-01-30 23:59:59', 'ONLINE', 15.0, 'Amazon Summer Internship Program for SDE roles', 'Computer Science & Engineering', 'UPCOMING'),
('Google STEP Internship', 'Google India', 'Software Engineer Intern', 8.5, '2025-02-01 09:00:00', '2025-02-07 23:59:59', 'ONLINE', 18.0, 'Google Student Training in Engineering Program', 'Computer Science & Engineering', 'UPCOMING');

INSERT INTO participation (student_admission_number, event_id, participation_status) VALUES
('2318169', 1, 'REGISTERED'),
('2318699', 1, 'SELECTED'),
('2318583', 1, 'ATTEMPTED'),
('2319640', 2, 'REGISTERED'),
('2318169', 2, 'REGISTERED');