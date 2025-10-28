const { getAppInfo, getMostRated } = require("../controllers/admin");
const { isAuth, isAdminOrModerator } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/app-info", isAuth, isAdminOrModerator, getAppInfo);
router.get("/most-rated", isAuth, isAdminOrModerator, getMostRated);

module.exports = router;
