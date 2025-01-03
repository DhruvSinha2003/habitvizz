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

const getStartOfDay = (date, timezone) => {
  const userDate = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  userDate.setHours(0, 0, 0, 0);
  return userDate;
};

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

    const utcDate = getUTCDateWithoutTime(date, timezone);

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
        notes: "Completed",
      });
    }

    habit.progress.sort((a, b) => new Date(b.date) - new Date(a.date));

    let currentStreak = 0;
    const today = getStartOfDay(new Date(), timezone);

    let checkDate = new Date(today);
    let foundFirst = false;

    while (checkDate >= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      let shouldCount = false;
      const userDate = new Date(
        checkDate.toLocaleString("en-US", { timeZone: timezone })
      );
      const dayOfWeek = userDate.getDay();

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
        const completed = habit.progress.some((p) => {
          const progressDate = new Date(p.date);
          return (
            progressDate.toISOString().split("T")[0] === dateStr && p.completed
          );
        });

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

    const previousLongest = habit.streak?.longest || 0;
    habit.streak = {
      current: currentStreak,
      longest: Math.max(previousLongest, currentStreak),
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

    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    const previousProgressLength = habit.progress.length;
    habit.progress = habit.progress.filter(
      (p) =>
        p.date.toISOString().split("T")[0] !==
        completionDate.toISOString().split("T")[0]
    );

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

    const previousLongest = habit.streak?.longest || 0;
    habit.streak = {
      current: currentStreak,
      longest: Math.max(previousLongest, currentStreak),
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
