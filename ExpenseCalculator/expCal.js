const Expenses = require("../Models/Expenses");

function detectIntent(message) {
  if (message.includes("spent")) return "AddExpense";
  if (message.includes("show")) return "ShowExpenses";
  if (message.includes("budget")) return "CheckBudget";
}

async function handleIntent(intent, message, userId) {
  switch (intent) {
    case "AddExpense":
      return await addExpense(message, userId);
    case "ShowExpenses":
      return await showExpenses(userId);
    case "CheckBudget":
      return await checkBudget(userId);
    default:
      return "I did not understand that.";
  }
}

function getCategory(message) {
  const match = message.match(/on\s+([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : "general";
}

function getAmount(message) {
  const match = message.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

async function addExpense(message, userId) {
  const amount = getAmount(message);
  const category = getCategory(message);

  const expense = new Expenses({
    amount,
    category,
    date: new Date(), // store as Date
    userId
  });

  await expense.save();

  return `Got it! Added ₹${amount} under ${category} on ${expense.date.toLocaleDateString()}`;
}

async function showExpenses(userId) {
  const expenses = await Expenses.find({ userId });
  if (expenses.length === 0) return "No expenses found.";

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return `Your total expenses: ₹${total}`;
}

async function checkBudget(userId) {
  const expenses = await Expenses.find({ userId });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = 10000;
  return total > budget
    ? `⚠️ You exceeded your budget of ₹${budget} by ₹${total - budget}`
    : `✅ You are within budget. Total: ₹${total}`;
}

module.exports = { detectIntent, handleIntent, getCategory };
