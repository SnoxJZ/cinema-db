const express = require("express");
const {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActors,
  getSingleActor,
  getActors,
} = require("../controllers/actor");
const { isAuth, isAdminOrModerator, isAdmin } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const { actorInfoValidator, validate } = require("../middlewares/validator");
const { logActivity } = require("../middlewares/activityLogger");

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

module.exports = router;
