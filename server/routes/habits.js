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

router.post("/:id/complete", auth, async (req, res) => {
  try {
    const { date, timezone } = req.body;
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    // Convert date to UTC for storage
    const userDate = new Date(date);
    const utcDate = new Date(
      userDate.toLocaleString("en-US", { timeZone: "UTC" })
    );
    utcDate.setHours(0, 0, 0, 0);

    const existingProgress = habit.progress.find((p) => {
      const progressDate = new Date(p.date);
      return (
        progressDate.toISOString().split("T")[0] ===
        utcDate.toISOString().split("T")[0]
      );
    });

    if (!existingProgress) {
      habit.progress.push({
        date: utcDate,
        completed: true,
      });
    }

    // Sort progress by date for streak calculation
    habit.progress.sort((a, b) => b.date - a.date);

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from most recent date
    let checkDate = new Date(today);
    let foundFirst = false;

    while (checkDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      // Check up to 90 days back
      let shouldCount = false;
      const dayOfWeek = checkDate.getDay();

      switch (habit.frequency) {
        case "daily":
          shouldCount = true;
          break;
        case "weekly":
          shouldCount = dayOfWeek === 1; // Monday
          break;
        case "custom":
          if (habit.customDays?.length > 0) {
            shouldCount = habit.customDays.includes(dayOfWeek);
          }
          break;
        default:
          shouldCount = true;
      }

      if (shouldCount) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const completed = habit.progress.some(
          (p) => p.date.toISOString().split("T")[0] === dateStr && p.completed
        );

        if (completed) {
          currentStreak++;
          foundFirst = true;
        } else if (foundFirst) {
          // Break on first miss after finding a completion
          break;
        } else if (checkDate < today) {
          // If we haven't found any completions and we're before today, break
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    habit.streak = {
      current: currentStreak,
      longest: Math.max(habit.streak?.longest || 0, currentStreak),
    };

    await habit.save();
    res.json(habit);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error completing habit", error: err.message });
  }
});

router.post("/:id/uncomplete", auth, async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    // Remove from progress array
    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    habit.progress = habit.progress.filter(
      (p) =>
        p.date.toISOString().split("T")[0] !==
        completionDate.toISOString().split("T")[0]
    );

    // Recalculate streak using the same logic as complete route
    habit.progress.sort((a, b) => b.date - a.date);

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let foundFirst = false;

    while (checkDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      let shouldCount = false;
      const dayOfWeek = checkDate.getDay();

      switch (habit.frequency) {
        case "daily":
          shouldCount = true;
          break;
        case "weekly":
          shouldCount = dayOfWeek === 1;
          break;
        case "custom":
          if (habit.customDays?.length > 0) {
            shouldCount = habit.customDays.includes(dayOfWeek);
          }
          break;
        default:
          shouldCount = true;
      }

      if (shouldCount) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const completed = habit.progress.some(
          (p) => p.date.toISOString().split("T")[0] === dateStr && p.completed
        );

        if (completed) {
          currentStreak++;
          foundFirst = true;
        } else if (foundFirst) {
          break;
        } else if (checkDate < today) {
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    habit.streak = {
      current: currentStreak,
      longest: Math.max(habit.streak?.longest || 0, currentStreak),
    };

    await habit.save();
    res.json(habit);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error uncompleting habit", error: err.message });
  }
});

module.exports = router;
