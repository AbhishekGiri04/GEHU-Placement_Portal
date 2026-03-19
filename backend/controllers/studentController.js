const db = require('../config/database');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM students WHERE student_admission_number = ?', [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Student not found' });

    const s = rows[0];
    delete s.password;
    delete s.reset_token;
    delete s.reset_token_expires;
    res.json({ success: true, student: s });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const d = req.body;
    await db.execute(`
      UPDATE students SET
        mobile_no=?, email_id=?, address=?, back_logs_count=?
      WHERE student_admission_number=?
    `, [d.mobileNo, d.emailId, d.address || null, d.backLogsCount || 0, req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.execute(
      'SELECT password FROM students WHERE student_admission_number = ?', [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Student not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute(
      'UPDATE students SET password=? WHERE student_admission_number=?', [hashed, req.user.id]
    );
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESUME ───────────────────────────────────────────────────────────────────
const uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'File size must be under 5MB' });
    }

    const resumeLink = `/uploads/resumes/${req.file.filename}`;
    await db.execute(
      'UPDATE students SET resume_link=? WHERE student_admission_number=?',
      [resumeLink, req.user.id]
    );

    res.json({ success: true, message: 'Resume uploaded successfully', resumeLink });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateResumeLink = async (req, res) => {
  try {
    const { driveLink } = req.body;
    if (!driveLink || !driveLink.startsWith('https://'))
      return res.status(400).json({ success: false, message: 'Please provide a valid HTTPS link' });

    await db.execute(
      'UPDATE students SET resume_link=? WHERE student_admission_number=?',
      [driveLink, req.user.id]
    );
    res.json({ success: true, message: 'Resume link updated', resumeLink: driveLink });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
const getApplications = async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT
        p.participation_status, p.created_at, p.event_description AS remarks,
        e.event_id, e.event_name, e.job_role,
        e.expected_package, e.event_mode, e.status AS event_status,
        c.company_name AS organizing_company
      FROM participation p
      JOIN events e ON p.event_id = e.event_id
      JOIN companies c ON e.company_id = c.company_id
      WHERE p.student_admission_number = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applyToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [existing] = await db.execute(
      'SELECT * FROM participation WHERE student_admission_number=? AND event_id=?',
      [req.user.id, eventId]
    );
    if (existing.length)
      return res.status(400).json({ success: false, message: 'Already applied to this drive' });

    const [event] = await db.execute(
      `SELECT * FROM events WHERE event_id=? AND status IN ('UPCOMING','ONGOING') AND registration_end > NOW()`,
      [eventId]
    );
    if (!event.length)
      return res.status(400).json({ success: false, message: 'Drive is not open for registration' });

    const e = event[0];

    // Eligibility check
    const [student] = await db.execute(
      'SELECT cgpa, department FROM students WHERE student_admission_number=?', [req.user.id]
    );
    if (!student.length)
      return res.status(404).json({ success: false, message: 'Student not found' });

    if (e.expected_cgpa && student[0].cgpa < e.expected_cgpa)
      return res.status(400).json({ success: false, message: `Minimum CGPA required: ${e.expected_cgpa}` });

    if (e.eligible_departments) {
      const depts = e.eligible_departments.split(',').map(d => d.trim());
      if (!depts.includes(student[0].department))
        return res.status(400).json({ success: false, message: 'Your department is not eligible for this drive' });
    }

    await db.execute(
      `INSERT INTO participation (student_admission_number, event_id, participation_status) VALUES (?,?,'REGISTERED')`,
      [req.user.id, eventId]
    );

    res.json({ success: true, message: 'Successfully applied to the drive' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [existing] = await db.execute(
      'SELECT * FROM participation WHERE student_admission_number=? AND event_id=?',
      [req.user.id, eventId]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Application not found' });

    if (['SELECTED', 'COMPLETED'].includes(existing[0].participation_status))
      return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage' });

    await db.execute(
      'DELETE FROM participation WHERE student_admission_number=? AND event_id=?',
      [req.user.id, eventId]
    );
    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM participation WHERE student_admission_number=?) AS total_applied,
        (SELECT COUNT(*) FROM participation WHERE student_admission_number=? AND participation_status='SELECTED') AS selected,
        (SELECT COUNT(*) FROM participation WHERE student_admission_number=? AND participation_status='REGISTERED') AS pending,
        (SELECT COUNT(*) FROM events WHERE status='UPCOMING' AND registration_end > NOW()) AS available_drives
    `, [req.user.id, req.user.id, req.user.id]);

    const [recentApplications] = await db.execute(`
      SELECT p.participation_status, p.created_at,
             e.event_name, e.job_role, e.expected_package,
             c.company_name AS organizing_company
      FROM participation p
      JOIN events e ON p.event_id = e.event_id
      JOIN companies c ON e.company_id = c.company_id
      WHERE p.student_admission_number=?
      ORDER BY p.created_at DESC LIMIT 5
    `, [req.user.id]);

    const [upcomingDrives] = await db.execute(`
      SELECT e.*, c.company_name
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      WHERE e.status='UPCOMING' AND e.registration_end > NOW()
      AND e.event_id NOT IN (
        SELECT event_id FROM participation WHERE student_admission_number=?
      )
      ORDER BY e.registration_end ASC LIMIT 5
    `, [req.user.id]);

    res.json({ success: true, data: { stats, recentApplications, upcomingDrives } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProfile, updateProfile, changePassword,
  uploadResume, updateResumeLink,
  getApplications, applyToEvent, withdrawApplication,
  getDashboard
};
