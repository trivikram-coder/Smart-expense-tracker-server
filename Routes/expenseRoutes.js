// routes/expenses.js
const express = require("express");
const Expenses = require("../Models/Expenses");
const { detectIntent, handleIntent } = require("../ExpenseCalculator/expCal");
const Message=require("../Models/Message")
const router = express.Router();

// Add expense via message
router.post("/add", async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }
    const intent = detectIntent(message.toLowerCase());
    const reply = await handleIntent(intent, message, userId);
    await Message.insertMany([
      { userId, sender: "client", message },
      { userId, sender: "bot", message: reply },
    ]);

    res.status(200).json({ message: reply });
  } catch (error) {
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
});

// Read all expenses of a user

router.get("/read", async (req, res) => {
  try {
    const userId = req.query.userId;
    

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }
    

    const expenses = await Expenses.find({ userId }).sort({ date: -1 });
 
    res.status(200).json({ data: expenses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
});

// Delete an expense securely
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "userId is required in body" });

    const del = await Expenses.findOneAndDelete({ _id: id, userId });

    if (!del) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete expense", error: error.message });
  }
});

module.exports = router;
