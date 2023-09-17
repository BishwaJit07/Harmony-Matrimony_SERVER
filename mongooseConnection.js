
const mongoose = require('mongoose');
require("dotenv").config();
// Connection URI for your MongoDB database
const mongoUri = process.env.MONGO_URL;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB using Mongoose');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB using Mongoose:', error);
  });

// Export the Mongoose connection
module.exports = mongoose;
