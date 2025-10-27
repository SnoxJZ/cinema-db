const express = require("express");
const {
  createPlaylist,
  addMovieToPlaylist,
  removeMovieFromPlaylist,
  getPlaylists,
  deletePlaylist,
  getPlaylist,
} = require("../controllers/playlist");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/create", isAuth, createPlaylist);
router.post("/add-movie", isAuth, addMovieToPlaylist);
router.post("/remove-movie", isAuth, removeMovieFromPlaylist);
router.get("/", isAuth, getPlaylists);
router.delete("/:playlistId", isAuth, deletePlaylist);
router.get("/:playlistId", isAuth, getPlaylist);

module.exports = router;
