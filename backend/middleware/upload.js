const multer = require('multer');
const path = require('path');
const fs = require('fs');

function getFilename(file) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
}

// When using Blob (token set) or on Vercel: keep file in memory so we can upload to Blob without touching disk (avoids ENOENT locally).
// Otherwise use disk for local dev – create dir if missing so multer doesn't throw ENOENT.
const diskStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'uploads/';
    if (req.baseUrl.includes('alumni')) uploadPath += 'alumni/';
    else if (req.baseUrl.includes('mentor')) uploadPath += 'mentors/';
    else if (req.baseUrl.includes('course')) uploadPath += 'courses/';
    else if (req.baseUrl.includes('blog')) uploadPath += 'blogs/';
    else if (req.baseUrl.includes('startup')) uploadPath += 'startups/';
    else if (req.baseUrl.includes('offer')) uploadPath += 'offers/';
    else uploadPath += 'general/';
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (e) {
      return cb(e);
    }
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    cb(null, getFilename(file));
  }
});

const useMemoryStorage = process.env.VERCEL === '1' || !!process.env.BLOB_READ_WRITE_TOKEN;
const storage = useMemoryStorage ? multer.memoryStorage() : diskStorage;

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
