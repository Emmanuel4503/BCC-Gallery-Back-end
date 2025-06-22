const PastAlbum = require('../model/pastAlbumModel');

// Add a past album
// Add a past album
const addPastAlbum = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // Check if album exists
    const existingAlbum = await PastAlbum.findOne({ title });
    if (existingAlbum) {
      // Delete associated images from MongoDB
      const images = await Image.find({ album: title });
      for (const image of images) {
        try {
          await cloudinary.uploader.destroy(image.publicId); // Delete from Cloudinary
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary image ${image.publicId}:`, cloudinaryError);
          // Continue even if Cloudinary deletion fails
        }
      }
      await Image.deleteMany({ album: title }); // Delete images from MongoDB

      // Delete the existing album
      await PastAlbum.findByIdAndDelete(existingAlbum._id);
    }

    // Create new album
    const newAlbum = await PastAlbum.create({ title });
    res.status(201).json({
      message: existingAlbum ? 'Album replaced successfully' : 'Album created successfully',
      album: {
        _id: newAlbum._id,
        title: newAlbum.title
      }
    });
  } catch (err) {
    console.error('Error in addPastAlbum:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all past albums
const getPastAlbums = async (req, res) => {
  try {
    const albums = await PastAlbum.find().sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a past album by ID
const deletePastAlbum = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Album ID is required' });

    const deleted = await PastAlbum.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Album not found' });

    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the latest album based on createdAt timestamp
const getLatestAlbum = async (req, res) => {
  try {
    // Find the album with the latest createdAt timestamp
    const latestAlbum = await PastAlbum.findOne().sort({ createdAt: -1 });

    if (!latestAlbum) return res.status(200).json(null); // No albums found

    res.status(200).json(latestAlbum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addPastAlbum,
  getPastAlbums,
  deletePastAlbum,
  getLatestAlbum
};