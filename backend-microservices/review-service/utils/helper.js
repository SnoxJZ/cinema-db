const Review = require("../models/review");

exports.sendError = (res, error, statusCode = 401) =>
  res.status(statusCode).json({ error });

exports.handleNotFound = (req, res) => {
  this.sendError(res, "Not found", 404);
};

exports.getAverageRatings = async (movieId) => {
  const reviews = await Review.find({ parentMovie: movieId });

  if (reviews.length === 0) {
    return { ratingAvg: "0.0", reviewCount: 0 };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const ratingAvg = (totalRating / reviews.length).toFixed(1);

  return {
    ratingAvg,
    reviewCount: reviews.length,
  };
};
