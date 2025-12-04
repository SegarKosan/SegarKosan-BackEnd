const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// @route   POST /auth/register
// @desc    Register new user
// @access  Public
router.post("/register", authController.register);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post("/login", authController.login);

// @route   POST /auth/google
// @desc    Google Login
// @access  Public
router.post("/google", authController.googleLogin);

module.exports = router;
