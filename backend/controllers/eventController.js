const db = require('../config/database');

const createEvent = async (req, res) => {
  try {
    const eventData = req.body;

    const [result] = await db.execute(`
      INSERT INTO events (
        event_name, organizing_company, expected_cgpa, job_role, registration_start,
        registration_end, event_mode, expected_package, event_description, eligible_departments, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventData.eventName,
      eventData.organizingCompany,
      eventData.expectedCgpa,
      eventData.jobRole,
      eventData.registrationStart,
      eventData.registrationEnd,
      eventData.eventMode,
      eventData.expectedPackage,
      eventData.eventDescription,
      eventData.eligibleDepartments,
      eventData.status || 'UPCOMING'
    ]);

    const [newEvent] = await db.execute('SELECT * FROM events WHERE event_id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const [events] = await db.execute('SELECT * FROM events ORDER BY created_at DESC');
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [event] = await db.execute('SELECT * FROM events WHERE event_id = ?', [id]);

    if (!event.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json(event[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const [existing] = await db.execute('SELECT event_id FROM events WHERE event_id = ?', [id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await db.execute(`
      UPDATE events SET 
        event_name = ?, organizing_company = ?, expected_cgpa = ?, job_role = ?,
        registration_start = ?, registration_end = ?, event_mode = ?, expected_package = ?,
        event_description = ?, eligible_departments = ?, status = ?
      WHERE event_id = ?
    `, [
      eventData.eventName,
      eventData.organizingCompany,
      eventData.expectedCgpa,
      eventData.jobRole,
      eventData.registrationStart,
      eventData.registrationEnd,
      eventData.eventMode,
      eventData.expectedPackage,
      eventData.eventDescription,
      eventData.eligibleDepartments,
      eventData.status,
      id
    ]);

    const [updatedEvent] = await db.execute('SELECT * FROM events WHERE event_id = ?', [id]);
    res.json(updatedEvent[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT event_id FROM events WHERE event_id = ?', [id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await db.execute('DELETE FROM events WHERE event_id = ?', [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const [events] = await db.execute('SELECT * FROM events WHERE status = ? ORDER BY created_at DESC', [status]);
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const searchEventsByCompany = async (req, res) => {
  try {
    const { company } = req.query;
    const [events] = await db.execute(
      'SELECT * FROM events WHERE organizing_company LIKE ? ORDER BY created_at DESC',
      [`%${company}%`]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const [events] = await db.execute(
      'SELECT * FROM events WHERE status = "UPCOMING" ORDER BY registration_start ASC'
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getOngoingEvents = async (req, res) => {
  try {
    const [events] = await db.execute(
      'SELECT * FROM events WHERE status = "ONGOING" ORDER BY registration_start ASC'
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPastEvents = async (req, res) => {
  try {
    const [events] = await db.execute(
      'SELECT * FROM events WHERE status = "COMPLETED" ORDER BY registration_end DESC'
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getEventsByCompany = async (req, res) => {
  try {
    const { companyName } = req.params;
    const [events] = await db.execute(
      'SELECT * FROM events WHERE organizing_company = ? ORDER BY created_at DESC',
      [companyName]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByStatus,
  searchEventsByCompany,
  getUpcomingEvents,
  getOngoingEvents,
  getPastEvents,
  getEventsByCompany
};