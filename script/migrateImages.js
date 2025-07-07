const mongoose = require('mongoose');
const Image = require('../model/imagesModel');
const cloudinary = require('./cloudConfig');

// Ensure MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for migration');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const migrateImages = async () => {
  try {
    await connectDB();
    const images = await Image.find({});

    if (images.length === 0) {
      console.log('No images found to migrate');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const image of images) {
      try {
        // Skip if thumbnailUrl and publicId already exist
        if (image.thumbnailUrl && image.publicId) {
          console.log(`Skipping image ${image._id}: already migrated`);
          skippedCount++;
          continue;
        }

        // Extract publicId from imageUrl
        const urlParts = image.imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1]?.split('.')[0];
        if (!filename) {
          console.error(`Invalid imageUrl for image ${image._id}: ${image.imageUrl}`);
          continue;
        }
        const publicId = `BCC Gallery Images/${filename}`;

        // Generate thumbnailUrl
        const thumbnailUrl = cloudinary.url(publicId, {
          // transformation: [
          //   { width: 500, height: 500, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
          // ],
        });

        // Update the image document
        await Image.findByIdAndUpdate(
          image._id,
          {
            thumbnailUrl,
            publicId,
          },
          { new: true }
        );
        updatedCount++;
        console.log(`Updated image ${image._id}`);
      } catch (err) {
        console.error(`Failed to migrate image ${image._id}:`, err.message);
      }
    }

    console.log(`Migration completed: ${updatedCount} images updated, ${skippedCount} skipped, ${images.length - updatedCount - skippedCount} failed`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the migration
migrateImages();