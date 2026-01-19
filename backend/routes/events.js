const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', auth, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

// Event participation
router.get('/:id/participants', auth, eventController.getEventParticipants);
router.post('/:id/apply', auth, eventController.applyToEvent);

module.exports = router;