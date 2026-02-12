const express = require('express');
const router = express.Router();
const {
  getStartups,
  getStartupById,
  createStartup,
  updateStartup,
  deleteStartup,
  addMilestone
} = require('../controllers/startupController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToBlob = require('../middleware/uploadToBlob');

// Public routes
router.get('/', getStartups);
router.get('/:id', getStartupById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('logo'), upload.setUploadFilename, uploadToBlob, createStartup);
router.put('/:id', protect, authorize('admin'), upload.single('logo'), upload.setUploadFilename, uploadToBlob, updateStartup);
router.delete('/:id', protect, authorize('admin'), deleteStartup);
router.post('/:id/milestones', protect, authorize('admin'), addMilestone);

module.exports = router;
