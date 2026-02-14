const express = require('express');
const router = express.Router();
const { createAdmission, getAdmissions, updateAdmission, deleteAdmission } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createAdmission);
router.get('/', protect, authorize('admin'), getAdmissions);
router.put('/:id', protect, authorize('admin'), updateAdmission);
router.delete('/:id', protect, authorize('admin'), deleteAdmission);

module.exports = router;
