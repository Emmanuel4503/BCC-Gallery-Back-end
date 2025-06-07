const express = require("express");
const {
  addSaved,
  getSavedByUser,
  deleteSaved
} = require("../controller/savedController");

const savedRouter = express.Router();

// Route to add/save an image
savedRouter.post("/add", addSaved);

// Route to get all saved images for a user
savedRouter.get("/get/:userId", getSavedByUser);

// Route to delete a saved image
savedRouter.delete("/delete", deleteSaved);

module.exports = savedRouter;
