// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../Models/Account");
const bcrypt = require("bcryptjs");
const NodeCache = require("node-cache");

const caching = new NodeCache({ stdTTL: 60 }); // 1 min cache

// ==========================
// REGISTER
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider:"local"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// ==========================
// LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password,provider } = req.body;
    if(provider==="google"||!provider){
      return res.status(403).json({message:"The current email has created an account with google"})
    }
    const user = await User.findOne({email});
   
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // ⚡ Cache user on login
    caching.set(`user${user._id}`, {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    provider: req.user.provider
  });
});

// ==========================
// GET USER (WITH CACHE)
// =========================
// =
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Try cache first
    const cachedUser = caching.get(`user${userId}`);
    if (cachedUser) {
      return res.status(200).json({ source: "cache", data: cachedUser });
    }

    // 2️⃣ Fetch from DB
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3️⃣ Store in cache
    caching.set(`user${userId}`, user.toObject());

    res.status(200).json({ source: "db", data: user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

// ==========================
// UPDATE USER (CACHE INVALIDATE)
// ==========================
router.put("/user/:id", async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    // ❌ Invalidate old cache
    caching.del(`user${req.params.id}`);

    // ✔ Save fresh updated data
    caching.set(`user${req.params.id}`, updatedUser.toObject());

    res.status(200).json({ message: "User updated", data: updatedUser });
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

// ==========================
// RESET PASSWORD
// ==========================
router.put("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user found with this email" });

    const isSame = await bcrypt.compare(password, user.password);
    if (isSame)
      return res.status(400).json({ message: "Please enter a new password" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // ❌ Remove stale cache because password changed
    caching.del(`user${user._id}`);

    res.status(200).json({
      message: "Password reset successful",
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({
      message: "Password reset failed",
      error: err.message,
    });
  }
});

module.exports = router;
