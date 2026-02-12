const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Organize uploads by type
    if (req.baseUrl.includes('alumni')) {
      uploadPath += 'alumni/';
    } else if (req.baseUrl.includes('mentor')) {
      uploadPath += 'mentors/';
    } else if (req.baseUrl.includes('course')) {
      uploadPath += 'courses/';
    } else if (req.baseUrl.includes('blog')) {
      uploadPath += 'blogs/';
    } else if (req.baseUrl.includes('startup')) {
      uploadPath += 'startups/';
    } else {
      uploadPath += 'general/';
    }

    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

module.exports = upload;
