const {GoogleGenerativeAI}=require("@google/generative-ai")

const express=require("express")
const app=express()
const dotenv=require("dotenv")
dotenv.config()

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
app.post('/category',async(req,res)=>{
  try {
    const {item}=req.body;
    if(!item){
      return res.status(400).json({message:"Please provide item"})
    }
    const category=await categorizeItem(item);
    res.status(200).json({category:category});
  } catch (error) {
    
  }
})
module.exports=app