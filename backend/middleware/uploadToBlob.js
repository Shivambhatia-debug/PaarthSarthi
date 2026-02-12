/**
 * When running on Vercel with BLOB_READ_WRITE_TOKEN, upload req.file (memory buffer)
 * to Vercel Blob and set req.body.photo | req.body.logo | req.body.thumbnail to the public URL.
 * Controllers should use: req.body.photo = req.body.photo || `/uploads/.../filename`
 * so they don't overwrite the Blob URL.
 */
const { put } = require('@vercel/blob');

function getBodyKey(baseUrl) {
  if (baseUrl.includes('alumni') || baseUrl.includes('mentor')) return 'photo';
  if (baseUrl.includes('course') || baseUrl.includes('blog')) return 'thumbnail';
  if (baseUrl.includes('startup')) return 'logo';
  return 'photo';
}

function getBlobPath(baseUrl, filename) {
  if (baseUrl.includes('alumni')) return `uploads/alumni/${filename}`;
  if (baseUrl.includes('mentor')) return `uploads/mentors/${filename}`;
  if (baseUrl.includes('course')) return `uploads/courses/${filename}`;
  if (baseUrl.includes('blog')) return `uploads/blogs/${filename}`;
  if (baseUrl.includes('startup')) return `uploads/startups/${filename}`;
  return `uploads/general/${filename}`;
}

async function uploadToBlob(req, res, next) {
  if (!req.file || process.env.VERCEL !== '1' || !process.env.BLOB_READ_WRITE_TOKEN) {
    return next();
  }
  try {
    const pathname = getBlobPath(req.baseUrl, req.file.filename);
    const { url } = await put(pathname, req.file.buffer, { access: 'public' });
    const key = getBodyKey(req.baseUrl);
    req.body[key] = url;
  } catch (err) {
    return next(err);
  }
  next();
}

module.exports = uploadToBlob;
