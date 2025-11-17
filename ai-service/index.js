const express=require("express")
const app=express()
const cors=require("cors")
const aiController=require("./Controller/aiController")

app.use(express.json())
app.use(cors())
app.use("/",aiController)
const port=process.env.AI_SERVICE_PORT || 5000
app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})