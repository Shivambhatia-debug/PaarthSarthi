const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getWebinars,
  togglePublish
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/webinars', getWebinars);
router.get('/slug/:slug', getCourseBySlug);
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('thumbnail'), upload.setUploadFilename, createCourse);
router.put('/:id', protect, authorize('admin'), upload.single('thumbnail'), upload.setUploadFilename, updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.patch('/:id/publish', protect, authorize('admin'), togglePublish);

module.exports = router;
