/**
 * When BLOB_READ_WRITE_TOKEN is set (Vercel or local), upload req.file (must be memory buffer)
 * to Vercel Blob and set req.body.photo | req.body.logo | req.body.thumbnail | req.body.imageUrl to the public URL.
 * Upload middleware uses memoryStorage when token is set so we never touch disk – avoids ENOENT locally.
 */
const { put } = require('@vercel/blob');

function getBodyKey(baseUrl) {
  if (baseUrl.includes('alumni') || baseUrl.includes('mentor')) return 'photo';
  if (baseUrl.includes('course') || baseUrl.includes('blog')) return 'thumbnail';
  if (baseUrl.includes('startup')) return 'logo';
  if (baseUrl.includes('offer')) return 'imageUrl';
  return 'photo';
}

function getBlobPath(baseUrl, filename) {
  if (baseUrl.includes('alumni')) return `uploads/alumni/${filename}`;
  if (baseUrl.includes('mentor')) return `uploads/mentors/${filename}`;
  if (baseUrl.includes('course')) return `uploads/courses/${filename}`;
  if (baseUrl.includes('blog')) return `uploads/blogs/${filename}`;
  if (baseUrl.includes('startup')) return `uploads/startups/${filename}`;
  if (baseUrl.includes('offer')) return `uploads/offers/${filename}`;
  return `uploads/general/${filename}`;
}

async function uploadToBlob(req, res, next) {
  if (!req.file || !process.env.BLOB_READ_WRITE_TOKEN) return next();
  const buffer = req.file.buffer;
  if (!buffer) return next(new Error('File buffer missing – set BLOB_READ_WRITE_TOKEN so upload uses memory storage'));
  try {
    const pathname = getBlobPath(req.baseUrl, req.file.filename);
    const { url } = await put(pathname, buffer, { access: 'public' });
    const key = getBodyKey(req.baseUrl);
    req.body[key] = url;
  } catch (err) {
    return next(err);
  }
  next();
}

module.exports = uploadToBlob;
