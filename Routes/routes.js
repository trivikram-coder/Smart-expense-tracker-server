const Expenses=require("../Models/Expenses")
const express=require("express")
const Message=require("../Models/Message")
const app=express()
app.post('/add',async(req,res)=>{
    try {
        const message=req.body.message.toLowerCase();
        const amountsMatch=message.match(/\d+/)
        const amount=amountsMatch?parseInt(amountsMatch[0]):0;
     
        res.status(200).json({"message":amount})
    } catch (error) {
        res.status(400).json({"message":"Error"})
    }
})
module.exports=app