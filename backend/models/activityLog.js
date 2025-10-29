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
      "create_review",
      "delete_review",
      "update_review",
      "block_user",
      "unblock_user",
      "change_role",
      "upload_avatar",
      "update_profile",
      "create_actor",
      "update_actor",
      "delete_actor",
      "create_movie",
      "update_movie",
      "delete_movie",
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
