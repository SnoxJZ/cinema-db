const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "register",
      "block_user",
      "unblock_user",
      "change_role",
      "upload_avatar",
      "update_profile",
    ],
  },
  details: String,
  ip: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
