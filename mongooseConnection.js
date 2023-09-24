
const mongoose = require('mongoose');
require("dotenv").config();

const mongoUri = process.env.MONGO_URL;


mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB using Mongoose');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB using Mongoose:', error);
  });


module.exports.db = mongoose.connection;