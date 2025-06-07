const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: Number,
    ref: 'User',
    required: true,
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  reactionType: {
    type: String,
    enum: ['partyPopper', 'thumbsUp', 'redHeart', 'fire'],
    required: true,
  },
}, { timestamps: true });

reactionSchema.index({ userId: 1, imageId: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);