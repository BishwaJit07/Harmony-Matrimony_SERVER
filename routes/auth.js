const express = require('express');
const jwt = require('jsonwebtoken');
const secretKey = process.env.ACCESS_TOKEN_SECRET;
const { mongoClient } = require('../mongodbConnection');
const authorityCollection = mongoClient.db("SoulMate").collection("authority");


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: true, message: 'Unauthorized access' });
    }
    // Bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: true, message: 'Unauthorized access' });
        }
        req.decoded = decoded;
        next();
    });
};


// Admin Middleware to check if the user is an admin
const verifyAdmin = async(req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await authorityCollection.findOne(query);
    if (user?.role !== "admin" && user?.status !== "approved") {
        return res
            .status(403)
            .send({ error: true, message: "forbidden message" });
    }
    next();
};


// Support Middleware to check if the user is an instructor
const verifySupport = async(req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await authorityCollection.findOne(query);
    if (user?.role !== "support" && user?.status !== "approved") {
        return res
            .status(403)
            .send({ error: true, message: "forbidden message" });
    }
    next();
};

module.exports = { verifyJWT , verifyAdmin , verifySupport };
