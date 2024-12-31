// routes/auth.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("username").isLength({ min: 3 }),
  ],
  async (req, res) => {
    // Registration logic will go here
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    // Login logic will go here
  }
);

module.exports = router;
