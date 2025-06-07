// models/PastAlbum.js
const mongoose = require('mongoose');

const pastAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PastAlbum', pastAlbumSchema);
