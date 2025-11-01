const router = require("express").Router();
const {
  addReview,
  updateReview,
  removeReview,
  getReviewsByMovie,
  addReply,
  removeReply,
  getReviewsByUser,
  getReviewCount,
} = require("../controllers/review");
const { isAuth } = require("../middlewares/auth");
const {
  validateRatings,
  validate,
  validateReplyContent,
} = require("../middlewares/validator");
const { logActivity } = require("../middlewares/activityLogger");
const ActivityLog = require("../models/activityLog");

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

///
router.get("/internal/count", getReviewCount);
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

module.exports = router;
