const express = require("express");
const {
  addPastAlbum,
  getPastAlbums,
  deletePastAlbum,
  getLatestAlbum
} = require("../controller/pastAlbumController");

const pastAlbumRouter = express.Router();

// Route to add a new past album
pastAlbumRouter.post("/add", addPastAlbum);

// Route to get all past albums
pastAlbumRouter.get("/get", getPastAlbums);

// Route to delete a past album by ID
pastAlbumRouter.delete("/delete", deletePastAlbum);

pastAlbumRouter.get('/latest', getLatestAlbum);

module.exports = pastAlbumRouter;
