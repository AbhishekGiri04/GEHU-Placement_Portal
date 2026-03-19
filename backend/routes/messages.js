const express = require('express');
const router = express.Router();
const c = require('../controllers/messageController');
const auth = require('../middleware/auth');
const role = require('../middleware/roleMiddleware');

// Public send
router.post('/send', c.sendMessage);

// Authenticated user — own messages
router.get('/mine', auth, c.getMyMessages);

// Admin-only management
router.get('/', auth, role('admin'), c.getAllMessages);
router.put('/:messageId/read', auth, role('admin'), c.markAsRead);
router.post('/:messageId/reply', auth, role('admin'), c.replyToMessage);
router.delete('/:messageId', auth, role('admin'), c.deleteMessage);

module.exports = router;
