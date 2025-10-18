const express=require("express")
const app=express()
const cors=require("cors")
const routes=require("./Routes/routes")
const authRoutes=require("./Routes/authRoute")
const otpRoutes=require("./Routes/otpRoutes")
const mongoose=require("mongoose")
const dotenv=require("dotenv")

dotenv.config()
//MongoDb connection
mongoose.connect(process.env.URL)
.then(()=>console.log("Mongodb connected successfully"))
.catch(error=>console.log(error))


app.use(cors())
app.use(express.json())
app.use('/apis',routes)
app.use("/auth",authRoutes)
app.use("/otps",otpRoutes)
const port=3000
app.listen(port,()=>{
    console.log("Server running on 3000 port")
})