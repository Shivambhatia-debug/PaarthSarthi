const express = require('express');
const router = express.Router();
const {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  toggleMentorStatus,
  getFeaturedMentors
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToBlob = require('../middleware/uploadToBlob');

// Public routes
router.get('/featured', getFeaturedMentors);
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('photo'), upload.setUploadFilename, uploadToBlob, createMentor);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), upload.setUploadFilename, uploadToBlob, updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);
router.patch('/:id/toggle', protect, authorize('admin'), toggleMentorStatus);

module.exports = router;
