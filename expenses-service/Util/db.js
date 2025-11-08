const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()

const url=process.env.EXPENSES_DB
console.log(url)
async function connect(){
    await mongoose.connect(url)
    .then(console.log("Mongodb connected successfully"))
}

module.exports=connect