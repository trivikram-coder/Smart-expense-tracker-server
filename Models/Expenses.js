const mongoose=require("mongoose")
const schema=new mongoose.Schema({
   name:String,
   amount:Number,
   category:String,
   date:String
})
module.exports=mongoose.model("Expenses",schema)