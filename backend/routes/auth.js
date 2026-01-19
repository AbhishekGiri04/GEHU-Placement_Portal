const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Student routes
router.post('/students/login', authController.studentLogin);
router.post('/students/register', authController.studentRegister);

// Admin routes
router.post('/admins/login', authController.adminLogin);

// Company routes
router.post('/companies/login', authController.companyLogin);
router.post('/companies/register', authController.companyRegister);

// Logout
router.post('/logout', authController.logout);

module.exports = router;