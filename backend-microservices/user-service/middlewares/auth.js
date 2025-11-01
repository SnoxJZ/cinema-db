const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");
const User = require("../models/user");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;

  if (!token) return sendError(res, "Invalid token!");
  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return sendError(res, "Invalid token!");
  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "Unauthorized access!");

  if (user.isBlocked) {
    if (user.blockedUntil && user.blockedUntil < new Date()) {
      await User.findByIdAndUpdate(userId, {
        isBlocked: false,
        blockedUntil: null,
      });
    } else {
      const message = user.blockedUntil
        ? `Account blocked until ${user.blockedUntil.toLocaleDateString()}`
        : "Your account has been blocked permanently";
      return sendError(res, message);
    }
  }

  req.user = user;

  next();
};

exports.isAdmin = async (req, res, next) => {
  const { user } = req;
  if (user.role !== "admin") return sendError(res, "Unauthorized access!");

  next();
};

exports.isAdminOrModerator = async (req, res, next) => {
  const { user } = req;
  const allowedRoles = ["admin", "moderator"];

  if (!allowedRoles.includes(user.role)) {
    return sendError(res, "Unauthorized access!");
  }

  next();
};
