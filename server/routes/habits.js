// routes/habits.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Habit = require("../models/Habit");

const getUTCDateWithoutTime = (dateStr, timezone) => {
  const date = new Date(dateStr);
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
};

// Helper function to get start of day in user's timezone
const getStartOfDay = (date, timezone) => {
  const userDate = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  userDate.setHours(0, 0, 0, 0);
  return userDate;
};

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

    console.log("Habit retrieved successfully:", {
      habitId: habit._id.toString(),
      habitName: habit.name,
      userId: req.user._id.toString(),
      requestTime: new Date().toISOString(),
    });

    res.json(habit);
  } catch (err) {
    console.error("Error fetching habit:", {
      error: err.message,
      stack: err.stack,
      userId: req.user._id.toString(),
      habitId: req.params.id,
      requestTime: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ message: "Error fetching habit", error: err.message });
  }
});

router.post("/:id/complete", auth, async (req, res) => {
  console.log(`[Complete Route] Started for habit ID: ${req.params.id}`);
  try {
    const { date, timezone } = req.body;
    console.log(
      `[Complete Route] Request data - Date: ${date}, Timezone: ${timezone}`
    );

    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      console.log(
        `[Complete Route] Habit not found or unauthorized for ID: ${req.params.id}`
      );
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    console.log(`[Complete Route] Found habit: ${habit.name}`);

    // Convert date to UTC for storage
    const utcDate = getUTCDateWithoutTime(date, timezone);
    console.log(
      `[Complete Route] Converted UTC date: ${utcDate.toISOString()}`
    );

    // Check if progress already exists for this date
    const existingProgress = habit.progress.find((p) => {
      const progressDate = new Date(p.date);
      return (
        progressDate.toISOString().split("T")[0] ===
        utcDate.toISOString().split("T")[0]
      );
    });

    console.log(
      `[Complete Route] Existing progress found: ${!!existingProgress}`
    );

    if (!existingProgress) {
      console.log("[Complete Route] Adding new progress entry");
      habit.progress.push({
        date: utcDate,
        completed: true,
        notes: "Completed",
      });
    }

    // Sort progress by date for streak calculation
    habit.progress.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(
      `[Complete Route] Total progress entries: ${habit.progress.length}`
    );

    // Calculate streak considering timezone
    let currentStreak = 0;
    const today = getStartOfDay(new Date(), timezone);
    console.log(
      `[Complete Route] Start of day in user timezone: ${today.toISOString()}`
    );

    let checkDate = new Date(today);
    let foundFirst = false;

    console.log("[Complete Route] Starting streak calculation");
    while (checkDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      let shouldCount = false;
      const userDate = new Date(
        checkDate.toLocaleString("en-US", { timeZone: timezone })
      );
      const dayOfWeek = userDate.getDay();

      console.log(
        `[Complete Route] Checking date: ${checkDate.toISOString()}, Day of week: ${dayOfWeek}`
      );

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

      console.log(`[Complete Route] Should count this day: ${shouldCount}`);

      if (shouldCount) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const completed = habit.progress.some((p) => {
          const progressDate = new Date(p.date);
          return (
            progressDate.toISOString().split("T")[0] === dateStr && p.completed
          );
        });

        console.log(`[Complete Route] Date ${dateStr} completed: ${completed}`);

        if (completed) {
          currentStreak++;
          foundFirst = true;
          console.log(`[Complete Route] Streak increased to: ${currentStreak}`);
        } else if (foundFirst) {
          console.log("[Complete Route] Streak broken, ending calculation");
          break;
        } else if (checkDate < today) {
          console.log(
            "[Complete Route] Past date not completed, ending calculation"
          );
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const previousLongest = habit.streak?.longest || 0;
    habit.streak = {
      current: currentStreak,
      longest: Math.max(previousLongest, currentStreak),
    };

    console.log(
      `[Complete Route] Final streak - Current: ${currentStreak}, Longest: ${habit.streak.longest}`
    );

    await habit.save();
    console.log("[Complete Route] Habit saved successfully");
    res.json(habit);
  } catch (err) {
    console.error("[Complete Route] Error:", err);
    res
      .status(400)
      .json({ message: "Error completing habit", error: err.message });
  }
});

router.post("/:id/uncomplete", auth, async (req, res) => {
  console.log(`[Uncomplete Route] Started for habit ID: ${req.params.id}`);
  try {
    const { date } = req.body;
    console.log(`[Uncomplete Route] Request date: ${date}`);

    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      console.log(
        `[Uncomplete Route] Habit not found or unauthorized for ID: ${req.params.id}`
      );
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized" });
    }

    console.log(`[Uncomplete Route] Found habit: ${habit.name}`);

    // Remove from progress array
    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);
    console.log(
      `[Uncomplete Route] Normalized completion date: ${completionDate.toISOString()}`
    );

    const previousProgressLength = habit.progress.length;
    habit.progress = habit.progress.filter(
      (p) =>
        p.date.toISOString().split("T")[0] !==
        completionDate.toISOString().split("T")[0]
    );

    console.log(
      `[Uncomplete Route] Removed ${
        previousProgressLength - habit.progress.length
      } progress entries`
    );

    // Recalculate streak
    habit.progress.sort((a, b) => b.date - a.date);
    console.log(
      `[Uncomplete Route] Sorted ${habit.progress.length} progress entries`
    );

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let foundFirst = false;

    console.log("[Uncomplete Route] Starting streak recalculation");
    while (checkDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      let shouldCount = false;
      const dayOfWeek = checkDate.getDay();

      console.log(
        `[Uncomplete Route] Checking date: ${checkDate.toISOString()}, Day of week: ${dayOfWeek}`
      );

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

      console.log(`[Uncomplete Route] Should count this day: ${shouldCount}`);

      if (shouldCount) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const completed = habit.progress.some(
          (p) => p.date.toISOString().split("T")[0] === dateStr && p.completed
        );

        console.log(
          `[Uncomplete Route] Date ${dateStr} completed: ${completed}`
        );

        if (completed) {
          currentStreak++;
          foundFirst = true;
          console.log(
            `[Uncomplete Route] Streak increased to: ${currentStreak}`
          );
        } else if (foundFirst) {
          console.log("[Uncomplete Route] Streak broken, ending calculation");
          break;
        } else if (checkDate < today) {
          console.log(
            "[Uncomplete Route] Past date not completed, ending calculation"
          );
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const previousLongest = habit.streak?.longest || 0;
    habit.streak = {
      current: currentStreak,
      longest: Math.max(previousLongest, currentStreak),
    };

    console.log(
      `[Uncomplete Route] Final streak - Current: ${currentStreak}, Longest: ${habit.streak.longest}`
    );

    await habit.save();
    console.log("[Uncomplete Route] Habit saved successfully");
    res.json(habit);
  } catch (err) {
    console.error("[Uncomplete Route] Error:", err);
    res
      .status(400)
      .json({ message: "Error uncompleting habit", error: err.message });
  }
});

module.exports = router;
