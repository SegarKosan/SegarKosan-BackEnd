const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db"); // <-- pastikan import

// Register Controller
exports.register = async (req, res) => {
  try {
    // Pastikan DB connect dulu
    await connectDB();

    console.log("[AUTH] Register attempt:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    console.log("[AUTH] User registered successfully:", user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[AUTH] Register error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    // Pastikan DB connect dulu
    await connectDB();

    console.log("[AUTH] Login attempt:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    console.log("[AUTH] Login successful:", user.email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error during login",
        error: error.message,
      });
  }
};
