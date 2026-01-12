const db = require('../config/database');

const registerForEvent = async (req, res) => {
  try {
    const { studentAdmissionNumber, eventId } = req.body;

    // Check if student already registered
    const [existing] = await db.execute(
      'SELECT * FROM participation WHERE student_admission_number = ? AND event_id = ?',
      [studentAdmissionNumber, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    // Check if event exists and is open for registration
    const [event] = await db.execute(
      'SELECT * FROM events WHERE event_id = ? AND status IN ("UPCOMING", "ONGOING") AND registration_end > NOW()',
      [eventId]
    );

    if (!event.length) {
      return res.status(400).json({ success: false, message: 'Event not available for registration' });
    }

    // Register student for event
    await db.execute(
      'INSERT INTO participation (student_admission_number, event_id, participation_status) VALUES (?, ?, "REGISTERED")',
      [studentAdmissionNumber, eventId]
    );

    res.json({ success: true, message: 'Successfully registered for the event' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getStudentParticipations = async (req, res) => {
  try {
    const { studentAdmissionNumber } = req.params;

    const [participations] = await db.execute(`
      SELECT p.*, e.event_name, e.organizing_company, e.job_role, e.expected_package, e.status as event_status
      FROM participation p
      JOIN events e ON p.event_id = e.event_id
      WHERE p.student_admission_number = ?
      ORDER BY p.created_at DESC
    `, [studentAdmissionNumber]);

    res.json(participations);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getEventParticipations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [participations] = await db.execute(`
      SELECT p.*, s.student_first_name, s.student_last_name, s.department, s.cgpa, s.batch
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      WHERE p.event_id = ?
      ORDER BY p.created_at DESC
    `, [eventId]);

    res.json(participations);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateParticipationStatus = async (req, res) => {
  try {
    const { studentAdmissionNumber, eventId } = req.params;
    const { status, eventDescription } = req.body;

    const [existing] = await db.execute(
      'SELECT * FROM participation WHERE student_admission_number = ? AND event_id = ?',
      [studentAdmissionNumber, eventId]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Participation record not found' });
    }

    await db.execute(
      'UPDATE participation SET participation_status = ?, event_description = ? WHERE student_admission_number = ? AND event_id = ?',
      [status, eventDescription, studentAdmissionNumber, eventId]
    );

    res.json({ success: true, message: 'Participation status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllParticipations = async (req, res) => {
  try {
    const [participations] = await db.execute(`
      SELECT p.*, 
        s.student_first_name, s.student_last_name, s.department, s.cgpa, s.batch,
        e.event_name, e.organizing_company, e.job_role, e.expected_package
      FROM participation p
      JOIN students s ON p.student_admission_number = s.student_admission_number
      JOIN events e ON p.event_id = e.event_id
      ORDER BY p.created_at DESC
    `);

    res.json(participations);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteParticipation = async (req, res) => {
  try {
    const { studentAdmissionNumber, eventId } = req.params;

    const [existing] = await db.execute(
      'SELECT * FROM participation WHERE student_admission_number = ? AND event_id = ?',
      [studentAdmissionNumber, eventId]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Participation record not found' });
    }

    await db.execute(
      'DELETE FROM participation WHERE student_admission_number = ? AND event_id = ?',
      [studentAdmissionNumber, eventId]
    );

    res.json({ success: true, message: 'Participation record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerForEvent,
  getStudentParticipations,
  getEventParticipations,
  updateParticipationStatus,
  getAllParticipations,
  deleteParticipation
};