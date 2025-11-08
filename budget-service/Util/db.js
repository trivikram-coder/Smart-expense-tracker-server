const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()
const url=process.env.BUDGET_DB

async function connect(){
    await mongoose.connect(url)
    .then(console.log("Mongodb connected successfully"))
}

module.exports=connect