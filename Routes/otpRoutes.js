const nodemailer = require('nodemailer');
const dotenv=require("dotenv")
const express=require("express")
const app=express()
const User=require("../Models/Account")
const Otp = require('../Models/Otp');
dotenv.config()


// Nodemailer transporter equivalent to your Spring Boot config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',     // spring.mail.host
  port: 587,                  // spring.mail.port
  secure: false,              // false for STARTTLS (TLS)
  auth: {
    user: process.env.email,   // spring.mail.username
    pass: process.env.pass,         // spring.mail.password (App Password)
  },
  requireTLS:true,
  tls: {
    rejectUnauthorized: false          // allows self-signed certs, optional
  }
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP ready to send emails");
  }
});
// Example function to send email
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"Smart Expense Tracker" <allatrivikram@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
function generateOtp(){
    return Math.floor(100000+Math.random()*90000)
}

// Example usage


//Otp route
app.post("/sendotp",async(req,res)=>{
  try {
    const {email}=req.body;
    
    const user=await User.findOne({email:email})
    if(!user){
      return res.status(404).json({"message":"Invalid email id"});
    }
    const otp=generateOtp();
    sendMail(
      email,
      'Forget password',
      'Enter this otp to verify your email to change password',
      `${otp}`
    );
    const otpMod=new Otp({otp:otp});
    await otpMod.save();
    res.status(201).json({"message":"Otp sent to your email address","userId":user._id})
  } catch (error) {
    res.status(500).json({"message":"Something went wrong"})
  }
})
app.post("/validateotp",async(req,res)=>{
  try {
    const {otp}=req.body;
   
    const validateOtp=await Otp.findOne({otp:otp})
    if(!validateOtp){
      return res.status(400).json({"message":"Invalid otp"})
    }
    res.status(200).json({"message":"Otp validated"});
  } catch (error) {
    res.status(500).json({"message":"Something went wrong"})
  }
})
module.exports=app
