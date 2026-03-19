const db = require('../config/database');

const getAllEvents = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND e.status = ?'; params.push(status); }
    if (search) {
      where += ' AND (e.event_name LIKE ? OR c.company_name LIKE ? OR e.job_role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [events] = await db.execute(`
      SELECT e.*, c.company_name,
        (SELECT COUNT(*) FROM participation p WHERE p.event_id = e.event_id) AS applicant_count
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      ${where}
      ORDER BY e.created_at DESC
    `, params);

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT e.*, c.company_name
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      WHERE e.status = 'UPCOMING' AND e.registration_end > NOW()
      ORDER BY e.registration_end ASC
    `);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const [[event]] = await db.execute(`
      SELECT e.*, c.company_name, c.hr_name, c.hr_email
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      WHERE e.event_id = ?
    `, [req.params.id]);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEventsByCompany = async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT e.*, c.company_name
      FROM events e
      JOIN companies c ON e.company_id = c.company_id
      WHERE e.company_id = ?
      ORDER BY e.created_at DESC
    `, [req.params.companyId]);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllEvents, getUpcomingEvents, getEventById, getEventsByCompany };
