const express=require("express")
const router=express.Router();
const Message=require("../Models/Message")
const NodeCache=require("node-cache")
const caching=new NodeCache({stdTTL:60});
router.post("/add",async(req,res)=>{
  try {
    const messages=req.body;
    if(!Array.isArray(messages)){
      return res.status(400).json({message:"Messages array required"});
    }
    await Message.insertMany(messages);
    res.status(201).json({message:"Messages added successfully"})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
})
router.get("/read", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }
    const messageCache=caching.get(`messages${userId}`);
    if(messageCache){
      return res.status(200).json({source:"Cache",data:messageCache});
    }

    const messages = await Message.find({ userId }).sort({ date: 1 });
    caching.set(`messages${userId}`,messages);
    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
});
router.delete("/delete",async(req,res)=>{
  try {
    const userId=req.query
    const result = await Message.deleteMany(userId)
    if (result.deletedCount === 0) {
      return res.status(404).json({message: "No messages found to delete"})
    }
    caching.del(`messages${userId}`)
    res.status(200).json({message: "Messages deleted successfully"})
  } catch (error) {
    res.status(500).json({message:"Failed to delete message",error:error.message})
  }
})

module.exports=router