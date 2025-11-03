const categorizeItem = require("../Ai model/categoryDetect");
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

function getItem(message) {
  const match = message.match(/on\s+([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : "general";
}

function getAmount(message) {
  const match = message.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
async function getCategory(item){
  try{

    const category=await categorizeItem(item);
   
    return category;
  }
  catch(error){
    console.log("Failed to load",error)
  }
}
async function addExpense(message, userId) {
  const amount = getAmount(message);
  const item = getItem(message);
  const category=await getCategory(item)
  const date=new Date(Date.now())
  const expense = new Expenses({
    amount,
    item,
    category,
    date: date.toLocaleDateString(), // store as Date
    userId
  });

  await expense.save();

  return `Got it! Added ₹${amount} of ${item} under ${category} on ${expense.date.toLocaleDateString()}`;
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
  const budget = 1000000;
  return total > budget
    ? `⚠️ You exceeded your budget of ₹${budget} by ₹${total - budget}`
    : `✅ You are within budget. Total: ₹${total}`;
}

module.exports = { detectIntent, handleIntent, getCategory };
