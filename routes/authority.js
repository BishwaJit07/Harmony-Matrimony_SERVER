const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");
const authorityCollection = mongoClient.db("SoulMate").collection("authority");


router.post("/authority", async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };

    const excitingUser = await authorityCollection.findOne(query);

    if (excitingUser) {
      return res.send({ message: "user exists" });
    }
    const result = await authorityCollection.insertOne(user);
    return res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/authority", async (req, res) => {
  try {
    const search = req.query.search;
    const query = { name: { $regex: search, $options: "i" } };
    const result = await authorityCollection.find(query).toArray();
    return res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/profileData/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const filter = { email: email };
    const result = await authorityCollection.findOne(filter);
    return res.send(result)
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
})
router.delete('/deleteUser/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(filter);
    return res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});
router.patch("/makerouterrove/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        status: "routerroved",
      },
    };
    const result = await authorityCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});
router.patch("/makeDenied/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        status: "denied",
      },
    };
    const result = await authorityCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.get("/profileData/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const filter = { email: email };
    const result = await authorityCollection.findOne(filter);
    return res.send(result);
  }

  catch (err) {res.status(500).json(err)}

});

module.exports = router;