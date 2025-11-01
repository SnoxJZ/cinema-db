const express = require("express");
const {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActors,
  getSingleActor,
  getActors,
  getActorsBatch,
} = require("../controllers/actor");
const { isAuth, isAdminOrModerator, isAdmin } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const { actorInfoValidator, validate } = require("../middlewares/validator");
const { logActivity } = require("../middlewares/activityLogger");
const ActivityLog = require("../models/activityLog");

const router = express.Router();

router.post(
  "/create",
  isAuth,
  isAdminOrModerator,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  logActivity("create_actor"),
  createActor
);

router.post(
  "/update/:actorId",
  isAuth,
  isAdminOrModerator,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  logActivity("update_actor"),
  updateActor
);

router.delete(
  "/:actorId",
  isAuth,
  isAdmin,
  logActivity("delete_actor"),
  removeActor
);
router.get("/search", isAuth, isAdminOrModerator, searchActor);
router.get("/latest-uploads", getLatestActors);
router.get("/actors", isAuth, isAdminOrModerator, getActors);
router.get("/single/:id", getSingleActor);

///
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

router.post("/internal/batch", getActorsBatch);
router.get("/internal/get-all", getActors);

module.exports = router;
