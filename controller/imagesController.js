        const Image = require('../model/imagesModel');
        const Reaction = require('../model/reactionModel');
        const cloudinary = require('../middlewares/cloudConfig');
   
        const addImage = async (req, res) => {
          try {
            console.log('Received upload request:', { body: req.body, files: req.files?.map(f => f.originalname) });
            if (!cloudinary) {
              throw new Error('Cloudinary is not initialized');
            }
            const { album, type } = req.body;
            if (!req.files || req.files.length === 0) {
              return res.status(400).json({ message: 'No image files uploaded. Please select at least one image.' });
            }
            if (!album || !type) {
              return res.status(400).json({ message: 'Album title and image type are required.' });
            }
            if (!['Normal', 'Selected'].includes(type)) {
              return res.status(400).json({ message: 'Invalid image type. Must be "Normal" or "Selected".' });
            }
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            for (const file of req.files) {
              if (!allowedFormats.includes(file.mimetype)) {
                return res.status(400).json({ message: `File ${file.originalname} is not a supported type (JPEG, PNG, WebP).` });
              }
              if (file.size > maxSize) {
                return res.status(400).json({ message: `File ${file.originalname} exceeds 10MB limit.` });
              }
            }
            const sharedTimestamp = new Date();
            const imageDocs = req.files.map(file => ({
              imageUrl: file.path,
              thumbnailUrl: cloudinary.url(file.filename, {
                transformation: [
                  { width: 500, height: 500, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
                ]
              }),
              publicId: file.filename,
              album,
              type,
              createdAt: sharedTimestamp,
              updatedAt: sharedTimestamp
            }));
            console.log('Inserting images to MongoDB:', imageDocs.length);
            const insertedImages = await Image.insertMany(imageDocs);
            console.log('Images uploaded successfully:', insertedImages.length);
            res.status(201).json({
              message: `Successfully uploaded ${insertedImages.length} images`,
              images: insertedImages,
              batchTime: sharedTimestamp
            });
          } catch (err) {
            console.error('Upload error:', {
              message: err.message,
              stack: err.stack,
              body: req.body,
              files: req.files?.map(f => f.originalname)
            });
            res.status(500).json({ message: `Failed to upload images: ${err.message || 'Unknown error'}` });
          }
        };

        const getImages = async (req, res) => {
          try {
            const { album, type, fields } = req.query;
        
            const query = {};
            if (album) query.album = album;
            if (type) query.type = type;
        
            const latestImage = await Image.findOne(query).sort({ createdAt: -1 });
        
            if (!latestImage) return res.status(200).json([]);
        
            const latestCreatedAt = latestImage.createdAt;
        
            let projection = '';
            if (fields) projection = fields.split(',').join(' ');
        
            const latestImages = await Image.find(
              { ...query, createdAt: latestCreatedAt },
              projection || 'imageUrl thumbnailUrl album type reactions createdAt' // Include thumbnailUrl
            );
        
            res.status(200).json(latestImages);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        };

        const getSelectedImages = async (req, res) => {
          try {
            const type = 'Selected';
        
            const latestSelected = await Image.findOne({ type }).sort({ createdAt: -1 });
        
            if (!latestSelected) return res.status(200).json([]);
        
            const latestCreatedAt = latestSelected.createdAt;
        
            const selectedImages = await Image.find(
              { type, createdAt: latestCreatedAt },
              'imageUrl thumbnailUrl album type reactions createdAt' // Include thumbnailUrl
            );
        
            res.status(200).json(selectedImages);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        };


     
        const getImagesByAlbum = async (req, res) => {
          try {
            const { album } = req.params;
        
            if (!album) {
              return res.status(400).json({ message: "Album name is required" });
            }
        
            const images = await Image.find(
              { album },
              'imageUrl thumbnailUrl album type reactions createdAt' // Include thumbnailUrl
            );
        
            res.status(200).json(images);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        };

       
        
        const addReaction = async (req, res) => {
            try {
              const { imageId, reaction, userId } = req.body;
          
              if (!imageId || !reaction || !userId) {
                return res.status(400).json({ error: 'Image ID, reaction, and user ID are required.' });
              }
          
              const validReactions = ['partyPopper', 'thumbsUp', 'redHeart', 'fire'];
              if (!validReactions.includes(reaction)) {
                return res.status(400).json({ error: 'Invalid reaction type.' });
              }
          
          
              const existingReaction = await Reaction.findOne({ userId: Number(userId), imageId });
          
              let updatedImage;
          
              if (existingReaction) {
                if (existingReaction.reactionType === reaction) {
                  await Reaction.deleteOne({ userId: Number(userId), imageId });
                  updatedImage = await Image.findByIdAndUpdate(
                    imageId,
                    { $inc: { [`reactions.${reaction}`]: -1 } }, 
                    { new: true }
                  );
                  if (!updatedImage) {
                    return res.status(404).json({ error: 'Image not found.' });
                  }
                  return res.status(200).json({ message: 'Reaction removed.', reactions: updatedImage.reactions });
                } else {
                  const oldReaction = existingReaction.reactionType;
                  await Reaction.deleteOne({ userId: Number(userId), imageId });
                  updatedImage = await Image.findByIdAndUpdate(
                    imageId,
                    {
                      $inc: {
                        [`reactions.${oldReaction}`]: -1, 
                        [`reactions.${reaction}`]: 1, 
                      },
                    },
                    { new: true }
                  );
                  if (!updatedImage) {
                    return res.status(404).json({ error: 'Image not found.' });
                  }
                  await Reaction.create({ userId: Number(userId), imageId, reactionType: reaction });
                  return res.status(200).json({ message: 'Reaction switched.', reactions: updatedImage.reactions });
                }
              }
          
            
              await Reaction.create({ userId: Number(userId), imageId, reactionType: reaction });
              updatedImage = await Image.findByIdAndUpdate(
                imageId,
                { $inc: { [`reactions.${reaction}`]: 1 } }, 
                { new: true }
              );
          
              if (!updatedImage) {
                await Reaction.deleteOne({ userId: Number(userId), imageId });
                return res.status(404).json({ error: 'Image not found.' });
              }
          
              return res.status(200).json({ message: 'Reaction added.', reactions: updatedImage.reactions });
            } catch (error) {
              console.error('Error in addReaction:', error);
              return res.status(500).json({ error: error.message });
            }
          };

       

          const getUserReactions = async (req, res) => {
            try {
              const { userId } = req.query;
          
              if (!userId) {
                return res.status(400).json({ error: 'User ID is required.' });
              }
          
              const reactions = await Reaction.find({ userId: Number(userId) }).select('imageId reactionType');
              const reactionMap = reactions.reduce((acc, { imageId, reactionType }) => {
                acc[imageId.toString()] = reactionType;
                return acc;
              }, {});
          
              res.status(200).json(reactionMap);
            } catch (error) {
              res.status(500).json({ error: error.message });
            }
          };


        // DELETE image by MongoDB _id
        const deleteImage = async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Image.findByIdAndDelete(id);

            if (!deleted) {
            return res.status(404).json({ message: "Image not found" });
            }

            res.status(200).json({ message: "Image deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
        };

        
const getImageCount = async (req, res) => {
  try {
    const { album, type } = req.query;

    const query = {};
    if (album) query.album = album;
    if (type) query.type = type;

    const count = await Image.countDocuments(query);

    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


        module.exports = {
        addImage,
        getImages,
        getSelectedImages,
        deleteImage,
        getImagesByAlbum,
        addReaction,
        getUserReactions,
        getImageCount
        };
