const { ObjectId } = require("mongodb");
const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users")
const favUserCollection = mongoClient.db("SoulMate").collection("favUser")


//make fav
router.get("/showFlowing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { userId: id };
    const result = await favUserCollection.findOne(query);
    return res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.get("/showFlowers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { "favUser.favId": id };
    const result = await favUserCollection.find(query).toArray();
    return res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.get("/disableFav/:id/:favID", async (req, res) => {
  try {
    const id = req.params.id;
    const favID = req.params.favID;
    const query = { userId: id, "favUser.favId": favID };
    const result = await favUserCollection.findOne(query);
    return res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.post("/setFav/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const projection = {
      _id: 0,
      name: 1,
      profileImage: 1,
    };

    const user = await usersCollection.findOne(query, {
      projection: projection,
    });

    const setFav = req.body;
    const favt = {
      userId: id,
      userName: user.name,
      userImg: user.profileImage,
      favUser: [setFav],
    };
    const result = await favUserCollection.insertOne(favt);
    return res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.put("/makeFav/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const setFav = req.body;
    const query = { userId: id };
    const existResult = await favUserCollection.findOne(query);
    existResult.favUser.push(setFav);

    const filter = { userId: id };
    const option = { upsert: true };
    const setCls = {
      $set: {
        favUser: existResult.favUser,
      },
    };

    const result = await favUserCollection.updateOne(filter, setCls, option);
    res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

router.put("/makeUnfollow/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const unfollow = req.body;
    const filter = { userId: id };
    const option = { upsert: true };
    const setCls = {
      $pull: {
        favUser: unfollow,
      },
    };
    const result = await favUserCollection.updateOne(filter, setCls, option);
    res.send(result);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;