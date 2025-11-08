const express=require("express")
const app=express();
const dotenv=require("dotenv")
const mongoose=require("mongoose")
const authController=require("./Controllers/authController")
dotenv.config();
app.use(express.json())
mongoose.connect(process.env.USERS_DB)
.then(console.log("MongoDb connected successfully"))

app.use("/",authController)

app.listen(process.env.AUTH_SERVICE_PORT,()=>{
    console.log(`Server running on port ${process.env.AUTH_SERVICE_PORT}`)
})