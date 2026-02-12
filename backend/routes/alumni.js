const express = require('express');
const router = express.Router();
const {
  getAlumni,
  getAlumniById,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  toggleAlumniStatus
} = require('../controllers/alumniController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAlumni);
router.get('/:id', getAlumniById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('photo'), upload.setUploadFilename, createAlumni);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), upload.setUploadFilename, updateAlumni);
router.delete('/:id', protect, authorize('admin'), deleteAlumni);
router.patch('/:id/toggle', protect, authorize('admin'), toggleAlumniStatus);

module.exports = router;
