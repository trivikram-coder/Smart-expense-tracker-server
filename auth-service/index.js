const express=require("express")
const app=express();
const dotenv=require("dotenv")
const mongoose=require("mongoose")
const authController=require("./Controllers/authController")
const session=require("express-session")
const cors=require("cors")
const passport=require("passport")
const oauthController=require("./Controllers/oauthRoutes")
dotenv.config();
app.use(express.json())
mongoose.connect(process.env.USERS_DB)
.then(console.log("MongoDb connected successfully"))
require("./Controllers/googleAuth")
app.use(cors())
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use("/",[authController,oauthController])

app.listen(process.env.AUTH_SERVICE_PORT,()=>{
    console.log(`Server running on port ${process.env.AUTH_SERVICE_PORT}`)
})