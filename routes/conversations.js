const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");


// new con
router.post("/", async (req, res) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    })


    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation)
    } catch (err) {
        res.status(500).json(err)
    }
})
//get con
router.get("/:userId", async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in:[req.params.userId]},
        })
        res.status(200).json(conversation)
    }
    catch (err) {
        res.status(500).json(err)
    }
})

// Route to find or create a conversation
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
      // Try to find an existing conversation with the specified members
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
  
      if (conversation) {
        // If an existing conversation is found, send it as a JSON response
        res.status(200).json(conversation);
      } else {
        // If no conversation is found, create a new conversation and save it to the database
        const newConversation = new Conversation({
          members: [req.params.firstUserId, req.params.secondUserId],
        });
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
      }
    } catch (err) {
      // Handle any errors that occur during the process
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
