// routes/users.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/profile", auth, async (req, res) => {
  // Get user profile
});

router.put("/profile", auth, async (req, res) => {
  // Update user profile
});

module.exports = router;
