const Budget = require("../Models/Budget");
const app = require("express")();

// 🟢 Add new budget
app.post("/add", async (req, res) => {
  try {
    const { userId, budget } = req.body;
    if (!userId || budget == null) {
      return res.status(400).json({ message: "User ID or budget required" });
    }

    // prevent duplicates → update if exists
    const existing = await Budget.findOne({ userId });
    if (existing) {
      existing.budget = budget;
      await existing.save();
      return res.status(200).json({ message: "Budget updated successfully" });
    }

    const budgetModel = new Budget({ userId, budget });
    await budgetModel.save();
    res.status(201).json({ message: "Budget added successfully" });
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

    const budget = await Budget.findOne({ userId });
    if (!budget) {
      return res.status(404).json({ message: "No budget found for this user" });
    }

    res.status(200).json({ data: budget });
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
      { new: true, upsert: true } // create if not found
    );

    res.status(200).json({ message: "Budget updated successfully", data: updatedBudget });
  } catch (error) {
    res.status(500).json({ message: "Unable to update", error: error.message });
  }
});

module.exports = app;
