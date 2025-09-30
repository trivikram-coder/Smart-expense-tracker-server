const mongoose=require("mongoose")
const schema=mongoose.Schema({
    otp:{
        type:String,
        required:true
    }
})
module.exports=mongoose.model("otp",schema)