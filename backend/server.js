const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// Import controllers
const { login, register, forgotPassword } = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const adminController = require('./controllers/adminController');
const eventController = require('./controllers/eventController');
const participationController = require('./controllers/participationController');
const messageController = require('./controllers/messageController');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const studentId = req.params.admissionNumber;
    cb(null, `${studentId}_${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../src')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication Routes
app.post('/api/students/login', login);
app.post('/api/admins/login', login);
app.post('/api/companies/login', login);
app.post('/api/students/register', register);
app.post('/api/students/forgot-password', forgotPassword);

// Student Routes (matching Java backend)
app.get('/api/students', studentController.getAllStudents);
app.get('/api/students/:admissionNumber', studentController.getStudent);
app.put('/api/students/:admissionNumber', studentController.updateStudent);
app.delete('/api/students/:admissionNumber', studentController.deleteStudent);
app.post('/api/students/:admissionNumber/resume', upload.single('resume'), studentController.uploadResume);
app.post('/api/students/:admissionNumber/resume-drive-link', studentController.updateResumeDriveLink);
app.get('/api/students/:admissionNumber/resume-drive-link', studentController.getResumeDriveLink);
app.get('/api/students/filter', studentController.filterStudents);

// Admin Routes (matching Java backend)
app.get('/api/admins', adminController.getAllAdmins);
app.get('/api/admins/:adminId', adminController.getAdminById);
app.post('/api/admins/create', adminController.createAdmin);
app.put('/api/admins/:adminId/update', adminController.updateAdmin);
app.delete('/api/admins/:adminId', adminController.deleteAdmin);
app.post('/api/admins/:adminId/change-password', adminController.changePassword);
app.post('/api/admins/:adminId/update-last-login', adminController.updateLastLogin);
app.get('/api/admins/dashboard/stats', adminController.getDashboardStats);

// Event Routes (matching Java backend)
app.post('/api/events/create', eventController.createEvent);
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/:id', eventController.getEventById);
app.put('/api/events/:id', eventController.updateEvent);
app.delete('/api/events/:id', eventController.deleteEvent);
app.get('/api/events/status/:status', eventController.getEventsByStatus);
app.get('/api/events/search', eventController.searchEventsByCompany);
app.get('/api/events/upcoming', eventController.getUpcomingEvents);
app.get('/api/events/ongoing', eventController.getOngoingEvents);
app.get('/api/events/past', eventController.getPastEvents);
app.get('/api/events/company/:companyName', eventController.getEventsByCompany);

// Participation Routes
app.post('/api/participation/register', participationController.registerForEvent);
app.get('/api/participation/student/:studentAdmissionNumber', participationController.getStudentParticipations);
app.get('/api/participation/event/:eventId', participationController.getEventParticipations);
app.put('/api/participation/:studentAdmissionNumber/:eventId', participationController.updateParticipationStatus);
app.get('/api/participation', participationController.getAllParticipations);
app.delete('/api/participation/:studentAdmissionNumber/:eventId', participationController.deleteParticipation);

// Message Routes
app.post('/api/messages/send', messageController.sendMessage);
app.get('/api/messages', messageController.getAllMessages);
app.put('/api/messages/:messageId/status', messageController.updateMessageStatus);

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/login-page.html'));
});

app.get('/student-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/student-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/admin-dashboard.html'));
});

app.get('/company-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/company-dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'GEHU Placement Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log('🎓 ===============================================');
  console.log('🚀 GEHU PLACEMENT PORTAL SERVER STARTED');
  console.log('🎓 ===============================================');
  console.log(`📊 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log('🎓 ===============================================');
  console.log('🔐 DEFAULT CREDENTIALS:');
  console.log('👨💼 Admin: admin@gehu.edu / admin123');
  console.log('🎓 Student: 2318169 / gehu@123');
  console.log('🎓 ===============================================');
});

module.exports = app;