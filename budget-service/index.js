const express=require("express")
const app=express()
const budgetController=require("./Controllers/budgetController")
const connection=require("./Util/db")
const dotenv=require("dotenv")
app.use(express.json())
dotenv.config()
const port=process.env.BUDGET_SERVICE_PORT;

app.use("/",budgetController)

connection();
app.listen(port,()=>{
    console.log(`Server running on PORT ${port}`)
})