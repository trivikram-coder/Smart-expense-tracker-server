const axios=require("axios")

const express=require("express")
const app=express()
const dotenv=require("dotenv")
dotenv.config()

async function categorizeItem(itemName) {
  const prompt = `
You are an expense categorization assistant.

Categories:
- Food (restaurants, snacks, meals)
- Dairy (milk, cheese, curd)
- Transport (bus, train, taxi, fuel)
- Entertainment (movies, cinema tickets, OTT subscriptions, games, concerts)
- Health (medicine, doctor, hospital)
- Shopping (clothes, electronics, accessories)
- Bills (electricity, water, mobile, internet)
- Education (books, courses, fees)
- Others (only if it does not fit anywhere)

Rules:
- If the item is a movie name or cinema-related, categorize it as "Entertainment".
- Return ONLY the category name. No explanation.

Item: "${itemName}"
`;

  const response = await axios.post(`${process.env.AI_URL}/chat`, { prompt });

  return response.data.response.trim();
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
app.get("/",(req,res)=>{
  res.send("<h2>Ai Expense service is running </h2>")
})
module.exports=app