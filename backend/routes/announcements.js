const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Public — students read announcements without auth
router.get('/', async (req, res) => {
  try {
    const [announcements] = await db.execute(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
