const express = require('express');
const router = express.Router();
const c = require('../controllers/eventController');

// All public — no auth needed for browsing events
router.get('/', c.getAllEvents);
router.get('/upcoming', c.getUpcomingEvents);
router.get('/company/:companyId', c.getEventsByCompany);
router.get('/:id', c.getEventById);

module.exports = router;
