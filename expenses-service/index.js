const express=require("express")
const app=express()
const expenseController=require("./Controllers/expenseControllers")
const connection=require("./Util/db")
const dotenv=require("dotenv")
app.use(express.json())
dotenv.config()
const port=process.env.EXPENSES_SERVICE_PORT

app.use("/",expenseController)
app.get("/",(req,res)=>{
    res.send("Expenses service running")
})
connection();
app.listen(port,()=>{
    console.log(`Server running on PORT ${port}`)
})