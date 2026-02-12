const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContacts,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.post('/', submitContact);

// Admin routes
router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id', protect, authorize('admin'), updateContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
