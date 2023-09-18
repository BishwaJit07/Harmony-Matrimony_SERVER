const schedule = require("node-schedule");
const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");

//user plan system


//using node-schedule part
const updateDays = async (filterPlan, increment) => {
    const filter = { plan: filterPlan };
    const option = { upsert: true };
    const setCls = {
        $set: {
            profileVisit: increment,
        },
    };
    const result = await usersCollection.updateMany(filter, setCls, option);
};

const updateMonths = async (planItm) => {
    const currentTime = new Date();
    const query = { plan: planItm, expire: { $lte: currentTime } };
    const objects = await usersCollection.find(query).toArray();

    for (const obj of objects) {
        await usersCollection.updateOne(
            { _id: obj._id },
            { $set: { plan: "free", profileVisit: 50, expire: new Date() } }
        );
    }
};

schedule.scheduleJob("* 1 * * *", async () => {
    await updateDays("lovebirds", 100);
    await updateDays("premium", 100);
    await updateDays("ultimate", 100);

    await updateMonths("lovebirds");
    await updateMonths("premium");
    await updateMonths("ultimate");
});

router.put("/profileVisit", async (req, res) => {
    try{
        const filter = { email: req.query.user };
    const option = { upsert: true };
    const setCls = {
        $inc: {
            profileVisit: -1,
        },
    };

    const result = await usersCollection.updateOne(filter, setCls, option);
    res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;