const Budget = require("../Models/Budget");
const app = require("express")();
const NodeCache = require("node-cache");
const caching = new NodeCache({ stdTTL: 60 });

// 🟢 Add new budget
app.post("/add", async (req, res) => {
  try {
    const { userId, budget } = req.body;

    if (!userId || budget == null) {
      return res.status(400).json({ message: "User ID or budget required" });
    }

    // Check existing
    const existing = await Budget.findOne({ userId });

    if (existing) {
      existing.budget = budget;
      const updated = await existing.save();

      // Update cache
      caching.set(`budget${userId}`, updated.toObject());

      return res.status(200).json({ message: "Budget updated successfully", data: updated });
    }

    // If not existing → create new
    const newBudget = new Budget({ userId, budget });
    await newBudget.save();

    // Set cache for new document
    caching.set(`budget${userId}`, newBudget.toObject());

    res.status(201).json({ message: "Budget added successfully", data: newBudget });

  } catch (error) {
    res.status(500).json({ message: "Unable to add budget", error: error.message });
  }
});

// 🟢 Read budget
app.get("/read/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // 1️⃣ Check cache
    const budgetCache = caching.get(`budget${userId}`);
    if (budgetCache) {
      return res.status(200).json({ source: "cache", data: budgetCache });
    }

    // 2️⃣ Read from DB
    const budget = await Budget.findOne({ userId });

    if (!budget) {
      return res.status(404).json({ message: "No budget found for this user" });
    }

    // 3️⃣ Save to cache
    caching.set(`budget${userId}`, budget.toObject());

    res.status(200).json({ source: "db", data: budget });

  } catch (error) {
    res.status(500).json({ message: "Unable to fetch budget", error: error.message });
  }
});

// 🟢 Update budget
app.put("/update/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { budget } = req.body;

    if (!userId || budget == null) {
      return res.status(400).json({ message: "User ID and budget are required" });
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { userId },
      { budget },
      { new: true, upsert: true }
    );

    // Update cache
    caching.set(`budget${userId}`, updatedBudget);

    res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget
    });

  } catch (error) {
    res.status(500).json({ message: "Unable to update budget", error: error.message });
  }
});

module.exports = app;
