const { isValidObjectId } = require("mongoose");
const Movie = require("../models/movie");
const Review = require("../models/review");
const { sendError, getAverageRatings } = require("../utils/helper");

exports.addReview = async (req, res) => {
  const { movieId } = req.params;
  const { content, rating, isSpoiler } = req.body;
  const userId = req.user._id;

  if (!req.user.isVerified)
    return sendError(res, "Please verify your account first!");

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie!");

  const movie = await Movie.findOne({ _id: movieId, status: "public" });
  if (!movie) return sendError(res, "Movie not found!", 404);

  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentMovie: movie._id,
  });
  if (isAlreadyReviewed)
    return sendError(res, "Invalid request! Review already exists.");

  const newReview = new Review({
    owner: userId,
    parentMovie: movie._id,
    content,
    rating,
    isSpoiler,
  });

  await newReview.save();

  const reviews = await getAverageRatings(movie._id);

  movie.reviews.push(newReview._id);
  movie.reviewStats.ratingAvg = parseFloat(reviews.ratingAvg);
  movie.reviewStats.reviewCount = reviews.reviewCount;
  await movie.save();

  await newReview.populate("owner", "name");

  const formattedReview = {
    id: newReview._id,
    owner: {
      id: newReview.owner._id,
      name: newReview.owner.name,
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

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Review not found!", 404);

  review.content = content;
  review.rating = rating;
  review.isSpoiler = isSpoiler;

  await review.save();

  const reviews = await getAverageRatings(review.parentMovie);
  await Movie.findByIdAndUpdate(review.parentMovie, {
    "reviewStats.ratingAvg": parseFloat(reviews.ratingAvg),
    "reviewStats.reviewCount": reviews.reviewCount,
  });

  res.json({ message: "Review updated!" });
};

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID");

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Invalid request, review not found!");

  const movie = await Movie.findById(review.parentMovie).select(
    "reviews reviewStats"
  );
  movie.reviews = movie.reviews.filter((rId) => rId.toString() !== reviewId);

  await Review.findByIdAndDelete(reviewId);

  const reviews = await getAverageRatings(movie._id);
  movie.reviewStats.ratingAvg = reviews.ratingAvg;
  movie.reviewStats.reviewCount = reviews.reviewCount;

  await movie.save();

  res.json({ message: "Review deleted!" });
};

exports.getReviewsByMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid review ID");

  const movie = await Movie.findById(movieId)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
        select: "name",
      },
    })
    .select("reviews title");

  const reviews = movie.reviews.map((r) => {
    const { owner, content, isSpoiler, rating, _id: reviewID } = r;
    const { name, _id: ownerId } = owner;

    return {
      id: reviewID,
      owner: {
        id: ownerId,
        name,
      },
      content,
      rating,
      isSpoiler,
    };
  });

  res.json({ movie: { reviews, title: movie.title } });
};
