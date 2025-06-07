const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, "Name is important!"]
  }
}, {
  timestamps: true 
});

userSchema.pre('save', async function (next) {
  if (!this.userId) {
    let isUnique = false;
    let generatedId;

    while (!isUnique) {
      generatedId = Math.floor(100000000000000 + Math.random() * 900000000000000);
      const existingUser = await this.constructor.findOne({ userId: generatedId });
      if (!existingUser) isUnique = true;
    }

    this.userId = generatedId;
  }

  next();
});

const userModel = mongoose.model('Bcc Gallery User Model', userSchema);
module.exports = userModel;