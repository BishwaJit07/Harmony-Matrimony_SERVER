//  user review
const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const reviewCollection = mongoClient.db("SoulMate").collection("review");



router.get("/reviews", async (req, res) => {
    try {
        const result = await reviewCollection.find().toArray();
        return res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post("/reviews", async (req, res) => {
    try{
        const newreview = req.body;
    const result = await reviewCollection.insertOne(newstory);
    return res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;