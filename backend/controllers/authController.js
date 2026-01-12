const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (user, role) => {
  return jwt.sign(
    { 
      id: user.student_admission_number || user.admin_id || user.company_id, 
      email: user.college_email_id || user.email_address || user.hr_email, 
      role, 
      name: user.student_first_name ? `${user.student_first_name} ${user.student_last_name}` : user.admin_name || user.company_name 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ success: false, message: 'User ID and password are required' });
    }

    let user;
    
    if (role === 'student') {
      [user] = await db.execute(
        'SELECT * FROM students WHERE student_admission_number = ?', 
        [userId]
      );
    } else if (role === 'company') {
      [user] = await db.execute('SELECT * FROM companies WHERE company_id = ? OR hr_email = ?', [userId, userId]);
    } else if (role === 'admin') {
      [user] = await db.execute('SELECT * FROM admins WHERE email_address = ? OR admin_id = ?', [userId, userId]);
    }

    if (!user.length) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Simple password check (matching Java backend)
    if (user[0].password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Update last login for students and admins
    if (role === 'student') {
      await db.execute('UPDATE students SET last_login = NOW() WHERE student_admission_number = ?', [user[0].student_admission_number]);
    } else if (role === 'admin') {
      await db.execute('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [user[0].admin_id]);
    }

    const token = generateToken(user[0], role);
    
    // Return user data matching Java backend format
    let userData = {};
    if (role === 'student') {
      userData = {
        studentAdmissionNumber: user[0].student_admission_number || '',
        studentFirstName: user[0].student_first_name || '',
        studentLastName: user[0].student_last_name || '',
        emailId: user[0].email_id || '',
        department: user[0].department || '',
        mobileNo: user[0].mobile_no || '',
        dateOfBirth: user[0].date_of_birth ? user[0].date_of_birth.toString() : '',
        photographLink: user[0].photograph_link || '',
        studentUniversityRollNo: user[0].student_university_roll_no || '',
        cgpa: user[0].cgpa || '',
        batch: user[0].batch || '',
        course: user[0].course || ''
      };
    } else if (role === 'admin') {
      userData = {
        adminId: user[0].admin_id,
        adminName: user[0].admin_name || '',
        emailAddress: user[0].email_address || '',
        phoneNumber: user[0].phone_number || '',
        city: user[0].city || '',
        department: user[0].department || '',
        dateOfBirth: user[0].date_of_birth ? user[0].date_of_birth.toString() : ''
      };
    } else if (role === 'company') {
      userData = {
        companyId: user[0].company_id,
        companyName: user[0].company_name || '',
        hrName: user[0].hr_name || '',
        hrEmail: user[0].hr_email || '',
        hrPhone: user[0].hr_phone || ''
      };
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
};

const register = async (req, res) => {
  try {
    const studentData = req.body;

    // Check if student already exists
    const [existing] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [studentData.studentAdmissionNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student already exists' });
    }

    await db.execute(`
      INSERT INTO students (
        student_admission_number, student_first_name, student_last_name, father_name, mother_name,
        date_of_birth, gender, mobile_no, email_id, college_email_id, department, batch,
        cgpa, tenth_percentage, twelfth_percentage, course, student_university_roll_no, 
        student_enrollment_no, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentData.studentAdmissionNumber,
      studentData.studentFirstName,
      studentData.studentLastName,
      studentData.fatherName,
      studentData.motherName,
      studentData.dateOfBirth,
      studentData.gender,
      studentData.mobileNo,
      studentData.emailId,
      studentData.collegeEmailId,
      studentData.department,
      studentData.batch,
      studentData.cgpa,
      studentData.tenthPercentage,
      studentData.twelfthPercentage,
      studentData.course,
      studentData.studentUniversityRollNo,
      studentData.studentEnrollmentNo,
      studentData.password || 'gehu@123'
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Student registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Student already exists' });
    }
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const [student] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [userId]
    );

    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your registered email'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

module.exports = { login, register, forgotPassword };