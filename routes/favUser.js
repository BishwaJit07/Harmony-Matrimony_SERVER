const { ObjectId } = require("mongodb");
const express = require("express");
const { mongoClient } = require("../mongodbConnection");
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");
const favUserCollection = mongoClient.db("SoulMate").collection("favUser");
const relationCollection = mongoClient.db("SoulMate").collection("setRetation");

//make fav

async function findDataInfo(req) {
  const id = req.params.id;
  const body = req.body;
  const query = { _id: new ObjectId(id) };
  const projection = {
    _id: 0,
    name: 1,
    profileImage: 1,
  };

  const user = await usersCollection.findOne(query, {
    projection: projection,
  });

  const favt = {
    userId: id,
    userName: user.name,
    userImg: user.profileImage,
    favUser: [body],
  };

  return favt;
}

async function setPerson(req, collection) {
  const id = req.params.id;
  const body = req.body;
  const query = { userId: id };
  const existResult = await collection.findOne(query);
  existResult.favUser.push(body);

  const filter = { userId: id };
  const option = { upsert: true };
  const setCls = {
    $set: {
      favUser: existResult.favUser,
    },
  };

  const result = await collection.updateOne(filter, setCls, option);
  return result;
}

async function disableItem(id, itemId, res, collectionName) {
  try {
    const query = { userId: id, "favUser.favId": itemId };
    const result = await collectionName.findOne(query);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function delUpdateCollection(req, res, collectionName) {
  try {
    const id = req.params.id;
    const data = req.body;
    const filter = { userId: id };
    const option = { upsert: true };
    const setCls = {
      $pull: {
        favUser: data,
      },
    };

    const result = await collectionName.updateOne(filter, setCls, option);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function findReqCollection(req, res, collectionName) {
  const projection = {
    _id: 1,
    userId: 1,
    userName: 1,
    userImg: 1,
  };
  try {
    const id = req.params.id;
    const query = { "favUser.favId": id };
    const result = await collectionName
      .find(query, {
        projection: projection,
      })
      .toArray();
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
}

router.get("/showFlowing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { userId: id };
    const result = await favUserCollection.findOne(query);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/showFlowers/:id", async (req, res) => {
  await findReqCollection(req, res, favUserCollection);
});

router.get("/disableFav/:id/:favID", async (req, res) => {
  const id = req.params.id;
  const favID = req.params.favID;
  await disableItem(id, favID, res, favUserCollection);
});

router.post("/setFav/:id", async (req, res) => {
  try {
    const favt = await findDataInfo(req);
    const result = await favUserCollection.insertOne(favt);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/makeFav/:id", async (req, res) => {
  try {
    const result = await setPerson(req, favUserCollection);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/makeUnfollow/:id", async (req, res) => {
  await delUpdateCollection(req, res, favUserCollection);
});

//set relation

router.get("/showRelation/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { userId: id };
    const result = await relationCollection.findOne(query);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/disableRltn/:id/:rtlnID", async (req, res) => {
  const id = req.params.id;
  const rtlnID = req.params.rtlnID;
  await disableItem(id, rtlnID, res, relationCollection);
});

router.get("/shwGetReqRltn/:id", async (req, res) => {
  await findReqCollection(req, res, relationCollection);
});

router.post("/setReqRelation/:id", async (req, res) => {
  try {
    const relation = await findDataInfo(req);
    const result = await relationCollection.insertOne(relation);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/takeRltnPsn/:id", async (req, res) => {
  try {
    const result = await setPerson(req, relationCollection);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/delRltn/:id", async (req, res) => {
  await delUpdateCollection(req, res, relationCollection);
});

module.exports = router;
