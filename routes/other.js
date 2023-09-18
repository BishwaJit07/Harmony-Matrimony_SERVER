const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const teamMemberCollection = mongoClient.db("SoulMate").collection("meetourteam");
const userVerification = mongoClient.db("SoulMate").collection("userVerification");
const contactCollection = mongoClient.db("SoulMate").collection("contacts");

//  team Members
router.get("/team", async (req, res) => {
    try {
        const result = await teamMemberCollection.find().toArray();
        return res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});



// verify Related apis

router.get('/verifyUser', async (req, res) => {
    try {
        const result = await userVerification.find().toArray();
        return res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
})


//contact us collection
router.post("/contact", async (req, res) => {
    try {
        const contactData = req.body;
        const result = await contactCollection.insertOne(contactData);
        res.send(result);
    }
    catch(err){
        res.status(500).json(err)
    }
});

module.exports = router;