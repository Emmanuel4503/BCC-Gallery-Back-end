const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

try {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, 
  });
  console.log("Cloudinary configured successfully");
} catch (err) {
  console.error("Cloudinary configuration error:", err);
  throw new Error("Failed to configure Cloudinary");
}

module.exports = cloudinary;