const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/studentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/resumes')),
  // Sanitize filename: only admission number + timestamp, force .pdf extension
  filename: (req, file, cb) => cb(null, `${req.user.id}_${Date.now()}.pdf`)
});

const fileFilter = (req, file, cb) => {
  const allowedMime = 'application/pdf';
  const allowedExt = '.pdf';
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === allowedMime && ext === allowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Multer error handler for this route
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'File size must be under 5MB' : err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.get('/dashboard', auth, role('student'), c.getDashboard);
router.get('/profile', auth, role('student'), c.getProfile);
router.put('/profile', auth, role('student'), c.updateProfile);
router.put('/change-password', auth, role('student'), c.changePassword);
router.post('/resume/upload', auth, role('student'), handleUpload, c.uploadResume);
router.put('/resume/link', auth, role('student'), c.updateResumeLink);
router.get('/applications', auth, role('student'), c.getApplications);
router.post('/apply/:eventId', auth, role('student'), c.applyToEvent);
router.delete('/withdraw/:eventId', auth, role('student'), c.withdrawApplication);

module.exports = router;
