const Expenses=require("../Models/Expenses")
const express=require("express")
const app=express()
app.post('/add',async(req,res)=>{
    try {
        const expense=new Expenses(req.body)
        await expense.save()
        res.status(201).json({"message":"Your expense added successfully"})
    } catch (error) {
        res.status(400).json({"message":"Something went wrong"})
    }
})
app.get('/transactions',async(req,res)=>{
    try {
        const expenses=await Expenses.find();
        res.status(200).json(expenses)
    } catch (error) {
        res.status(400).json({"message":"Something went wrong"})
    }
})
module.exports=app