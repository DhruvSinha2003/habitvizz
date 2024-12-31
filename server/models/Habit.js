// models/Habit.js
const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      "health",
      "work",
      "learning",
      "fitness",
      "mindfulness",
      "productivity",
      "social",
      "finance",
      "custom",
      "other",
    ],
  },
  customCategory: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "custom"],
  },
  customDays: [
    {
      type: Number,
      min: 0,
      max: 6,
    },
  ],
  color: {
    type: String,
    default: "#008170",
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  streak: {
    current: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
  },
  progress: [
    {
      date: Date,
      completed: Boolean,
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Habit", habitSchema);
