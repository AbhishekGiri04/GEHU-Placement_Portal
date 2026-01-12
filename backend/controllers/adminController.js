const db = require('../config/database');

const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.execute('SELECT * FROM admins ORDER BY admin_name ASC');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { adminId } = req.params;
    const [admin] = await db.execute('SELECT * FROM admins WHERE admin_id = ?', [adminId]);

    if (!admin.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const adminData = {
      adminId: admin[0].admin_id,
      adminName: admin[0].admin_name,
      emailAddress: admin[0].email_address,
      phoneNumber: admin[0].phone_number,
      city: admin[0].city,
      department: admin[0].department,
      dateOfBirth: admin[0].date_of_birth
    };

    res.json({ success: true, admin: adminData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin profile: ' + error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const adminData = req.body;

    // Check if admin already exists
    const [existing] = await db.execute(
      'SELECT admin_id FROM admins WHERE email_address = ?',
      [adminData.emailAddress]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const [result] = await db.execute(`
      INSERT INTO admins (admin_name, email_address, phone_number, city, department, date_of_birth, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      adminData.adminName,
      adminData.emailAddress,
      adminData.phoneNumber,
      adminData.city,
      adminData.department,
      adminData.dateOfBirth,
      adminData.password
    ]);

    const [newAdmin] = await db.execute('SELECT * FROM admins WHERE admin_id = ?', [result.insertId]);
    res.status(201).json(newAdmin[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const adminData = req.body;

    const [existing] = await db.execute('SELECT admin_id FROM admins WHERE admin_id = ?', [adminId]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await db.execute(`
      UPDATE admins SET 
        admin_name = ?, email_address = ?, phone_number = ?, city = ?, department = ?
      WHERE admin_id = ?
    `, [
      adminData.adminName,
      adminData.emailAddress,
      adminData.phoneNumber,
      adminData.city,
      adminData.department,
      adminId
    ]);

    const [updatedAdmin] = await db.execute('SELECT * FROM admins WHERE admin_id = ?', [adminId]);

    const adminResponse = {
      adminId: updatedAdmin[0].admin_id,
      adminName: updatedAdmin[0].admin_name,
      emailAddress: updatedAdmin[0].email_address,
      phoneNumber: updatedAdmin[0].phone_number,
      city: updatedAdmin[0].city,
      department: updatedAdmin[0].department,
      dateOfBirth: updatedAdmin[0].date_of_birth
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile: ' + error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const [existing] = await db.execute('SELECT admin_id FROM admins WHERE admin_id = ?', [adminId]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await db.execute('DELETE FROM admins WHERE admin_id = ?', [adminId]);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const [admin] = await db.execute('SELECT * FROM admins WHERE admin_id = ?', [adminId]);

    if (!admin.length) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Check current password
    if (admin[0].password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    await db.execute('UPDATE admins SET password = ? WHERE admin_id = ?', [newPassword, adminId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error changing password: ' + error.message });
  }
};

const updateLastLogin = async (req, res) => {
  try {
    const { adminId } = req.params;

    await db.execute('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [adminId]);
    res.json({ success: true, message: 'Last login updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM companies) as total_companies,
        (SELECT COUNT(*) FROM events WHERE status = 'UPCOMING') as upcoming_events,
        (SELECT COUNT(*) FROM participation) as total_applications
    `);

    const [recentApplications] = await db.execute(`
      SELECT p.*, s.student_first_name, s.student_last_name, e.event_name, e.organizing_company
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      JOIN events e ON p.event_id = e.event_id
      ORDER BY p.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        recentApplications: recentApplications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changePassword,
  updateLastLogin,
  getDashboardStats
};