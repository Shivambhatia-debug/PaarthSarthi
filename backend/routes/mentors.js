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

// Public routes
router.get('/featured', getFeaturedMentors);
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('photo'), createMentor);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);
router.patch('/:id/toggle', protect, authorize('admin'), toggleMentorStatus);

module.exports = router;
