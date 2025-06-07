const Saved = require('../model/savedModel');
const Image = require('../model/imagesModel');


const addSaved = async (req, res) => {
  try {
    const { userId, imageId } = req.body;

    const exists = await Saved.findOne({ userId, imageId });
    if (exists) {
      return res.status(400).json({ message: "Image already saved" });
    }

    const newSaved = new Saved({ userId, imageId });
    await newSaved.save();

    res.status(201).json({
      message: "Image saved successfully",
      saved: newSaved
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getSavedByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const savedItems = await Saved.find({ userId }).populate('imageId');
    const images = savedItems.map(item => item.imageId);

    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete saved image by userId and imageId
const deleteSaved = async (req, res) => {
  try {
    const { userId, imageId } = req.body;

    const deleted = await Saved.findOneAndDelete({ userId, imageId });
    if (!deleted) {
      return res.status(404).json({ message: "Saved image not found" });
    }

    res.status(200).json({ message: "Image removed from saved list" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addSaved,
  getSavedByUser,
  deleteSaved
};
