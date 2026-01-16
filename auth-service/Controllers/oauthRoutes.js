const express=require("express")
const router=express().router
const passport = require("passport")
const Account=require("../Models/Account")

router.get("/google",(req,res)=>{
    res.send("<button><a href='/google/login'>signin with google</a></button>")
})
router.get("/google/login",
    passport.authenticate("google",{scope:["profile","email"]})
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google/failure"
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}?userId=${req.user._id}`)
  }
);

router.get('/google/failure',(req,res)=>{
    res.json({message:"Google login failed"})
})
module.exports=router