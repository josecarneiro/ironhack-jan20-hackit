const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  resource_type: 'raw'
});

const storage = multerStorageCloudinary({
  cloudinary,
  folder: 'hackit',
  // resource_type: 'raw'
  allowedFormats: ['jpg', 'png', 'gif'],
  transformation: [{ width: 1024, crop: 'limit' }]
});

const uploader = multer({ storage, limit: { fileSize: 2 * 1024 * 1024, files: 10 } });

module.exports = uploader;
