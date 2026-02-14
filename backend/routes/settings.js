const express = require('express');
const router = express.Router();
const { getTicker, updateTicker } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/ticker', getTicker);
router.put('/ticker', protect, authorize('admin'), updateTicker);

module.exports = router;
