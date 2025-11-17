const express=require("express")
const app=express()
const messageController=require("./Controllers/messageController")
const dbConn=require("./Util/db")
const dotenv=require("dotenv")
const cors=require("cors")
dotenv.config()
app.use(express.json())
app.use(cors())
app.use("/",messageController)
dbConn()
app.get("/",(req,res)=>{
    res.send("Message service running")
})
app.listen(process.env.MESSAGE_SERVICE_PORT || 5000,()=>{
    console.log(`Server running on port ${process.env.MESSAGE_SERVICE_PORT}`);
})