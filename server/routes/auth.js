// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { body } = require("express-validator");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("username").isLength({ min: 3 }),
  ],
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  login
);

module.exports = router;
