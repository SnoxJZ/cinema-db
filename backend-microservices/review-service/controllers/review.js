const { isValidObjectId } = require("mongoose");
const Review = require("../models/review");
const { sendError, getAverageRatings } = require("../utils/helper");
const { movieClient } = require("../clients/movieClient");
const { userClient } = require("../clients/userClient");

exports.addReview = async (req, res) => {
  const { movieId } = req.params;
  const { content, rating, isSpoiler } = req.body;
  const userId = req.user._id;

  if (!req.user.isVerified)
    return sendError(res, "Please verify your account first!");

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie ID");

  const { data: movie } = await movieClient.get(`/movie/single/${movieId}`);
  if (!movie.movie) return sendError(res, "Movie not found!", 404);

  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentMovie: movieId,
  });
  if (isAlreadyReviewed)
    return sendError(res, "Invalid request! Review already exists.");

  const newReview = new Review({
    owner: userId,
    parentMovie: movieId,
    content,
    rating,
    isSpoiler,
  });

  await newReview.save();

  const reviews = await getAverageRatings(movieId);
  try {
    await movieClient.patch(`/movie/internal/${movieId}/review-stats`, {
      ratingAvg: parseFloat(reviews.ratingAvg),
      reviewCount: reviews.reviewCount,
      addReviewId: newReview._id,
    });
  } catch (err) {
    console.error(
      "Error updating review stats:",
      err.response?.data || err.message
    );
  }

  const formattedReview = {
    id: newReview._id,
    owner: {
      id: userId,
      name: req.user.name,
      avatar: req.user.avatar,
    },
    content: newReview.content,
    rating: newReview.rating,
    isSpoiler: newReview.isSpoiler,
  };

  res.json({ message: "Review added!", reviews, newReview: formattedReview });
};

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating, isSpoiler } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID");

  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, "Review not found!", 404);

  if (
    review.owner.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "moderator"
  ) {
    return sendError(res, "Unauthorized!", 401);
  }

  review.content = content;
  review.rating = rating;
  review.isSpoiler = isSpoiler;

  await review.save();

  const reviews = await getAverageRatings(review.parentMovie);
  await movieClient.patch(
    `/movie/internal/${review.parentMovie}/review-stats`,
    {
      ratingAvg: parseFloat(reviews.ratingAvg),
      reviewCount: reviews.reviewCount,
    }
  );

  res.json({ message: "Review updated!" });
};

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID");

  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, "Invalid request, review not found!");

  if (
    review.owner.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "moderator"
  ) {
    return sendError(res, "Not authorized to delete this review");
  }

  await Review.findByIdAndDelete(reviewId);

  const reviews = await getAverageRatings(review.parentMovie);
  await movieClient.patch(
    `/movie/internal/${review.parentMovie}/review-stats`,
    {
      ratingAvg: parseFloat(reviews.ratingAvg),
      reviewCount: reviews.reviewCount,
      removeReviewId: reviewId,
    }
  );

  res.json({ message: "Review deleted!" });
};

exports.getReviewsByMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid review ID");

  const reviews = await Review.find({ parentMovie: movieId });

  const ownerIds = [
    ...new Set(
      reviews.flatMap((r) => [
        r.owner.toString(),
        ...r.replies.map((reply) => reply.owner.toString()),
      ])
    ),
  ];

  const { data: users } = await userClient.post("/user/internal/batch", {
    ids: ownerIds,
  });
  const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

  const formattedReviews = reviews.map((r) => ({
    id: r._id,
    owner: userMap[r.owner.toString()],
    content: r.content,
    rating: r.rating,
    isSpoiler: r.isSpoiler,
    replies: r.replies.map((reply) => ({
      id: reply._id,
      owner: userMap[reply.owner.toString()],
      content: reply.content,
    })),
  }));

  res.json({ movie: { reviews: formattedReviews } });
};

exports.getReviewsByUser = async (req, res) => {
  const userId = req.user._id;

  const reviews = await Review.find({ owner: userId }).sort({ createdAt: -1 });

  const movieIds = [...new Set(reviews.map((r) => r.parentMovie.toString()))];

  const { data: movies } = await movieClient.post("/movie/internal/batch", {
    ids: movieIds,
  });

  const movieMap = movies.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

  const formattedReviews = reviews.map((r) => ({
    id: r._id,
    movieId: r.parentMovie.toString(),
    movieTitle: movieMap[r.parentMovie.toString()]?.title || "Unknown Movie",
    rating: r.rating,
    content: r.content,
  }));

  res.json({ reviews: formattedReviews });
};

exports.addReply = async (req, res) => {
  const { reviewId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!req.user.isVerified)
    return sendError(res, "Please verify your account first!");

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID");

  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, "Review not found!", 404);

  review.replies.push({
    owner: userId,
    content,
  });

  await review.save();

  const formattedReply = {
    id: review.replies[review.replies.length - 1]._id,
    owner: {
      id: userId,
      name: req.user.name,
      avatar: req.user.avatar,
    },
    content,
  };

  res.json({ message: "Reply added!", reply: formattedReply });
};

exports.removeReply = async (req, res) => {
  const { reviewId, replyId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId) || !isValidObjectId(replyId))
    return sendError(res, "Invalid ID");

  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, "Review not found!", 404);

  const reply = review.replies.id(replyId);
  if (!reply) return sendError(res, "Reply not found!", 404);

  if (
    reply.owner.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "moderator"
  ) {
    return sendError(res, "Unauthorized!", 401);
  }

  review.replies.pull(replyId);
  await review.save();

  res.json({ message: "Reply deleted!" });
};

///
exports.getReviewCount = async (req, res) => {
  const count = await Review.countDocuments();
  res.json({ count });
};
