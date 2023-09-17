const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const coupleCollection = mongoClient.db("SoulMate").collection("CoupleData");

//Couples related api

router.get("/allCouple", async (req, res) => {
    try {
        const result = await coupleCollection.find().toArray();
        return res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});

router.post("/allCouple", async (req, res) => {
    try {
        const newStory = req.body;
        const result = await coupleCollection.insertOne(newStory);
        return res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});
router.get("/allCouple/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coupleCollection.findOne(query);
        res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router;