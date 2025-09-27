const mongoose=require("mongoose")
const schema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    message:String,
    date:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model("Message",schema);