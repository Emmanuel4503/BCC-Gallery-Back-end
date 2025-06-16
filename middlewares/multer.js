const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

try {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "BCC Gallery Images",
      allowed_formats: ["jpeg", "png", "jpg", "webp"],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const filename = file.originalname.split(".")[0];
        return `${filename}-${timestamp}`; 
      },
    },
  });

  const uploadImage = multer({ storage });
  console.log("Multer instance created successfully");
  module.exports = uploadImage;
} catch (err) {
  console.error("Multer configuration error:", err);
  throw new Error("Failed to initialize Multer with Cloudinary");
}