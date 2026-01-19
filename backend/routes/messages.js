const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Send message
router.post('/send', messageController.sendMessage);

// Get messages (admin only)
router.get('/', auth, messageController.getMessages);

// Mark as read
router.put('/:id/read', auth, messageController.markAsRead);

module.exports = router;