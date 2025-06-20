const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    identityRevealed: {
      type: Boolean,
      default: false,
    },
    identityRevealRequested: {
      type: Boolean,
      default: false,
    },
    receivingStopped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
