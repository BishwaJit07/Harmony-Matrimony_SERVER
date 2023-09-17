const { ObjectId } = require("mongodb");
const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users")
const meetCollection = mongoClient.db("SoulMate").collection("setMeeting")


//get partnerData
async function getInfoData(paramQurey, userInfo) {
    const result = await meetCollection.find(paramQurey).toArray();
    const partnerUserData = [];
    const userProjection = {
        _id: 1,
        name: 1,
        profileImage: 1,
    };

    for (const part of result) {
        let partnerId;
        if (userInfo === "user") {
            partnerId = new ObjectId(part.partner);
        } else {
            partnerId = new ObjectId(part.userId);
        }

        const userQuery = { _id: partnerId };
        const userData = await usersCollection.findOne(userQuery, {
            projection: userProjection,
        });

        if (userData) {
            userData.metId = part._id;
            userData.metDate = part.metDate;
            userData.setBy = part.setBy;
            partnerUserData.push(userData);
        }
    }
    return partnerUserData;
}


//new polis & poposal handle
async function handleStatusUpdate(req, res, status) {
    const id = req.params.id;
    const userQuery = { userId: id, status: status };
    const partnerQuery = { partner: id, status: status };
    const userResult = await getInfoData(userQuery, "user");
    const partnerResult = await getInfoData(partnerQuery, "partner");
    const result = userResult.concat(partnerResult);
    res.send(result);
}

async function handleMetStatus(req, res) {
    const id = req.params.id;
    const detMet = req.body;
    const filter = { _id: new ObjectId(id) };
    const option = { upsert: true };
    let setCls = {};
    if (detMet.setby) {
        setCls = {
            $set: {
                setBy: detMet.setby,
                status: detMet.status,
            },
        };
    } else {
        setCls = {
            $set: {
                status: detMet.status,
            },
        };
    }

    const result = await meetCollection.updateOne(filter, setCls, option);
    return result;
}

async function findUserData(data) {
    const usersProjection = {
        _id: 1,
        name: 1,
        email: 1,
        mobile: 1,
        country: 1,
    };

    const user = await usersCollection.findOne(
        { _id: new ObjectId(data.userId) },
        {
            projection: usersProjection,
        }
    );
    const partner = await usersCollection.findOne(
        { _id: new ObjectId(data.partner) },
        {
            projection: usersProjection,
        }
    );

    let couple = {};
    couple.partner1 = user;
    couple.partner2 = partner;
    couple.issueDate = new Date();
    couple.status = "pending";

    return await setCoupleCollection.insertOne(couple);
}

async function updateUserStatus(userId) {
    const filter = { _id: new ObjectId(userId) };
    const option = { upsert: true };
    const setCls = {
        $set: {
            status: "pending",
        },
    };

    return await usersCollection.updateOne(filter, setCls, option);
}

//set meeting
router.get("/userPlanInfo", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            res.send([]);
        }
        const query = { email: email };
        const projection = {
            _id: 1,
            name: 1,
            age: 1,
            email: 1,
            profileVisit: 1,
            plan: 1,
            expire: 1,
        };

        const result = await usersCollection.findOne(query, {
            projection: projection,
        });
        res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});

router.post("/setMeeting", async (req, res) => {
    try {
        const setMet = req.body;
        const result = await meetCollection.insertOne(setMet);
        return res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});


router.get("/sendReqPending/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { userId: id, status: "pending" };
        const result = await getInfoData(query, "user");
        res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});

router.get("/getReqPending/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { partner: id, status: "pending" };
        const result = await getInfoData(query, "partner");
        res.send(result);
    }
    catch (err) {
        res.status(500).json(err)
    }
});



router.get("/reqAccept/:id", async (req, res) => {
    try { await handleStatusUpdate(req, res, "accept") }
    catch (err) { res.status(500).json(err) }
});

router.get("/getProposal/:id", async (req, res) => {
    try { await handleStatusUpdate(req, res, "proposed") }
    catch (err) { res.status(500).json(err) }
});

router.get("/getAccept/:id", async (req, res) => {
    try { await handleStatusUpdate(req, res, "proposal accept") }
    catch (err) { res.status(500).json(err) }
});

router.get("/getReject/:id", async (req, res) => {
    try { await handleStatusUpdate(req, res, "proposal reject"); }
    catch (err) { res.status(500).json(err) }
});



router.put("/deleteMet/:id", async (req, res) => {
    try {
        const result = await handleMetStatus(req, res);
        res.send(result);
    }
    catch (err) { res.status(500).json(err) }
});

router.put("/setProposal/:id", async (req, res) => {
    try {
        const result = await handleMetStatus(req, res);
        res.send(result);
    }
    catch (err) { res.status(500).json(err) }
});


router.put("/acceptMet/:id", async (req, res) => {
    try{
        const id = req.params.id;
    const result = await handleMetStatus(req, res);
    if (result.modifiedCount > 0) {
        const query = { _id: new ObjectId(id) };
        const projection = {
            userId: 1,
            partner: 1,
            metDate: 1,
        };

        const metData = await meetCollection.findOne(query, {
            projection: projection,
        });

        const coupleResult = await findUserData(metData);

        if (coupleResult.insertedId) {
            await updateUserStatus(metData.userId);
            await updateUserStatus(metData.partner);
        }
    }
    res.send(result);
    }
    catch (err) {res.status(500).json(err)}
});

module.exports = router;