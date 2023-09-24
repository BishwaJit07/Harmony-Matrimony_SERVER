const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const conversationRoute = require("./routes/conversations");
const messagesRoute = require("./routes/messages");
const userInfoUpdateRoute = require("./routes/userInfoUpdate");
const serviceRoute = require("./routes/service");
const blogRoute = require("./routes/blogs");
const authorityRoute = require("./routes/authority");

const dashboardCollectionRoute = require("./routes/dashboard");
const favUserRoute = require("./routes/favUser");
const meetRoute = require("./routes/meet");
const otherRoute = require("./routes/other");
const paymentRoute = require("./routes/payment");
const planRoute = require("./routes/plan");
const reviewRoute = require("./routes/review");
const userRoute = require("./routes/user");
const userVerificationRoute = require("./routes/userVerification");
const { connectMongoClient, mongoClient } = require('./mongodbConnection');
const mongoose = require('./mongooseConnection');
connectMongoClient();


// middleware
app.use(cors());
app.use(express.json());
app.use("/conversations", conversationRoute);
app.use("/messages", messagesRoute);
app.use("/", userInfoUpdateRoute);
app.use("/", serviceRoute);
app.use("/", blogRoute);
app.use("/", authorityRoute);

app.use("/", dashboardCollectionRoute);
app.use("/", favUserRoute);
app.use("/", meetRoute);
app.use("/", otherRoute);
app.use("/", paymentRoute);
app.use("/", planRoute);
app.use("/", reviewRoute);
app.use("/", userRoute);
app.use("/", userVerificationRoute);


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.ymw1jdy.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`;


app.get("/", (req, res) => {
  res.send("Soulmate matrimony running");
});

app.listen(port, () => {
  console.log(`SoulMate listening on port ${port}`);
});
