const {GoogleGenerativeAI}=require("@google/generative-ai")
const dotenv=require("dotenv")
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

 async function categorizeItem(itemName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  Categorize the following expense item into one of these categories:
  [Food, Dairy, Transport, Entertainment, Health, Shopping, Bills, Education, Others].
  Item: "${itemName}"
  Return only the category name.
  `;

  const result = await model.generateContent(prompt);
  const category = result.response.text().trim();

  return category;
}


module.exports=categorizeItem