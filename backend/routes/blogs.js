const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getBlogCategories
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/categories', getBlogCategories);
router.get('/slug/:slug', getBlogBySlug);
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/:id/like', likeBlog);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('thumbnail'), createBlog);
router.put('/:id', protect, authorize('admin'), upload.single('thumbnail'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
