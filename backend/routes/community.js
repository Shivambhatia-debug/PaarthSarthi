const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  deletePost,
  createComment,
  getComments,
  toggleLikeComment,
  deleteComment
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// All community routes require authentication
router.use(protect);

// Post routes
router.get('/posts', getPosts);
router.post('/posts', createPost);
router.get('/posts/:id', getPostById);
router.post('/posts/:id/like', toggleLikePost);
router.delete('/posts/:id', deletePost);

// Comment routes
router.post('/posts/:id/comments', createComment);
router.get('/posts/:id/comments', getComments);
router.post('/comments/:id/like', toggleLikeComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;
