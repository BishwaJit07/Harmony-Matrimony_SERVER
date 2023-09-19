const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const serviceCollection = mongoClient.db("SoulMate").collection("services");
const bookedServiceCollection = mongoClient.db("SoulMate").collection("bookedService");


// get photography services data
router.get("/service/photography", async (req, res) => {

    console.log("function is here ")

    try {
        const query = { category: "photography" };
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });

        console.log("function is here ")
    }
});

router.get("/service/hotel", async (req, res) => {
    try {
        const query = { category: "hotel" };
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get("/service/catering", async (req, res) => {
    try {
        const query = { category: "catering" };
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// get single service data
router.get("/service/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await serviceCollection.findOne(query);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// post user booked service data
router.post("/bookedService", async (req, res) => {
    try {
        const serviceData = req.body;
        const result = await bookedServiceCollection.insertOne(serviceData);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// post service data
router.post("/service", async (req, res) => {
    try {
        const serviceData = req.body;
        const result = await serviceCollection.insertOne(serviceData);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get("/singleBookedService/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const query = { email: email };
        const result = await bookedServiceCollection.find(query).toArray();
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;