// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../Models/Account");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const { verifyToken } = require("../Middlewares/auth");

require("dotenv").config();

const caching = new NodeCache({ stdTTL: 60 }); // 1 min cache

// ==========================
// REGISTER
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local"
    });
    const token=jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role || "USER"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" })
    res.status(201).json({
      message: "User registered successfully",
      token:token
    });

  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
});

// ==========================
// LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "USER"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Cache user
    caching.set(`user:${user._id}`, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "USER"
    });

    res.status(200).json({
      message: "Login successful",
      token:token
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});


// ==========================
// GET LOGGED-IN USER (JWT)
// ==========================
router.get("/user", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// ==========================
// GET USER BY ID (CACHE + DB)
// ==========================
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Check cache
    const cachedUser = caching.get(`user:${userId}`);
    if (cachedUser) {
      return res.status(200).json({
        source: "cache",
        data: cachedUser
      });
    }

    // 2. DB lookup
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Cache it
    caching.set(`user:${userId}`, user.toObject());

    res.status(200).json({
      source: "db",
      data: user
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: err.message
    });
  }
});

// ==========================
// UPDATE USER
// ==========================
router.put("/user/:id",verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Invalidate & update cache
    caching.del(`user:${req.params.id}`);
    caching.set(`user:${req.params.id}`, updatedUser.toObject());

    res.status(200).json({
      message: "User updated",
      data: updatedUser
    });

  } catch (err) {
    res.status(400).json({
      message: "Update failed",
      error: err.message
    });
  }
});

// ==========================
// RESET PASSWORD
// ==========================
router.put("/reset-password",verifyToken, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    caching.del(`user:${user._id}`);

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (err) {
    res.status(500).json({
      message: "Password reset failed",
      error: err.message
    });
  }
});

module.exports = router;
