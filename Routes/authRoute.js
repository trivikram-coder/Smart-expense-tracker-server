// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../Models/Account"); // your User model
const bcrypt = require("bcryptjs");
const cachedObj={}
// POST /register - create new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /login - authenticate user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Login successful
    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// GET /user/:id - get user info by ID
router.get("/user/:id", async (req, res) => {
  const cacheKey = `user${req.params.id}`;
  try {
    // Try Redis first
    const cachedData = cachedObj[cacheKey];
    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
    }

    // Fetch from DB
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Store in cache
    cachedObj[cacheKey]=JSON.stringify(user)

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});


// PUT /user/:id - update user info
// PUT /user/:id - update user info (excluding password)
router.put("/user/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = { name, email };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    // Invalidate cache
    delete cachedObj[`user${req.params.id}`];

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});


// PUT /user/:id/password - update user password only
router.put("/user/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ message: "Password updated successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: "Password update failed", error: err.message });
  }
});

module.exports = router;
