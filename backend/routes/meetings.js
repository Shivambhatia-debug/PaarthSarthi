const express = require('express');
const router = express.Router();
const {
  bookMeeting,
  getMeetings,
  getMyMeetings,
  getMeetingById,
  updateMeetingStatus,
  cancelMeeting,
  addFeedback
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

// Public booking (no auth required - so anyone can book)
router.post('/', bookMeeting);

// Authenticated user routes
router.get('/my', protect, getMyMeetings);
router.put('/:id/cancel', protect, cancelMeeting);
router.put('/:id/feedback', protect, addFeedback);

// Admin routes
router.get('/', protect, authorize('admin'), getMeetings);
router.get('/:id', protect, authorize('admin'), getMeetingById);
router.put('/:id/status', protect, authorize('admin'), updateMeetingStatus);

module.exports = router;
