const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

const newStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "BCC Gallery Images",
    allowFormats: ["jpeg", "png", "jpg", "webp"],
    transformation: [
        {
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto",
          effect: "sharpen"
        }
      ]
           
  },
});

const uploadImage = multer({ storage: newStorage });
module.exports = uploadImage;