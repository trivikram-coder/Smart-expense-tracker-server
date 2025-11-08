const mongoose=require("mongoose")
const url=process.env.MONGO_URL

async function connect(){
    await mongoose.connect(url)
    .then(console.log("Mongodb connected successfully"))
}

module.exports=connect