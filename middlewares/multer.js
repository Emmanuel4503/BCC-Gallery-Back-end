const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

try {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'BCC Gallery Images',
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif'],
    },
});

  const uploadImage = multer({ storage });
  console.log('Multer instance created:', uploadImage);
  module.exports = uploadImage;
} catch (err) {
  console.error('Multer configuration error:', err);
  throw new Error('Failed to initialize Multer with Cloudinary');
}