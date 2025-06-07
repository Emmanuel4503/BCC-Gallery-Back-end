        const Image = require('../model/imagesModel');
        const Reaction = require('../model/reactionModel');
   

        // CREATE image with file upload
        const addImage = async (req, res) => {
            try {
              const { album, type } = req.body;
          
              if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "No image files uploaded." });
              }
          
              const sharedTimestamp = new Date(); // exact timestamp for all images
          
              // Log the upload time (optional)
              console.log('Batch upload time:', sharedTimestamp.toISOString());
          
              const imageDocs = req.files.map(file => ({
                imageUrl: file.path,
                album,
                type,
                createdAt: sharedTimestamp,
                updatedAt: sharedTimestamp
              }));
          
              const insertedImages = await Image.insertMany(imageDocs);
          
              res.status(201).json({
                message: "Images uploaded successfully",
                images: insertedImages,
                batchTime: sharedTimestamp
              });
            } catch (err) {
              res.status(500).json({ error: err.message });
            }
          };
          

        const getImages = async (req, res) => {
            try {
            const { album, type, fields } = req.query;
        
            const query = {};
            if (album) query.album = album;
            if (type) query.type = type;
        
            // Find the latest timestamp
            const latestImage = await Image.findOne(query).sort({ createdAt: -1 });
        
            if (!latestImage) return res.status(200).json([]); // no images
        
            // Find all images that match the latest createdAt timestamp
            const latestCreatedAt = latestImage.createdAt;
        
            let projection = '';
            if (fields) projection = fields.split(',').join(' ');
        
            const latestImages = await Image.find({
                ...query,
                createdAt: latestCreatedAt
            }, projection);
        
            res.status(200).json(latestImages);
            } catch (err) {
            res.status(500).json({ error: err.message });
            }
        };
        

        const getSelectedImages = async (req, res) => {
            try {
            const type = 'Selected';
        
            // Find the latest createdAt for selected images
            const latestSelected = await Image.findOne({ type }).sort({ createdAt: -1 });
        
            if (!latestSelected) return res.status(200).json([]);
        
            const latestCreatedAt = latestSelected.createdAt;
        
            const selectedImages = await Image.find({
                type,
                createdAt: latestCreatedAt
            });
        
            res.status(200).json(selectedImages);
            } catch (err) {
            res.status(500).json({ error: err.message });
            }
        };
        


        // GET images by album (not filtered by latest)
        const getImagesByAlbum = async (req, res) => {
        try {
            const { album } = req.params;

            if (!album) {
            return res.status(400).json({ message: "Album name is required" });
            }

            const images = await Image.find({ album });

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
          
              // Check if user has already reacted
              const existingReaction = await Reaction.findOne({ userId: Number(userId), imageId });
          
              let updatedImage;
          
              if (existingReaction) {
                if (existingReaction.reactionType === reaction) {
                  // Same reaction: remove it (unreact)
                  await Reaction.deleteOne({ userId: Number(userId), imageId });
                  updatedImage = await Image.findByIdAndUpdate(
                    imageId,
                    { $inc: { [`reactions.${reaction}`]: -1 } }, // Atomically decrement
                    { new: true }
                  );
                  if (!updatedImage) {
                    return res.status(404).json({ error: 'Image not found.' });
                  }
                  return res.status(200).json({ message: 'Reaction removed.', reactions: updatedImage.reactions });
                } else {
                  // Different reaction: remove old reaction, add new one
                  const oldReaction = existingReaction.reactionType;
                  await Reaction.deleteOne({ userId: Number(userId), imageId });
                  updatedImage = await Image.findByIdAndUpdate(
                    imageId,
                    {
                      $inc: {
                        [`reactions.${oldReaction}`]: -1, // Decrement old reaction
                        [`reactions.${reaction}`]: 1, // Increment new reaction
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
          
              // No existing reaction: add new one
              await Reaction.create({ userId: Number(userId), imageId, reactionType: reaction });
              updatedImage = await Image.findByIdAndUpdate(
                imageId,
                { $inc: { [`reactions.${reaction}`]: 1 } }, // Atomically increment
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

        // GET count of all images (optionally filtered by album or type)
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
