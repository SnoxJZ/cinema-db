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
const { isAdminOrModerator } = require("../middlewares/auth");

const router = express.Router();

router.get("/users", isAuth, isAdminOrModerator, getUsers);
router.patch("/block/:userId", isAuth, isAdminOrModerator, blockUser);
router.patch("/unblock/:userId", isAuth, isAdminOrModerator, unblockUser);
router.post("/create", userValidtor, validate, create);
router.post("/sign-in", signInValidator, validate, signIn);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-verification-token", resendEmailVerificationToken);
router.post("/forget-password", forgetPassword);
router.patch("/update-profile", isAuth, updateProfile);
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
