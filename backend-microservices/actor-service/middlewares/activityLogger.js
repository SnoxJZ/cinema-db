const ActivityLog = require("../models/activityLog");

exports.logActivity = (action) => async (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (!data.error && req.user) {
      ActivityLog.create({
        user: req.user._id,
        action,
        details: JSON.stringify(req.body),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch(console.error);
    }
    return originalJson.call(this, data);
  };

  next();
};
