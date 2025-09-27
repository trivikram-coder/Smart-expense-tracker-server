const mongoose=require("mongoose")
const schema=new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   amount:{
      type:Number,
      required:true
   },
   category:String,
   date:{
      type:Date,
      default:Date.now
   }
})
module.exports=mongoose.model("Expenses",schema)