const express = require("express");
const {
  create,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
  uploadAvatar,
  updateProfile,
  toggleFavorite,
  getFavorites,
  getUsers,
  blockUser,
  unblockUser,
  changeUserRole,
} = require("../controllers/user");
const { uploadImage } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/auth");
const { isValidPassResetToken } = require("../middlewares/user");
const {
  userValidtor,
  validate,
  validatePassword,
  signInValidator,
} = require("../middlewares/validator");
const { isAdminOrModerator, isAdmin } = require("../middlewares/auth");
const { logActivity } = require("../middlewares/activityLogger");

const router = express.Router();

router.patch(
  "/role/:userId",
  isAuth,
  isAdmin,
  logActivity("change_role"),
  changeUserRole
);
router.get("/users", isAuth, isAdminOrModerator, getUsers);
router.patch(
  "/block/:userId",
  isAuth,
  isAdminOrModerator,
  logActivity("block_user"),
  blockUser
);
router.patch(
  "/unblock/:userId",
  isAuth,
  isAdminOrModerator,
  logActivity("unblock_user"),
  unblockUser
);
router.post("/create", userValidtor, validate, logActivity("register"), create);
router.post(
  "/sign-in",
  signInValidator,
  validate,
  logActivity("login"),
  signIn
);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-verification-token", resendEmailVerificationToken);
router.post("/forget-password", forgetPassword);
router.patch(
  "/update-profile",
  isAuth,
  logActivity("update_profile"),
  updateProfile
);
router.post("/toggle-favorite", isAuth, toggleFavorite);
router.get("/favorites", isAuth, getFavorites);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);
router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPassResetToken,
  resetPassword
);
router.post(
  "/upload-avatar",
  isAuth,
  uploadImage.single("avatar"),
  logActivity("upload_avatar"),
  uploadAvatar
);
router.get("/is-auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      avatar: user.avatar,
      favorites: user.favorites,
    },
  });
});

module.exports = router;
