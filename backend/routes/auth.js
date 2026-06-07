const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToBlob = require('../middleware/uploadToBlob');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), upload.setUploadFilename, uploadToBlob, uploadAvatar);
router.put('/password', protect, changePassword);

module.exports = router;
