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

   
    imageRouter.post("/upload", uploadImage.array('primaryImage', 100), addImage);

  
    imageRouter.get("/latest", getImages);

    imageRouter.get("/selected", getSelectedImages);

    // Route to delete an image by MongoDB ID
    imageRouter.delete("/delete/:id", deleteImage);

    imageRouter.get("/album/:album", getImagesByAlbum);

    imageRouter.post("/react", addReaction);
    imageRouter.get('/reactions/:userId ', getUserReactions);
    imageRouter.get('/count', imageController.getImageCount);

    module.exports = imageRouter;
    
