const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

// ─── STUDENT LOGIN ────────────────────────────────────────────────────────────
const studentLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const [rows] = await db.execute(
      'SELECT * FROM students WHERE student_admission_number = ?', [userId]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await db.execute(
      'UPDATE students SET last_login = NOW() WHERE student_admission_number = ?',
      [student.student_admission_number]
    );

    const token = generateToken({
      id: student.student_admission_number,
      email: student.college_email_id,
      role: 'student',
      name: `${student.student_first_name} ${student.student_last_name}`
    });

    res.json({
      success: true,
      token,
      user: {
        studentAdmissionNumber: student.student_admission_number,
        studentFirstName: student.student_first_name,
        studentLastName: student.student_last_name,
        emailId: student.email_id,
        collegeEmailId: student.college_email_id,
        department: student.department,
        batch: student.batch,
        cgpa: student.cgpa,
        course: student.course,
        mobileNo: student.mobile_no,
        photographLink: student.photograph_link,
        resumeLink: student.resume_link
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
};

// ─── STUDENT REGISTER ─────────────────────────────────────────────────────────
const studentRegister = async (req, res) => {
  try {
    const d = req.body;
    const [existing] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [d.studentAdmissionNumber]
    );
    if (existing.length)
      return res.status(400).json({ success: false, message: 'Student already registered' });

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
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
};

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const [rows] = await db.execute(
      'SELECT * FROM admins WHERE email_address = ? OR admin_id::text = ?', [userId, userId]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await db.execute('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

    const token = generateToken({
      id: admin.admin_id,
      email: admin.email_address,
      role: 'admin',
      name: admin.admin_name
    });

    res.json({
      success: true,
      token,
      user: {
        adminId: admin.admin_id,
        adminName: admin.admin_name,
        emailAddress: admin.email_address,
        phoneNumber: admin.phone_number,
        department: admin.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
};

// ─── COMPANY LOGIN ────────────────────────────────────────────────────────────
const companyLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const [rows] = await db.execute(
      'SELECT * FROM companies WHERE company_id = ? OR hr_email = ?', [userId, userId]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const company = rows[0];
    const match = await bcrypt.compare(password, company.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({
      id: company.company_id,
      email: company.hr_email,
      role: 'company',
      name: company.company_name
    });

    res.json({
      success: true,
      token,
      user: {
        companyId: company.company_id,
        companyName: company.company_name,
        hrName: company.hr_name,
        hrEmail: company.hr_email,
        hrPhone: company.hr_phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
};

// ─── COMPANY REGISTER ─────────────────────────────────────────────────────────
const companyRegister = async (req, res) => {
  try {
    const d = req.body;
    const [existing] = await db.execute(
      'SELECT company_id FROM companies WHERE company_id = ? OR hr_email = ?',
      [d.companyId, d.hrEmail]
    );
    if (existing.length)
      return res.status(400).json({ success: false, message: 'Company already registered' });

    const hashed = await bcrypt.hash(d.password, 10);

    await db.execute(`
      INSERT INTO companies (company_id, company_name, hr_name, hr_email, hr_phone, password)
      VALUES (?,?,?,?,?,?)
    `, [d.companyId, d.companyName, d.hrName, d.hrEmail, d.hrPhone, hashed]);

    res.status(201).json({ success: true, message: 'Company registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505')
      return res.status(400).json({ success: false, message: 'Company already exists' });
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role)
      return res.status(400).json({ success: false, message: 'User ID and role are required' });

    let email = null;
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    if (role === 'student') {
      const [rows] = await db.execute(
        'SELECT email_id FROM students WHERE student_admission_number = ?', [userId]
      );
      if (!rows.length)
        return res.status(404).json({ success: false, message: 'User not found' });
      email = rows[0].email_id;
      await db.execute(
        'UPDATE students SET reset_token = ?, reset_token_expires = ? WHERE student_admission_number = ?',
        [token, expires, userId]
      );
    } else if (role === 'admin') {
      const [rows] = await db.execute(
        'SELECT email_address FROM admins WHERE admin_id = ? OR email_address = ?', [userId, userId]
      );
      if (!rows.length)
        return res.status(404).json({ success: false, message: 'User not found' });
      email = rows[0].email_address;
      await db.execute(
        'UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE email_address = ?',
        [token, expires, email]
      );
    } else if (role === 'company') {
      const [rows] = await db.execute(
        'SELECT hr_email FROM companies WHERE company_id = ? OR hr_email = ?', [userId, userId]
      );
      if (!rows.length)
        return res.status(404).json({ success: false, message: 'User not found' });
      email = rows[0].hr_email;
      await db.execute(
        'UPDATE companies SET reset_token = ?, reset_token_expires = ? WHERE hr_email = ?',
        [token, expires, email]
      );
    }

    await sendPasswordResetEmail(email, token, role);
    res.json({ success: true, message: 'Password reset link sent to your registered email' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send reset email: ' + err.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, role, newPassword } = req.body;
    if (!token || !role || !newPassword)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const hashed = await bcrypt.hash(newPassword, 10);
    let rowCount = 0;

    if (role === 'student') {
      const [rows] = await db.execute(
        `UPDATE students SET password = ?, reset_token = NULL, reset_token_expires = NULL
         WHERE reset_token = ? AND reset_token_expires > NOW() RETURNING student_admission_number`,
        [hashed, token]
      );
      rowCount = rows.length;
    } else if (role === 'admin') {
      const [rows] = await db.execute(
        `UPDATE admins SET password = ?, reset_token = NULL, reset_token_expires = NULL
         WHERE reset_token = ? AND reset_token_expires > NOW() RETURNING admin_id`,
        [hashed, token]
      );
      rowCount = rows.length;
    } else if (role === 'company') {
      const [rows] = await db.execute(
        `UPDATE companies SET password = ?, reset_token = NULL, reset_token_expires = NULL
         WHERE reset_token = ? AND reset_token_expires > NOW() RETURNING company_id`,
        [hashed, token]
      );
      rowCount = rows.length;
    }

    if (!rowCount)
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reset failed: ' + err.message });
  }
};

const logout = (req, res) => res.json({ success: true, message: 'Logged out successfully' });

module.exports = {
  studentLogin, studentRegister,
  adminLogin,
  companyLogin, companyRegister,
  forgotPassword, resetPassword,
  logout
};
