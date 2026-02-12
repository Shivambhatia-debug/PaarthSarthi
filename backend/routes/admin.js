const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  createAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/create-admin', createAdmin);

module.exports = router;
