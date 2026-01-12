const db = require('../config/database');

const getAllStudents = async (req, res) => {
  try {
    const [students] = await db.execute('SELECT * FROM students ORDER BY student_first_name ASC');
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    const [student] = await db.execute(
      'SELECT * FROM students WHERE student_admission_number = ?', 
      [admissionNumber]
    );

    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found with admission number: ' + admissionNumber });
    }

    res.json(student[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    const studentData = req.body;

    const [existing] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [admissionNumber]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await db.execute(`
      UPDATE students SET 
        student_first_name = ?, student_last_name = ?, father_name = ?, mother_name = ?,
        date_of_birth = ?, gender = ?, mobile_no = ?, email_id = ?, college_email_id = ?,
        department = ?, batch = ?, cgpa = ?, tenth_percentage = ?, twelfth_percentage = ?,
        back_logs_count = ?, address = ?, resume_link = ?, photograph_link = ?,
        course = ?, student_university_roll_no = ?, student_enrollment_no = ?
      WHERE student_admission_number = ?
    `, [
      studentData.studentFirstName, studentData.studentLastName, studentData.fatherName, studentData.motherName,
      studentData.dateOfBirth, studentData.gender, studentData.mobileNo, studentData.emailId, studentData.collegeEmailId,
      studentData.department, studentData.batch, studentData.cgpa, studentData.tenthPercentage, studentData.twelfthPercentage,
      studentData.backLogsCount, studentData.address, studentData.resumeLink, studentData.photographLink,
      studentData.course, studentData.studentUniversityRollNo, studentData.studentEnrollmentNo, admissionNumber
    ]);

    const [updatedStudent] = await db.execute(
      'SELECT * FROM students WHERE student_admission_number = ?',
      [admissionNumber]
    );

    res.json(updatedStudent[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    const [existing] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [admissionNumber]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await db.execute('DELETE FROM students WHERE student_admission_number = ?', [admissionNumber]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or Word document' });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size should be less than 5MB' });
    }

    const resumeLink = `/uploads/resumes/${admissionNumber}_${file.originalname}`;

    await db.execute(
      'UPDATE students SET resume_link = ? WHERE student_admission_number = ?',
      [resumeLink, admissionNumber]
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeLink: resumeLink
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload resume: ' + error.message });
  }
};

const updateResumeDriveLink = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    const { driveLink } = req.body;

    if (!driveLink || driveLink.trim() === '') {
      return res.status(400).json({ success: false, message: 'Drive link is required' });
    }

    // Validate Google Drive link
    const isValidDriveLink = (link) => {
      return link.includes('drive.google.com') || link.includes('docs.google.com') || link.startsWith('https://');
    };

    if (!isValidDriveLink(driveLink)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Google Drive shareable link' });
    }

    const [student] = await db.execute(
      'SELECT student_admission_number FROM students WHERE student_admission_number = ?',
      [admissionNumber]
    );

    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await db.execute(
      'UPDATE students SET resume_link = ? WHERE student_admission_number = ?',
      [driveLink, admissionNumber]
    );

    res.json({
      success: true,
      message: 'Resume drive link updated successfully',
      resumeLink: driveLink
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update resume link: ' + error.message });
  }
};

const getResumeDriveLink = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    const [student] = await db.execute(
      'SELECT resume_link FROM students WHERE student_admission_number = ?',
      [admissionNumber]
    );

    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const resumeLink = student[0].resume_link;

    res.json({
      success: true,
      resumeLink: resumeLink || '',
      hasResume: resumeLink && resumeLink.trim() !== ''
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get resume link: ' + error.message });
  }
};

const filterStudents = async (req, res) => {
  try {
    const { department, minCgpa, maxBacklogs, batch } = req.query;

    let query = 'SELECT * FROM students WHERE 1=1';
    let params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (minCgpa) {
      query += ' AND cgpa >= ?';
      params.push(parseFloat(minCgpa));
    }
    if (maxBacklogs) {
      query += ' AND back_logs_count <= ?';
      params.push(parseInt(maxBacklogs));
    }
    if (batch) {
      query += ' AND batch = ?';
      params.push(batch);
    }

    query += ' ORDER BY student_first_name ASC';

    const [students] = await db.execute(query, params);
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadResume,
  updateResumeDriveLink,
  getResumeDriveLink,
  filterStudents
};