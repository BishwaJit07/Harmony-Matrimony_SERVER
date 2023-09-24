const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");


//get all user
router.get("/allUser", async (req, res) => {

  try {
    const projection = {
      name: 1,
      email: 1,
      profile_complete: 1,
      profileVisit: 1,
      age: 1,
      state: 1,
      weight: 1,
      jobSector: 1,
    };
    const result = await usersCollection.find({}, {projection: projection }).toArray();    
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/specificUser/:id", async (req, res) => {
  
  try{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.findOne(query);
  return res.send(result);
  }
  catch (err) {res.status(500).json(err)}
});


router.get("/allUserGender/:gender", async (req, res) => {

  try {
    const requestedGender = req.params.gender;
    const oppositeGender = requestedGender === 'Male' ? 'Female' : 'Male';
    // Use $in operator to query for both genders
    const query = { gender: { $in: [oppositeGender] } };
     const projection = {
      name: 1,
      email: 1,
      profile_complete: 1,
      profileVisit: 1,
      age: 1,
      state: 1,
      weight: 1,
      jobSector: 1,
      country: 1,
      profileImage: 1,
      height: 1,
      work: 1,
      marital_status: 1,
      religion: 1,
      aboutMe: 1,
    };
    const result = await usersCollection.find(query,{projection: projection }).toArray();
    
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/specificUser/:id", async (req, res) => {

  try{
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.findOne(query);
  return res.send(result);
  }
  catch (err) {res.status(500).json(err)}
});

router.post("/allUser", async (req, res) => {
  try{
    const user = req.body;
  const query = { email: user.email };

  const excitingUser = await usersCollection.findOne(query);

  if (excitingUser) {
    return res.send({ message: "user exists" });
  }
  const result = await usersCollection.insertOne(user);
  return res.send(result);
  }
  catch (err) {res.status(500).json(err)}
});


router.patch('/userVerify/:email', async (req, res) => {
  try{
    const email = req.params.email;
  const query = { email: email };

  const updateDoc = {
    $set: {
      profile_complete: 100,
    },
  };
  const result = await usersCollection.updateOne(query, updateDoc);
  res.send(result);
  }
  catch (err) {res.status(500).json(err)}

})


router.put('/userCancle/:email', async (req, res) => {
  try{
    const email = req.params.email;
    const query = { email: email };
    const updateDoc = {
      $set: {
        verify: 'blocked',
      },
    };
    const result = await usersCollection.updateOne(query, updateDoc);
    res.send(result);
  
  }
  catch (err) {res.status(500).json(err)}
});

//user plan set
router.get("/userPlan", async (req, res) => {
  try{
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
  
    const query = { email: email };
    const result = await usersCollection.findOne(query);
  
    if (!result) {
      return res.status(404).json({ error: "User not found." });
    }
  
    const planData = {
      userEmail: result.email,
      userPlan: result.plan,
      profileVisit: result.profileVisit,
    };
  
    res.send(planData);
  }
  catch (err) {res.status(500).json(err)}
});

router.post('/galleryImg', async(req, res) => {
  try{
    const {img, userId} = req.body
    const result = await usersCollection.updateOne(
      {_id: new ObjectId(userId)},
      {
        $addToSet: {gallery: img}
      }
    )
    res.send(result)
  }
  catch (err){ 
    res.status(500).json(err)
  }
})

module.exports = router;