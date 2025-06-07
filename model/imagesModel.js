const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, "Image file URL is required"]
  },
  album: {
    type: String,
    required: [true, "Album name is required"]
  },
  type: {
    type: String,
    enum: ['Normal', 'Selected'],
    default: 'Normal'
  },
  reactions: {
    partyPopper: { type: Number, default: 0, min: 0 }, // 🎉
    thumbsUp: { type: Number, default: 0, min: 0 }, // 👍
    redHeart: { type: Number, default: 0, min: 0 }, // ❤️
    fire: { type: Number, default: 0, min: 0 } // 🔥
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure reaction counts are non-negative
imageSchema.pre('save', function (next) {
  const reactions = this.reactions || {};
  ['partyPopper', 'thumbsUp', 'redHeart', 'fire'].forEach((type) => {
    if (reactions[type] < 0) {
      reactions[type] = 0;
    }
  });
  this.reactions = reactions;
  next();
});

const ImageModel = mongoose.model('Image', imageSchema);
module.exports = ImageModel;