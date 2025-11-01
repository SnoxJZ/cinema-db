const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helper");
const PasswordResetToken = require("../models/passwordResetToken");
const cloudinary = require("../cloud");
const ActivityLog = require("../models/activityLog");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "This email is already in use!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
      <p>You verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  await ActivityLog.create({
    user: newUser._id,
    action: "register",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!", 404);

  if (user.isVerified) return sendError(res, "User already verified!");

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found!");

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please send a valid OTP!");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: user.email,
    subject: "Movie App",
    html: "<h1>Welcome.</h1>",
  });

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "Email verified!",
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  if (user.isVerified) return sendError(res, "This email is already in use!");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(res, "Please wait 1 hour before requesting again!");

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: user.email,
    subject: "Email Verification",
    html: `
      <p>Verification OTP: </p>
      <h1>${OTP}</h1>
    `,
  });

  res.json({
    message: "OTP has been sent to your email address!",
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email cannot be empty!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(res, "Please wait 1 hour before requesting again!");

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `${process.env.BASE_CLIENT_URL}/auth/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@gunduzfilm.com",
    to: user.email,
    subject: "Password Reset Link",
    html: `
      <p>Click to change your password.</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  });

  res.json({ message: "Link has been sent to your email address!" });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(res, "New password must be different from old password!");

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@gunduzfilm.com",
    to: user.email,
    subject: "Password Reset Successful",
    html: `
      <p>You can now use your new password.</p>

    `,
  });

  res.json({
    message: "Your password has been changed!",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email and password do not match!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email and password do not match!");

  const { _id, name, role, isVerified, avatar, favorites } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  await ActivityLog.create({
    user: _id,
    action: "login",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.json({
    user: {
      id: _id,
      name,
      email,
      role,
      token: jwtToken,
      avatar,
      isVerified,
      favorites,
    },
  });
};

exports.uploadAvatar = async (req, res) => {
  const { file } = req;
  const userId = req.user._id;

  if (!file) return sendError(res, "Avatar file is missing!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: "avatars",
      width: 300,
      height: 300,
      crop: "fill",
      gravity: "face",
    }
  );

  user.avatar = { url: secure_url, public_id };
  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  });
};

exports.updateProfile = async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  if (name && name !== user.name) {
    user.name = name.trim();
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) return sendError(res, "Email already in use!");

    user.email = email.trim();
    user.isVerified = false;
  }

  if (oldPassword && newPassword) {
    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) return sendError(res, "Invalid old password!");

    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword)
      return sendError(
        res,
        "New password must be different from old password!"
      );

    user.password = newPassword;
  }

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
    message: "Profile updated successfully!",
  });
};

exports.toggleFavorite = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  const index = user.favorites.indexOf(movieId);

  if (index === -1) {
    user.favorites.push(movieId);
  } else {
    user.favorites.splice(index, 1);
  }

  await user.save();

  res.json({
    message: index === -1 ? "Added to favorites!" : "Removed from favorites!",
    favorites: user.favorites,
  });
};

exports.getFavorites = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("favorites");

  const favorites = user.favorites.map((m) => ({
    id: m._id,
    title: m.title,
    poster: m.poster?.url,
    responsivePosters: m.poster?.responsive,
    genres: m.genres,
    status: m.status,
    reviews: {
      ratingAvg: m.reviewStats?.ratingAvg,
      reviewCount: m.reviewStats?.reviewCount,
    },
  }));

  res.json({ movies: favorites });
};

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const users = await User.find(query)
    .select("-password -__v")
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1, _id: 1 });

  const formattedUsers = users.map((user) => ({
    ...user.toObject(),
    id: user._id,
    _id: undefined,
  }));

  const count = await User.countDocuments(query);

  res.json({
    users: formattedUsers,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
  });
};

exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  const { duration } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user ID");

  const durations = {
    "1d": 1,
    "1w": 7,
    "1m": 30,
    "3m": 90,
    "6m": 180,
    "1y": 365,
    permanent: 100 * 365,
  };

  const days = durations[duration];
  if (days === undefined) return sendError(res, "Invalid duration");

  const blockedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true, blockedUntil },
    { new: true }
  ).select("-password");

  if (!user) return sendError(res, "User not found");

  res.json({ message: "User blocked successfully", user });
};

exports.unblockUser = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user ID");

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false, blockedUntil: null },
    { new: true }
  ).select("-password");

  if (!user) return sendError(res, "User not found");

  res.json({ message: "User unblocked successfully", user });
};

exports.changeUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user ID");

  const allowedRoles = ["user", "admin", "moderator"];
  if (!allowedRoles.includes(role)) {
    return sendError(res, "Invalid role");
  }

  if (userId === req.user._id.toString()) {
    return sendError(res, "Cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) return sendError(res, "User not found");

  res.json({ message: "Role updated successfully", user });
};
