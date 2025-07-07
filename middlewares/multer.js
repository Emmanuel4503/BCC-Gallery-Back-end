const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

try {
  // Verify cloudinary is properly configured
  if (!cloudinary || !cloudinary.config().cloud_name) {
    throw new Error('Cloudinary is not properly configured');
  }

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'BCC Gallery Images',
      allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif'],
      // Add resource type for images
      resource_type: 'image',
      // Add transformation to optimize uploads
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    },
  });

  const uploadImage = multer({ 
    storage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 100 
    },
    fileFilter: (req, file, cb) => {
      console.log('File filter check:', file.mimetype);
      
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

  console.log('Multer instance created successfully');
  module.exports = uploadImage;

} catch (err) {
  console.error('Multer configuration error:', err);
  throw new Error(`Failed to initialize Multer with Cloudinary: ${err.message}`);
}