const mongoose=require("mongoose")
const schema=new mongoose.Schema({
    message:String,
    date:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model("Message",schema);