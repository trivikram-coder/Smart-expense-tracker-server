const axios=require("axios")

const express=require("express")
const app=express()
const dotenv=require("dotenv")
dotenv.config()

async function categorizeItem(itemName) {
  const prompt = `
  Categorize the following expense item into one of these categories:
  [Food, Dairy, Transport, Entertainment, Health, Shopping, Bills, Education, Others].
  Item: "${itemName}"
  Return only the category name.
  `;
  const response = await axios.post(`${process.env.AI_URL}/chat`, { prompt });
  const category = response.data.response;
 
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
app.get("/",(req,res)=>{
  res.send("<h2>Ai Expense service is running </h2>")
})
module.exports=app