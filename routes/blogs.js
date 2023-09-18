const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const blogsCollection = mongoClient.db("SoulMate").collection("blogs");


router.get("/blogs", async (req, res) => {
  try {
    const result = await blogsCollection.find().toArray();
    return res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post("/blogs", async (req, res) => {
  try {
    const newBlogs = req.body;
    console.log(newBlogs);
    const result = await blogsCollection.insertOne(newBlogs);
    return res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.findOne(query);
    res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch("/blogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $inc: {
        react: 1,
      },
    };
    const result = await blogsCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/blogsDetails/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.findOne(query);
    res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/blogs/type/:type", async (req, res) => {
  try {
    const type = req.params.type;
    const filter = { type: type };
    const result = await blogsCollection.find(filter).toArray();
    res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/popularBlog", async (req, res) => {
  try {
    const query = {};
    const options = {
      sort: { react: -1 },
    };
    const result = await blogsCollection.find(query, options).toArray();
    return res.send(result);
  } catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/blogsLatest", async (req, res) => {
  try {
    const query = {};
    sortBy = { _id: -1 };
    const result = await blogsCollection.find(query).sort(sortBy).toArray();
    return res.send(result);
  } catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch("/blogss/:id", async (req, res) => {
  try{
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $inc: {
        react: -1,
      },
    };
    const result = await blogsCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
}
});

module.exports = router;