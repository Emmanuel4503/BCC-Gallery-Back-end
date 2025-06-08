    const express = require("express");
    const {
    addImage,
    getImages,
    getSelectedImages,
    deleteImage,
    getImagesByAlbum,
    addReaction,
    getUserReactions,
    getImageCount
    } = require("../controller/imagesController");

    const imageController = require("../controller/imagesController")

    const uploadImage = require("../middlewares/multer");

    const imageRouter = express.Router();

   
    imageRouter.post("/upload", uploadImage.array("primaryImage"), addImage);

  
    imageRouter.get("/latest", getImages);

    imageRouter.get("/selected", getSelectedImages);

    // Route to delete an image by MongoDB ID
    imageRouter.delete("/delete/:id", deleteImage);

    imageRouter.get("/album/:album", getImagesByAlbum);

    imageRouter.post("/react", addReaction);
    imageRouter.get('/reactions', getUserReactions);
    imageRouter.get('/count', imageController.getImageCount);

    // New proxy route
imageRouter.get('/proxy-image/:publicId', async (req, res) => {
    try {
      const { publicId } = req.params;
      const decodedUrl = decodeURIComponent(publicId);
      let imageUrl;
      if (decodedUrl.startsWith('http')) {
        imageUrl = decodedUrl;
      } else {
        imageUrl = `https://res.cloudinary.com/dqxhczkx/image/upload/${decodedUrl}`;
      }
      console.log('Proxying image:', { publicId, imageUrl });
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('content-type'));
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Proxy image error:', {
        message: err.message,
        stack: publicId,
        publicId
      });
      res.status(500).json({ error: err.message('Failed to fetch image') });
    }
  });

    module.exports = imageRouter;


    // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
