const PastAlbum = require('../model/pastAlbumModel');


const addPastAlbum = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const exists = await PastAlbum.findOne({ title });
    if (exists) return res.status(409).json({ error: 'Album already exists' });

    const newAlbum = await PastAlbum.create({ title });
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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


const getLatestAlbum = async (req, res) => {
  try {
  
    const latestAlbum = await PastAlbum.findOne().sort({ createdAt: -1 });

    if (!latestAlbum) return res.status(200).json(null); 

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