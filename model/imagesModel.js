const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: [true, "Image file URL is required"] },
  thumbnailUrl: { type: String, required: [true, "Thumbnail URL is required"] },
  publicId: { type: String, required: [true, "Cloudinary public ID is required"] },
  album: { type: String, required: [true, "Album name is required"] },
  type: { type: String, enum: ['Normal', 'Selected'], default: 'Normal' },
  reactions: {
    partyPopper: { type: Number, default: 0, min: 0 },
    thumbsUp: { type: Number, default: 0, min: 0 },
    redHeart: { type: Number, default: 0, min: 0 },
    fire: { type: Number, default: 0, min: 0 }
  }
}, { timestamps: true });

imageSchema.pre('save', function (next) {
  const reactions = this.reactions || {};
  ['partyPopper', 'thumbsUp', 'redHeart', 'fire'].forEach((type) => {
    if (reactions[type] < 0) reactions[type] = 0;
  });
  this.reactions = reactions;
  next();
});

module.exports = mongoose.model('Image', imageSchema);