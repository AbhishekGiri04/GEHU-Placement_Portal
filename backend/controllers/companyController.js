const db = require('../config/database');
const bcrypt = require('bcryptjs');

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [[company]] = await db.execute(
      'SELECT company_id, company_name, hr_name, hr_email, hr_phone, photo_link, created_at FROM companies WHERE company_id = ?',
      [req.user.id]
    );
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { hrName, hrPhone } = req.body;
    await db.execute(
      'UPDATE companies SET hr_name = ?, hr_phone = ? WHERE company_id = ?',
      [hrName, hrPhone, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [[row]] = await db.execute('SELECT password FROM companies WHERE company_id = ?', [req.user.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Company not found' });

    const match = await bcrypt.compare(currentPassword, row.password);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE companies SET password = ? WHERE company_id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM events WHERE company_id = ?) AS total_drives,
        (SELECT COUNT(*) FROM events WHERE company_id = ? AND status = 'UPCOMING') AS upcoming_drives,
        (SELECT COUNT(*) FROM participation p JOIN events e ON p.event_id = e.event_id WHERE e.company_id = ?) AS total_applicants,
        (SELECT COUNT(*) FROM participation p JOIN events e ON p.event_id = e.event_id WHERE e.company_id = ? AND p.participation_status = 'SELECTED') AS selected_count
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);

    const [recentApplicants] = await db.execute(`
      SELECT p.participation_status, p.created_at,
             s.student_first_name, s.student_last_name, s.department, s.cgpa,
             e.event_name, e.job_role
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      JOIN events e ON p.event_id = e.event_id
      WHERE e.company_id = ?
      ORDER BY p.created_at DESC LIMIT 10
    `, [req.user.id]);

    res.json({ success: true, data: { stats, recentApplicants } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EVENTS (DRIVES) ──────────────────────────────────────────────────────────
const getMyEvents = async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT e.*,
        (SELECT COUNT(*) FROM participation p WHERE p.event_id = e.event_id) AS applicant_count
      FROM events e
      WHERE e.company_id = ?
      ORDER BY e.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, events });
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
      d.eventName, req.user.id, d.expectedCgpa, d.jobRole,
      d.registrationStart, d.registrationEnd, d.eventMode || 'ONLINE',
      d.expectedPackage, d.eventDescription, d.eligibleDepartments,
      d.status || 'UPCOMING'
    ]);
    const [[newEvent]] = await db.execute('SELECT * FROM events WHERE event_id = ?', [result.insertId]);
    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;

    const [[existing]] = await db.execute(
      'SELECT event_id FROM events WHERE event_id = ? AND company_id = ?',
      [id, req.user.id]
    );
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });

    await db.execute(`
      UPDATE events SET
        event_name=?, expected_cgpa=?, job_role=?, registration_start=?,
        registration_end=?, event_mode=?, expected_package=?,
        event_description=?, eligible_departments=?, status=?
      WHERE event_id=?
    `, [
      d.eventName, d.expectedCgpa, d.jobRole, d.registrationStart,
      d.registrationEnd, d.eventMode, d.expectedPackage,
      d.eventDescription, d.eligibleDepartments, d.status, id
    ]);
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.execute(
      'SELECT event_id FROM events WHERE event_id = ? AND company_id = ?',
      [id, req.user.id]
    );
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });

    await db.execute('DELETE FROM events WHERE event_id = ?', [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPLICANTS ───────────────────────────────────────────────────────────────
const getEventApplicants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [[event]] = await db.execute(
      'SELECT event_id FROM events WHERE event_id = ? AND company_id = ?',
      [eventId, req.user.id]
    );
    if (!event) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const [applicants] = await db.execute(`
      SELECT
        p.participation_status, p.created_at, p.event_description AS remarks,
        s.student_admission_number, s.student_first_name, s.student_last_name,
        s.department, s.cgpa, s.batch, s.mobile_no, s.email_id,
        s.resume_link, s.back_logs_count
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      WHERE p.event_id = ?
      ORDER BY s.cgpa DESC
    `, [eventId]);

    res.json({ success: true, applicants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateApplicantStatus = async (req, res) => {
  try {
    const { eventId, admissionNumber } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['REGISTERED', 'ATTEMPTED', 'COMPLETED', 'ABSENT', 'SELECTED', 'REJECTED'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const [eventRows] = await db.execute(
      'SELECT event_id FROM events WHERE event_id = ? AND company_id = ?',
      [eventId, req.user.id]
    );
    if (!eventRows.length) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await db.execute(
      'UPDATE participation SET participation_status = ? WHERE event_id = ? AND student_admission_number = ?',
      [status, eventId, admissionNumber]
    );
    res.json({ success: true, message: 'Applicant status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllApplicants = async (req, res) => {
  try {
    const { minCgpa, department, status } = req.query;
    let query = `
      SELECT DISTINCT
        s.student_admission_number, s.student_first_name, s.student_last_name,
        s.department, s.cgpa, s.batch, s.email_id, s.mobile_no,
        s.resume_link, s.back_logs_count
      FROM students s
      JOIN participation p ON s.student_admission_number = p.student_admission_number
      JOIN events e ON p.event_id = e.event_id
      WHERE e.company_id = ?
    `;
    const params = [req.user.id];

    if (minCgpa) { query += ' AND s.cgpa >= ?'; params.push(parseFloat(minCgpa)); }
    if (department) { query += ' AND s.department = ?'; params.push(department); }
    if (status) { query += ' AND p.participation_status = ?'; params.push(status); }
    query += ' ORDER BY s.cgpa DESC';

    const [students] = await db.execute(query, params);
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND MESSAGE TO ADMIN ────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const [[company]] = await db.execute(
      'SELECT company_name, hr_email FROM companies WHERE company_id = ?', [req.user.id]
    );
    await db.execute(
      "INSERT INTO messages (sender_name, sender_email, sender_role, subject, message) VALUES (?,?,?,?,?)",
      [company.company_name, company.hr_email, 'company', subject, message]
    );
    res.json({ success: true, message: 'Message sent to admin successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProfile, updateProfile, changePassword,
  getDashboard,
  getMyEvents, createEvent, updateEvent, deleteEvent,
  getEventApplicants, updateApplicantStatus, getAllApplicants,
  sendMessage
};
