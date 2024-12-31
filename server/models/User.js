// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  settings: {
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly"],
        default: "daily",
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
