const express = require('express');
const router = express.Router();
const { getOffers, getAllOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToBlob = require('../middleware/uploadToBlob');

router.get('/', getOffers);
router.get('/admin', protect, authorize('admin'), getAllOffers);
router.post('/', protect, authorize('admin'), upload.single('image'), upload.setUploadFilename, uploadToBlob, createOffer);
router.put('/:id', protect, authorize('admin'), upload.single('image'), upload.setUploadFilename, uploadToBlob, updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
