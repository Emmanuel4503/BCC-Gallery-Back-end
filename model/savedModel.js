const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  }
}, {
  timestamps: true
});

const Saved = mongoose.model('Saved', savedSchema);
module.exports = Saved;
