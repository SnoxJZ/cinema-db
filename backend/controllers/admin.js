const Movie = require("../models/movie");
const Review = require("../models/review");
const User = require("../models/user");
const {
  topRatedMoviesPipeline,
  getAverageRatings,
} = require("../utils/helper");
const ActivityLog = require("../models/activityLog");

exports.getAppInfo = async (req, res) => {
  const movieCount = await Movie.countDocuments();
  const reviewCount = await Review.countDocuments();
  const userCount = await User.countDocuments();

  res.json({ appInfo: { movieCount, reviewCount, userCount } });
};

exports.getMostRated = async (req, res) => {
  const movies = await Movie.aggregate(topRatedMoviesPipeline());

  const mapMovies = async (m) => {
    const reviews = await getAverageRatings(m._id);

    return {
      id: m._id,
      title: m.title,
      reviews: { ...reviews },
    };
  };

  const topRatedMovies = await Promise.all(movies.map(mapMovies));

  res.json({ movies: topRatedMovies });
};

exports.getActivityLogs = async (req, res) => {
  const { page = 1, limit = 50, userId, action } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const query = {};
  if (userId) query.user = userId;
  if (action) query.action = action;

  const logs = await ActivityLog.find(query)
    .populate("user", "name email")
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1 });

  const count = await ActivityLog.countDocuments(query);

  res.json({
    logs,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
  });
};
