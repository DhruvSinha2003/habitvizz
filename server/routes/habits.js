// routes/habits.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  // Get all habits for user
});

router.post("/", auth, async (req, res) => {
  // Create new habit
});

router.put("/:id", auth, async (req, res) => {
  // Update habit
});

router.delete("/:id", auth, async (req, res) => {
  // Delete habit
});

module.exports = router;
