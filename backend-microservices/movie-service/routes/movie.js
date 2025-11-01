const express = require("express");
const {
  uploadTrailer,
  createMovie,
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
  updateReviewStats,
  getMoviesBatch,
  getMovieCount,
} = require("../controllers/movie");
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
const { logActivity } = require("../middlewares/activityLogger");
const ActivityLog = require("../models/activityLog");

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
  logActivity("create_movie"),
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
  logActivity("update_movie"),
  updateMovie
);
router.delete(
  "/:movieId",
  isAuth,
  isAdmin,
  logActivity("delete_movie"),
  removeMovie
);
router.get(
  "/for-update/:movieId",
  isAuth,
  isAdminOrModerator,
  getMovieForUpdate
);
router.get("/search", isAuth, isAdminOrModerator, searchMovies);

router.get("/movies", getMovies);
router.get("/latest-uploads", getLatestUploads);
router.get("/single/:movieId", optionalAuth, getSingleMovie);
router.get("/related/:movieId", getRelatedMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/search-public", searchPublicMovies);

///
router.patch("/internal/:id/review-stats", updateReviewStats);
router.post("/internal/batch", getMoviesBatch);
router.get("/internal/activity-logs", async (req, res) => {
  const { userId, limit = 500, action } = req.query;

  const query = {};
  if (userId) query.user = userId;
  if (action) query.action = action;

  const logs = await ActivityLog.find(query)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  res.json(logs);
});
router.get("/internal/count", getMovieCount);

module.exports = router;
