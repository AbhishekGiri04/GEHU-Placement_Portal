const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Dashboard and analytics
router.get('/dashboard', auth, adminController.getDashboardData);
router.get('/analytics', auth, adminController.getAnalytics);

// Student management
router.get('/students', auth, adminController.getAllStudents);
router.post('/students/register', auth, adminController.registerStudent);
router.put('/students/:id', auth, adminController.updateStudent);
router.delete('/students/:id', auth, adminController.deleteStudent);

// Company management
router.get('/companies', auth, adminController.getAllCompanies);
router.post('/companies/register', auth, adminController.registerCompany);
router.put('/companies/:id', auth, adminController.updateCompany);

// Event management
router.get('/events', auth, adminController.getAllEvents);
router.post('/events', auth, adminController.createEvent);
router.put('/events/:id', auth, adminController.updateEvent);
router.delete('/events/:id', auth, adminController.deleteEvent);

// Reports
router.get('/reports/placements', auth, adminController.getPlacementReport);
router.get('/reports/students', auth, adminController.getStudentReport);

module.exports = router;