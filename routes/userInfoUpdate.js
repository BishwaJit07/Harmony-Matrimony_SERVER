const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
const usersCollection = mongoClient.db("SoulMate").collection("users");

// MongoDB Route
router.get('/mongodb-users', async (req, res) => {
    try {
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



//update user data
router.put("/update1", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc = {
            $set: {
                profile_complete: updateInfo.profile_complete,
                mobile: updateInfo.mobile,
                age: updateInfo.age,
                height: updateInfo.height,
                weight: updateInfo.weight,
                marital_status: updateInfo.marital_Status,
                gender: updateInfo.gender,
                religion: updateInfo.religion,
                profile: updateInfo.profileFor,
                country: updateInfo.country,
                state: updateInfo.state,
                city: updateInfo?.city,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateDoc, options);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


//update user data
router.put("/update2", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc = {
            $set: {
                profile_complete: updateInfo.profile_complete,
                education: updateInfo.education,
                qualifications: updateInfo.qualifications,
                work: updateInfo.workingIn,
                jobSector: updateInfo.jobSector,
                yearlyIncome: updateInfo.salary,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateDoc, options);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put("/update3", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc = {
            $set: {
                profile_complete: updateInfo.profile_complete,
                religionValue: updateInfo.religionValue,
                foodHabit: updateInfo.foodHabit,
                smokingHabit: updateInfo.smokingHabit,
                drinkHabit: updateInfo.drinkHabit,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateDoc, options);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put("/update4", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc = {
            $set: {
                profile_complete: updateInfo.profile_complete,
                profileImage: updateInfo.profileImage,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateDoc, options);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.put("/update5", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc = {
            $set: {
                profile_complete: updateInfo.profile_complete,
                aboutMe: updateInfo.aboutMe,
                interests: updateInfo.hobbies,
            },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateDoc, options);
        res.send(result);
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put("/update7", async (req, res) => {
    try {
        const id = req.body.id;
        const query = { _id: new ObjectId(id) };
        const updateInfo = req.body;
        const updateDoc1 = {
            $set: {
                profile_complete: updateInfo.profile_complete,
            },
        };
        const options = { upsert: true };
        const updateProfile_complete = await usersCollection.updateOne(
            query,
            updateDoc1,
            options
        );
        const verifyUser = await userVerification.insertOne(updateInfo);
        res.send({ updateProfile_complete, verifyUser });
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
