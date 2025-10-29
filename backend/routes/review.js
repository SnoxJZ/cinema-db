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
const { logActivity } = require("../middlewares/activityLogger");

router.post(
  "/add/:movieId",
  isAuth,
  validateRatings,
  validate,
  logActivity("create_review"),
  addReview
);
router.patch(
  "/:reviewId",
  isAuth,
  validateRatings,
  validate,
  logActivity("update_review"),
  updateReview
);
router.delete("/:reviewId", isAuth, logActivity("delete_review"), removeReview);
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
