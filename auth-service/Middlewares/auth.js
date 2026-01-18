// middlewares/auth.js
const jwt=require("jsonwebtoken")
require("dotenv").config()
const verifyToken=(req,res,next)=>{
  const header=req.headers.authorization
  if(!header || !header.startsWith("Bearer ")){
    return res.status(401).json({message:"Token is missing"})
  }
  const token=header.split(" ")[1]
  
  try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded;
    next()
  } catch (error) {
    res.status(403).json({message:error.message})
  }
}
module.exports = { verifyToken };
