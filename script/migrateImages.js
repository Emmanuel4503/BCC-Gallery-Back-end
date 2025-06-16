const mongoose = require("mongoose");
const Image = require("../model/imagesModel");
const cloudinary = require("./cloudConfig");

// Ensure MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for migration");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const migrateImages = async () => {
  try {
    await connectDB();
    const images = await Image.find({});

    if (images.length === 0) {
      console.log("No images found to migrate");
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const image of images) {
      try {
        // Skip if thumbnailUrl and publicId already exist
        if (image.thumbnailUrl && image.publicId) {
          console.log(`Skipping image ${image._id}: already migrated`);
          skippedCount++;
          continue;
        }

        // Extract publicId from imageUrl
        let publicId;
        if (image.imageUrl.includes("res.cloudinary.com")) {
          const urlParts = image.imageUrl.split("/");
          const index = urlParts.indexOf("upload");
          if (index !== -1 && urlParts.length > index + 2) {
            publicId = urlParts.slice(index + 2).join("/").split(".")[0];
          }
        }

        if (!publicId) {
          // Fallback: Generate publicId based on filename or timestamp
          const filename = image.imageUrl.split("/").pop()?.split(".")[0] || `image-${image._id}`;
          publicId = `BCC Gallery Images/${filename}`;
          console.warn(`Generated publicId for image ${image._id}: ${publicId}`);
        }

        // Generate thumbnailUrl
        const thumbnailUrl = cloudinary.url(publicId, {
          secure: true, // Ensure HTTPS
          transformation: [
            {
              width: 500,
              height: 500,
              crop: "limit",
              quality: "auto:good",
              fetch_format: "auto",
            },
          ],
        });

        // Verify URLs
        if (!thumbnailUrl.startsWith("https://res.cloudinary.com")) {
          console.error(`Invalid thumbnailUrl for image ${image._id}: ${thumbnailUrl}`);
          failedCount++;
          continue;
        }

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
        console.log(`Updated image ${image._id}: ${thumbnailUrl}`);
      } catch (err) {
        console.error(`Failed to migrate image ${image._id}:`, err.message);
        failedCount++;
      }
    }

    console.log(
      `Migration completed: ${updatedCount} images updated, ${skippedCount} skipped, ${failedCount} failed`
    );
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the migration
migrateImages();