const {
  getAppInfo,
  getMostRated,
  getActivityLogs,
} = require("../controllers/admin");
const { isAuth, isAdminOrModerator, isAdmin } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/app-info", isAuth, isAdminOrModerator, getAppInfo);
router.get("/most-rated", isAuth, isAdminOrModerator, getMostRated);
router.get("/activity-logs", isAuth, isAdmin, getActivityLogs);

module.exports = router;
