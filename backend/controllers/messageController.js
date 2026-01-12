const db = require('../config/database');

const sendMessage = async (req, res) => {
  try {
    const { sender_name, sender_email, subject, message } = req.body;

    if (!sender_name || !sender_email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Save message to database
    await db.execute(`
      INSERT INTO messages (sender_name, sender_email, subject, message, status)
      VALUES (?, ?, ?, ?, 'new')
    `, [sender_name, sender_email, subject, message]);

    // In a real application, you would send email here using nodemailer
    // For now, we'll just save to database and return success
    
    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const [messages] = await db.execute(`
      SELECT * FROM messages ORDER BY created_at DESC
    `);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    await db.execute('UPDATE messages SET status = ? WHERE id = ?', [status, messageId]);
    res.json({ success: true, message: 'Message status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
  updateMessageStatus
};