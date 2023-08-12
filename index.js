const express = require("express");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const userData = require("./data/user.json");
const coupleData = require("./data/couple.json");

//user get point
app.get("/allUser", (req, res) => {
  res.send(userData);
});

app.get("/allCouple", (req, res) => {
  res.send(coupleData);
});

//server get point
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
