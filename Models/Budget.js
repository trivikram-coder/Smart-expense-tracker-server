const mongoose=require("mongoose")
const schema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    budget:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model("Budget",schema)