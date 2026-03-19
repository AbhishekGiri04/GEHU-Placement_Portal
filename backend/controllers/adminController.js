const db = require('../config/database');
const bcrypt = require('bcryptjs');

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [statsRows] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM companies) AS total_companies,
        (SELECT COUNT(*) FROM events WHERE status = 'UPCOMING') AS upcoming_events,
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM participation) AS total_applications,
        (SELECT COUNT(*) FROM participation WHERE participation_status = 'SELECTED') AS total_selected,
        (SELECT COUNT(*) FROM messages WHERE status = 'new') AS unread_messages
    `);
    const stats = statsRows[0];

    const [recentApplications] = await db.execute(`
      SELECT p.participation_status, p.created_at,
             s.student_first_name, s.student_last_name, s.department,
             e.event_name, c.company_name
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      JOIN events e ON p.event_id = e.event_id
      JOIN companies c ON e.company_id = c.company_id
      ORDER BY p.created_at DESC LIMIT 10
    `);

    const [topCompanies] = await db.execute(`
      SELECT c.company_name,
             COUNT(DISTINCT e.event_id) AS drives,
             COUNT(p.student_admission_number) AS applicants,
             SUM(CASE WHEN p.participation_status = 'SELECTED' THEN 1 ELSE 0 END) AS selected
      FROM companies c
      LEFT JOIN events e ON c.company_id = e.company_id
      LEFT JOIN participation p ON e.event_id = p.event_id
      GROUP BY c.company_id, c.company_name
      ORDER BY selected DESC LIMIT 5
    `);

    res.json({ success: true, data: { stats, recentApplications, topCompanies } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT MANAGEMENT ───────────────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { department, batch, minCgpa, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (department) { where += ' AND department = ?'; params.push(department); }
    if (batch) { where += ' AND batch = ?'; params.push(batch); }
    if (minCgpa) { where += ' AND cgpa >= ?'; params.push(parseFloat(minCgpa)); }
    if (search) {
      where += ' AND (student_first_name LIKE ? OR student_last_name LIKE ? OR student_admission_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [stTotal] = await db.execute(`SELECT COUNT(*) AS total FROM students ${where}`, params);
    const total_st = stTotal[0].total;
    const [students] = await db.execute(
      `SELECT student_admission_number, student_first_name, student_last_name,
              email_id, college_email_id, mobile_no, department, batch, cgpa,
              course, back_logs_count, created_at
       FROM students ${where} ORDER BY student_first_name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, students, total: total_st, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerStudent = async (req, res) => {
  try {
    const d = req.body;
    const hashed = await bcrypt.hash(d.password || 'gehu@123', 10);
    await db.execute(`
      INSERT INTO students (
        student_admission_number, student_first_name, student_last_name,
        father_name, mother_name, date_of_birth, gender, mobile_no,
        email_id, college_email_id, department, batch, cgpa,
        tenth_percentage, twelfth_percentage, course,
        student_university_roll_no, student_enrollment_no, password
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      d.studentAdmissionNumber, d.studentFirstName, d.studentLastName,
      d.fatherName, d.motherName, d.dateOfBirth, d.gender, d.mobileNo,
      d.emailId, d.collegeEmailId, d.department, d.batch, d.cgpa,
      d.tenthPercentage, d.twelfthPercentage, d.course,
      d.studentUniversityRollNo, d.studentEnrollmentNo, hashed
    ]);
    res.status(201).json({ success: true, message: 'Student registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505')
      return res.status(400).json({ success: false, message: 'Student already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    await db.execute(`
      UPDATE students SET
        student_first_name=?, student_last_name=?, mobile_no=?,
        email_id=?, department=?, batch=?, cgpa=?,
        back_logs_count=?, address=?
      WHERE student_admission_number=?
    `, [
      d.studentFirstName, d.studentLastName, d.mobileNo,
      d.emailId, d.department, d.batch, d.cgpa,
      d.backLogsCount || 0, d.address || null, id
    ]);
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await db.execute('DELETE FROM students WHERE student_admission_number = ?', [req.params.id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMPANY MANAGEMENT ───────────────────────────────────────────────────────
const getAllCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (company_name LIKE ? OR hr_name LIKE ? OR hr_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [cTotal] = await db.execute(`SELECT COUNT(*) AS total FROM companies ${where}`, params);
    const total_c = cTotal[0].total;
    const [companies] = await db.execute(
      `SELECT company_id, company_name, hr_name, hr_email, hr_phone, created_at
       FROM companies ${where} ORDER BY company_name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, companies, total: total_c, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerCompany = async (req, res) => {
  try {
    const d = req.body;
    const hashed = await bcrypt.hash(d.password || 'comp@123', 10);
    await db.execute(
      'INSERT INTO companies (company_id, company_name, hr_name, hr_email, hr_phone, password) VALUES (?,?,?,?,?,?)',
      [d.companyId, d.companyName, d.hrName, d.hrEmail, d.hrPhone, hashed]
    );
    res.status(201).json({ success: true, message: 'Company registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505')
      return res.status(400).json({ success: false, message: 'Company already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, hrName, hrPhone } = req.body;
    await db.execute(
      'UPDATE companies SET company_name=?, hr_name=?, hr_phone=? WHERE company_id=?',
      [companyName, hrName, hrPhone, id]
    );
    res.json({ success: true, message: 'Company updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await db.execute('DELETE FROM companies WHERE company_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EVENT MANAGEMENT ─────────────────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND e.status = ?'; params.push(status); }
    if (search) {
      where += ' AND (e.event_name LIKE ? OR c.company_name LIKE ? OR e.job_role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [eTotal] = await db.execute(
      `SELECT COUNT(*) AS total FROM events e JOIN companies c ON e.company_id = c.company_id ${where}`,
      params
    );
    const total_e = eTotal[0].total;

    const [events] = await db.execute(`
      SELECT e.*, c.company_name,
        (SELECT COUNT(*) FROM participation p WHERE p.event_id = e.event_id) AS applicant_count
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({ success: true, events, total: total_e, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const d = req.body;
    const [result] = await db.execute(`
      INSERT INTO events (
        event_name, company_id, expected_cgpa, job_role,
        registration_start, registration_end, event_mode,
        expected_package, event_description, eligible_departments, status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING event_id AS id
    `, [
      d.eventName, d.companyId, d.expectedCgpa, d.jobRole,
      d.registrationStart, d.registrationEnd, d.eventMode || 'ONLINE',
      d.expectedPackage, d.eventDescription, d.eligibleDepartments,
      d.status || 'UPCOMING'
    ]);
    const [newEvRows] = await db.execute(
      'SELECT e.*, c.company_name FROM events e JOIN companies c ON e.company_id = c.company_id WHERE e.event_id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, event: newEvRows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    await db.execute(`
      UPDATE events SET
        event_name=?, company_id=?, expected_cgpa=?, job_role=?,
        registration_start=?, registration_end=?, event_mode=?,
        expected_package=?, event_description=?, eligible_departments=?, status=?
      WHERE event_id=?
    `, [
      d.eventName, d.companyId, d.expectedCgpa, d.jobRole,
      d.registrationStart, d.registrationEnd, d.eventMode,
      d.expectedPackage, d.eventDescription, d.eligibleDepartments, d.status, id
    ]);
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await db.execute('DELETE FROM events WHERE event_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const [byDept] = await db.execute(`
      SELECT s.department,
             COUNT(DISTINCT s.student_admission_number) AS total_students,
             COUNT(DISTINCT CASE WHEN p.participation_status = 'SELECTED' THEN s.student_admission_number END) AS placed
      FROM students s
      LEFT JOIN participation p ON s.student_admission_number = p.student_admission_number
      GROUP BY s.department
    `);

    const [byCompany] = await db.execute(`
      SELECT c.company_name,
             COUNT(DISTINCT p.student_admission_number) AS applicants,
             SUM(CASE WHEN p.participation_status = 'SELECTED' THEN 1 ELSE 0 END) AS selected,
             MAX(e.expected_package) AS max_package
      FROM companies c
      LEFT JOIN events e ON c.company_id = e.company_id
      LEFT JOIN participation p ON e.event_id = p.event_id
      GROUP BY c.company_id, c.company_name
      ORDER BY selected DESC
    `);

    const [monthlyTrend] = await db.execute(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
             COUNT(*) AS applications
      FROM participation
      GROUP BY month
      ORDER BY month DESC LIMIT 12
    `);

    res.json({ success: true, data: { byDept, byCompany, monthlyTrend } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND status = ?'; params.push(status); }

    const [mTotal] = await db.execute(`SELECT COUNT(*) AS total FROM messages ${where}`, params);
    const total_m = mTotal[0].total;
    const [messages] = await db.execute(
      `SELECT * FROM messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, messages, total: total_m, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markMessageRead = async (req, res) => {
  try {
    await db.execute("UPDATE messages SET status = 'read' WHERE id = ? AND status = 'new'", [req.params.id]);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim())
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });

    await db.execute(
      "UPDATE messages SET reply = ?, replied_at = NOW(), status = 'replied' WHERE id = ?",
      [reply.trim(), req.params.id]
    );
    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await db.execute(
      'INSERT INTO announcements (title, content, created_by) VALUES (?,?,?) RETURNING id',
      [title, content, req.user.name]
    );
    const [annRows] = await db.execute('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, announcement: annRows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    await db.execute(
      'UPDATE announcements SET title=?, content=? WHERE id=?',
      [title, content, req.params.id]
    );
    res.json({ success: true, message: 'Announcement updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await db.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN PROFILE ────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [adminRows] = await db.execute(
      'SELECT admin_id, admin_name, email_address, phone_number, city, department FROM admins WHERE admin_id = ?',
      [req.user.id]
    );
    if (!adminRows.length) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, admin: adminRows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { adminName, phoneNumber, city, department } = req.body;
    await db.execute(
      'UPDATE admins SET admin_name=?, phone_number=?, city=?, department=? WHERE admin_id=?',
      [adminName, phoneNumber, city, department, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [adminPwRows] = await db.execute('SELECT password FROM admins WHERE admin_id = ?', [req.user.id]);
    if (!adminPwRows.length) return res.status(404).json({ success: false, message: 'Admin not found' });
    const row = adminPwRows[0];

    const match = await bcrypt.compare(currentPassword, row.password);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE admins SET password=? WHERE admin_id=?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats, getAnalytics,
  getAllStudents, registerStudent, updateStudent, deleteStudent,
  getAllCompanies, registerCompany, updateCompany, deleteCompany,
  getAllEvents, createEvent, updateEvent, deleteEvent,
  getMessages, markMessageRead, replyToMessage, deleteMessage,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getProfile, updateProfile, changePassword
};
