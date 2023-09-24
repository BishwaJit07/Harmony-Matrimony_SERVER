const { ObjectId } = require("mongodb");
const express = require("express");
const { mongoClient } = require("../mongodbConnection");
const router = express.Router();
const setCoupleCollection = mongoClient.db("SoulMate").collection("setCouple");
const relationCollection = mongoClient.db("SoulMate").collection("setRetation");
const {
  findDataInfo,
  setPerson,
  disableItem,
  findReqCollection,
  delUpdateCollection,
} = require("./favUser");

const { updateUserStatus } = require("./meet");

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

router.post("/setCouple", async (req, res) => {
  try {
    const couple = req.body;
    const coupleResult = await findUserData(couple);

    if (coupleResult.insertedId) {
      await updateUserStatus(couple.userId, "Married", "successful");
      await updateUserStatus(couple.partner, "Married", "successful");
      res.send(coupleResult);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/showPartner/:id", async (req, res) => {
  try {
    let projection = {};
    const id = req.params.id;
    projection = {
      _id: 1,
      partner2: 1,
      issueDate: 1,
    };
    const query = { "partner1._id": new ObjectId(id), status: "successful" };
    const result = await setCoupleCollection
      .find(query, {
        projection: projection,
      })
      .toArray();

    if (result.length > 0) {
      return res.send(result);
    } else {
      projection = {
        _id: 1,
        partner1: 1,
        issueDate: 1,
      };
      const query = { "partner2._id": new ObjectId(id), status: "successful" };
      const result = await setCoupleCollection
        .find(query, {
          projection: projection,
        })
        .toArray();
      return res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/delPartner/:id/:user/:partner", async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.params.user;
    const partner = req.params.partner;

    await updateUserStatus(user, "Single", "breakup");
    await updateUserStatus(partner, "Single", "breakup");

    const filter = { _id: new ObjectId(id) };
    const result = await setCoupleCollection.deleteOne(filter);
    return res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
