const express = require("express");
const {
  uploadTrailer,
  createMovie,
  updateMovieWithoutPoster,
  updateMovie,
  removeMovie,
  getMovies,
  getMovieForUpdate,
  searchMovies,
  getLatestUploads,
  getSingleMovie,
  getRelatedMovies,
  getTopRatedMovies,
  searchPublicMovies,
} = require("../controllers/movie");
const { bulkImportMovies } = require("../bulkImportMovies");
const { enrichAllActors } = require("../enrichAllActors");
const {
  isAuth,
  isAdminOrModerator,
  isAdmin,
  optionalAuth,
} = require("../middlewares/auth");
const { uploadVideo, uploadImage } = require("../middlewares/multer");
const {
  validateMovie,
  validate,
  validateTrailer,
} = require("../middlewares/validator");
const { parseData } = require("../utils/helper");
const router = express.Router();

router.post(
  "/upload-trailer",
  isAuth,
  isAdminOrModerator,
  uploadVideo.single("video"),
  uploadTrailer
);
router.post(
  "/create",
  isAuth,
  isAdminOrModerator,
  uploadImage.single("poster"),
  parseData,
  validateMovie,
  validateTrailer,
  validate,
  createMovie
);
router.patch(
  "/update/:movieId",
  isAuth,
  isAdminOrModerator,
  uploadImage.single("poster"),
  parseData,
  validateMovie,
  validate,
  updateMovie
);
router.delete("/:movieId", isAuth, isAdmin, removeMovie);
router.get(
  "/for-update/:movieId",
  isAuth,
  isAdminOrModerator,
  getMovieForUpdate
);
router.get("/search", isAuth, isAdminOrModerator, searchMovies);
router.post("/bulk-import", isAuth, isAdmin, bulkImportMovies);
router.post("/enrich-all-actors", isAuth, isAdmin, enrichAllActors);

router.get("/movies", getMovies);
router.get("/latest-uploads", getLatestUploads);
router.get("/single/:movieId", optionalAuth, getSingleMovie);
router.get("/related/:movieId", getRelatedMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/search-public", searchPublicMovies);

module.exports = router;
