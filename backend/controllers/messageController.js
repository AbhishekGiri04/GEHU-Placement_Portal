const db = require('../config/database');

const sendMessage = async (req, res) => {
  try {
    const { sender_name, sender_email, subject, message } = req.body;
    const sender_role = req.user?.role || 'guest';

    await db.execute(
      "INSERT INTO messages (sender_name, sender_email, sender_role, subject, message) VALUES (?,?,?,?,?)",
      [sender_name, sender_email, sender_role, subject, message]
    );
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const email = req.user.email;
    const [messages] = await db.execute(
      'SELECT * FROM messages WHERE sender_email = ? ORDER BY created_at DESC',
      [email]
    );
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM messages';
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [messages] = await db.execute(query, params);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await db.execute(
      "UPDATE messages SET status = 'read' WHERE id = ? AND status = 'new'",
      [req.params.messageId]
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim())
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });

    const [msgRows] = await db.execute('SELECT * FROM messages WHERE id = ?', [req.params.messageId]);
    if (!msgRows.length) return res.status(404).json({ success: false, message: 'Message not found' });
    const msg = msgRows[0];

    await db.execute(
      "UPDATE messages SET reply = ?, replied_at = NOW(), status = 'replied' WHERE id = ?",
      [reply.trim(), req.params.messageId]
    );
    res.json({ success: true, message: 'Reply sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await db.execute('DELETE FROM messages WHERE id = ?', [req.params.messageId]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage, getMyMessages, getAllMessages, markAsRead, replyToMessage, deleteMessage };
