const express = require("express");
const router = express.Router();
const Message = require("../Models/Message");
const NodeCache = require("node-cache");

const caching = new NodeCache({ stdTTL: 60 }); // 1 min cache

// ==============================
// ADD MULTIPLE MESSAGES
// ==============================
router.post("/add", async (req, res) => {
  try {
    const messages = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array required" });
    }

    await Message.insertMany(messages);

    // Invalidate cache for this user (messages[0] exists for sure)
    const userId = messages[0].userId;
    caching.del(`messages${userId}`);

    res.status(201).json({ message: "Messages added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// READ MESSAGES (WITH CACHE)
// ==============================
router.get("/read", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    // Try cache
    const messageCache = caching.get(`messages${userId}`);
    if (messageCache) {
      return res.status(200).json({
        source: "cache",
        data: messageCache
      });
    }

    // Fetch from DB
    const messages = await Message.find({ userId }).sort({ createdAt: 1 });

    // Cache plain objects (faster & safer)
    const plainMessages = messages.map(m => m.toObject());
    caching.set(`messages${userId}`, plainMessages);

    res.status(200).json({ source: "db", data: plainMessages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
});

// ==============================
// DELETE ALL MESSAGES OF A USER
// ==============================
router.delete("/delete", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const result = await Message.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No messages found to delete" });
    }

    // Clear cache
    caching.del(`messages${userId}`);

    res.status(200).json({ message: "Messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
});

module.exports = router;
