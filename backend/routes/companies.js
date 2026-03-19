const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/companyController');

router.get('/dashboard', auth, role('company'), c.getDashboard);
router.get('/profile', auth, role('company'), c.getProfile);
router.put('/profile', auth, role('company'), c.updateProfile);
router.put('/change-password', auth, role('company'), c.changePassword);

router.get('/events', auth, role('company'), c.getMyEvents);
router.post('/events', auth, role('company'), c.createEvent);
router.put('/events/:id', auth, role('company'), c.updateEvent);
router.delete('/events/:id', auth, role('company'), c.deleteEvent);

router.get('/events/:eventId/applicants', auth, role('company'), c.getEventApplicants);
router.put('/events/:eventId/applicants/:admissionNumber', auth, role('company'), c.updateApplicantStatus);
router.get('/applicants', auth, role('company'), c.getAllApplicants);

router.post('/messages', auth, role('company'), c.sendMessage);

module.exports = router;
