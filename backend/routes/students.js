const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Student profile routes
router.get('/profile', auth, studentController.getProfile);
router.put('/profile', auth, studentController.updateProfile);
router.post('/resume', auth, upload.single('resume'), studentController.uploadResume);

// Application routes
router.get('/applications', auth, studentController.getApplications);
router.post('/apply/:eventId', auth, studentController.applyToEvent);

// Dashboard data
router.get('/dashboard', auth, studentController.getDashboardData);

module.exports = router;