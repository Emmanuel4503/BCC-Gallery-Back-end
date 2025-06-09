const express = require("express");
const {
  addSaved,
  getSavedByUser,
  deleteSaved
} = require("../controller/savedController");

const savedRouter = express.Router();


savedRouter.post("/add", addSaved);

savedRouter.get("/get/:userId", getSavedByUser);

savedRouter.delete("/delete", deleteSaved);

module.exports = savedRouter;
