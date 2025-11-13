// routes/expenses.js
const express = require("express");
const NodeCache = require("node-cache");
const caching = new NodeCache({ stdTTL: 60 }); // 1 min cache
const Expenses = require("../Models/Expenses");
const { detectIntent, handleIntent } = require("../expenseCalulate/expCal");
const axios = require("axios");

const router = express.Router();

// ===============================
// ADD EXPENSE (CHAT MESSAGE BASED)
// ===============================
router.post("/add", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }

    // NLP
    const intent = detectIntent(message.toLowerCase());
    const reply = await handleIntent(intent, message, userId);

    // Store chat messages
    await axios.post("http://localhost:4004/add", [
      { userId, sender: "client", message },
      { userId, sender: "bot", message: reply },
    ]);

    // ⚠️ IMPORTANT: Clear or update expense cache
    caching.del(`expenses${userId}`);

    res.status(200).json({ message: reply });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add expense",
      error: error.message,
    });
  }
});

// ===============================
// READ ALL EXPENSES (WITH CACHE)
// ===============================
router.get("/read", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    // 1️⃣ Try cache first
    const expenseCache = caching.get(`expenses${userId}`);
    if (expenseCache) {
      return res.status(200).json({ source: "cache", data: expenseCache });
    }

    // 2️⃣ Fetch from DB
    const expenses = await Expenses.find({ userId }).sort({ date: -1 });

    // 3️⃣ Save plain objects in cache
    const plainExpenses = expenses.map((e) => e.toObject());
    caching.set(`expenses${userId}`, plainExpenses);

    res.status(200).json({ source: "db", data: plainExpenses });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
});

// ===============================
// DELETE EXPENSE
// ===============================
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: "userId is required in body" });

    const deleted = await Expenses.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    // Clear cache so next GET fetches fresh data
    caching.del(`expenses${userId}`);

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete expense",
      error: error.message,
    });
  }
});

module.exports = router;
