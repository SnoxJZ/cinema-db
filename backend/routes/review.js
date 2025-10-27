const router = require("express").Router();
const {
  addReview,
  updateReview,
  removeReview,
  getReviewsByMovie,
  addReply,
  removeReply,
  getReviewsByUser,
} = require("../controllers/review");
const { isAuth } = require("../middlewares/auth");
const {
  validateRatings,
  validate,
  validateReplyContent,
} = require("../middlewares/validator");

router.post("/add/:movieId", isAuth, validateRatings, validate, addReview);
router.patch("/:reviewId", isAuth, validateRatings, validate, updateReview);
router.delete("/:reviewId", isAuth, removeReview);
router.get("/get-reviews-by-movie/:movieId", getReviewsByMovie);
router.post(
  "/add-reply/:reviewId",
  isAuth,
  validateReplyContent,
  validate,
  addReply
);
router.delete("/delete-reply/:reviewId/:replyId", isAuth, removeReply);
router.get("/get-reviews-by-user", isAuth, getReviewsByUser);

module.exports = router;
