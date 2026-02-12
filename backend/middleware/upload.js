const multer = require('multer');
const path = require('path');

function getFilename(file) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
}

// On Vercel, disk is not persistent/writable – use memory so upload doesn't throw ENOENT
const diskStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'uploads/';
    if (req.baseUrl.includes('alumni')) uploadPath += 'alumni/';
    else if (req.baseUrl.includes('mentor')) uploadPath += 'mentors/';
    else if (req.baseUrl.includes('course')) uploadPath += 'courses/';
    else if (req.baseUrl.includes('blog')) uploadPath += 'blogs/';
    else if (req.baseUrl.includes('startup')) uploadPath += 'startups/';
    else uploadPath += 'general/';
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    cb(null, getFilename(file));
  }
});

const storage = process.env.VERCEL === '1' ? multer.memoryStorage() : diskStorage;

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

// On Vercel (memoryStorage), req.file has no .filename – set it so controllers work unchanged
upload.setUploadFilename = (req, res, next) => {
  if (req.file && !req.file.filename) req.file.filename = getFilename(req.file);
  next();
};

module.exports = upload;
