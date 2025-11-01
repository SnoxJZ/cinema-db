const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");
const { userClient } = require("../clients/userClient");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;

  if (!token) return sendError(res, "Invalid token!");
  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return sendError(res, "Invalid token!");

  try {
    const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { userId } = decode;

    const { data: user } = await userClient.get(`/user/internal/${userId}`);
    if (!user) return sendError(res, "Unauthorized access!");

    if (user.isBlocked) {
      if (user.blockedUntil && user.blockedUntil < new Date()) {
        await userClient.patch(`/user/internal/${userId}/unblock-auto`);
        user.isBlocked = false;
        user.blockedUntil = null;
      } else {
        const message = user.blockedUntil
          ? `Account blocked until ${user.blockedUntil.toLocaleDateString()}`
          : "Your account has been blocked permanently";
        return sendError(res, message);
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid token!");
  }
};
