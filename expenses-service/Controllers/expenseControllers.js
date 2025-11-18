// routes/expenses.js
const express = require("express");
const NodeCache = require("node-cache");
const caching = new NodeCache({ stdTTL: 60 }); // 1 min cache
const Expenses = require("../Models/Expenses");
const { detectIntent, handleIntent } = require("../expenseCalulate/expCal");
const axios = require("axios");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();


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

    // Store chat
    await axios.post(`${process.env.MESSAGE_SERVICE_URL}/add`, [
      { userId, sender: "client", message },
      { userId, sender: "bot", message: reply },
    ]);

    // Clear cached expenses
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
// READ ALL EXPENSES (LATEST FIRST)
// ===============================
router.get("/read", async (req, res) => {
  try {
    const { userId, page, limit } = req.query;

    if (!userId || !page || !limit) {
      return res.status(400).json({ message: "userId, page and limit are required" });
    }

    const skip = (page - 1) * limit;

    // Total count
    const totalCount = await Expenses.countDocuments({ userId });

    // Try cache
    const cached = caching.get(`expenses${userId}`);

    if (cached) {
      // Cached list is already sorted (we store sorted version)
      const paged = cached.slice(skip, skip + Number(limit));

      return res.status(200).json({
        source: "cache",
        data: paged,
        totalCount,
        allData: cached // FULL sorted list
      });
    }

    // Fetch paginated (LATEST FIRST)
    const expensesData = await Expenses.find({ userId })
      .sort({date:-1})         // <--- IMPORTANT
      .skip(skip)
      .limit(Number(limit));

    // Fetch FULL sorted data (LATEST FIRST)
    const fullExpenses = await Expenses.find({ userId })
      .sort({ date: -1 });             // <--- IMPORTANT

    // Convert to plain JS objects
    const plain = fullExpenses.map((e) => e.toObject());

    // store sorted list in cache
    caching.set(`expenses${userId}`, plain);

    res.status(200).json({
      source: "db",
      data: expensesData,
      totalCount,
      allData: plain
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message
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

    // Clear cache
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
