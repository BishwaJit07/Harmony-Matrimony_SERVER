const { verifyJWT, verifyAdmin, verifySupport } = require('./auth');
const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");
const authorityCollection = mongoClient.db("SoulMate").collection("authority");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.post("/jwt", (req, res) => {
    
    try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "24h",
        });
        res.send({ token });
    }
    catch (err) { res.status(500).json(err) }
});


router.get("/users/admin/:email" ,verifyJWT,  async (req, res) => {

    try {
        const email = req.params.email;
        if (req.decoded.email !== email) {
            res.send({ admin: false });
        }
        const query = { email: email };
        const user = await authorityCollection.findOne(query);

        const result = {
            match: user?.role === "admin" && user?.status === "approved" 
        };

        res.send(result);
    }
    catch (err) { res.status(500).json(err) }
});

// check Support 
router.get("/users/support/:email", verifyJWT, async (req, res) => {
   try{
    const email = req.params.email;

    if (req.decoded.email !== email) {
        res.send({ admin: false });
    }
    const query = { email: email };
    const user = await authorityCollection.findOne(query);
    const result = {
        match: user?.role === "support" && user?.status === "approved" 
    };

    res.send(result);
   }
   catch (err) { res.status(500).json(err)}
});

router.get("/userInfo", verifyJWT, async (req, res) => {
    try{
        const email = req.query.email;
    if (!email) {
        res.send([]);
    }
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "invalid email" });
    }
    const query = { email: email };
    const result = await usersCollection.findOne(query);
    res.send(result);
    }
    catch (err) { res.status(500).json(err)}
});

module.exports = router;