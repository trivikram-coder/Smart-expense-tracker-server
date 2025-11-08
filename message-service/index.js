const express=require("express")
const app=express()
const messageController=require("./Controllers/messageController")
const dbConn=require("./Util/db")
const dotenv=require("dotenv")
dotenv.config()
app.use(express.json())
app.use("/",messageController)
dbConn()
app.listen(process.env.MESSAGE_SERVICE_PORT,()=>{
    console.log(`Server running on port ${process.env.MESSAGE_SERVICE_PORT}`);
})