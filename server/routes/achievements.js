// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { body } = require("express-validator");

router.post("/achievements");

module.exports = router;
