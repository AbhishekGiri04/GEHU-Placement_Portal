const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/students/login', auth.studentLogin);
router.post('/students/register', auth.studentRegister);
router.post('/admins/login', auth.adminLogin);
router.post('/companies/login', auth.companyLogin);
router.post('/companies/register', auth.companyRegister);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/logout', auth.logout);

module.exports = router;
