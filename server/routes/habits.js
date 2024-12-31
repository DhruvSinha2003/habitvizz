// routes/habits.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Habit = require("../models/Habit");

// Get all habits for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching habits", error: err.message });
  }
});

// Create a new habit
router.post("/", auth, async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      user: req.user._id,
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating habit", error: err.message });
  }
});

// Update a habit
router.put("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!habit) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    res.json(habit);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating habit", error: err.message });
  }
});

// Delete a habit
router.delete("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting habit", error: err.message });
  }
});

// Get a single habit
router.get("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    res.json(habit);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching habit", error: err.message });
  }
});

module.exports = router;
