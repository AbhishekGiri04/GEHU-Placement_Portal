const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/adminController');

router.get('/dashboard', auth, role('admin'), c.getDashboardStats);
router.get('/analytics', auth, role('admin'), c.getAnalytics);
router.get('/profile', auth, role('admin'), c.getProfile);
router.put('/profile', auth, role('admin'), c.updateProfile);
router.put('/change-password', auth, role('admin'), c.changePassword);

router.get('/students', auth, role('admin'), c.getAllStudents);
router.post('/students', auth, role('admin'), c.registerStudent);
router.put('/students/:id', auth, role('admin'), c.updateStudent);
router.delete('/students/:id', auth, role('admin'), c.deleteStudent);

router.get('/companies', auth, role('admin'), c.getAllCompanies);
router.post('/companies', auth, role('admin'), c.registerCompany);
router.put('/companies/:id', auth, role('admin'), c.updateCompany);
router.delete('/companies/:id', auth, role('admin'), c.deleteCompany);

router.get('/events', auth, role('admin'), c.getAllEvents);
router.post('/events', auth, role('admin'), c.createEvent);
router.put('/events/:id', auth, role('admin'), c.updateEvent);
router.delete('/events/:id', auth, role('admin'), c.deleteEvent);

router.get('/messages', auth, role('admin'), c.getMessages);
router.put('/messages/:id/read', auth, role('admin'), c.markMessageRead);
router.post('/messages/:id/reply', auth, role('admin'), c.replyToMessage);
router.delete('/messages/:id', auth, role('admin'), c.deleteMessage);

router.get('/announcements', auth, role('admin'), c.getAnnouncements);
router.post('/announcements', auth, role('admin'), c.createAnnouncement);
router.put('/announcements/:id', auth, role('admin'), c.updateAnnouncement);
router.delete('/announcements/:id', auth, role('admin'), c.deleteAnnouncement);

module.exports = router;
