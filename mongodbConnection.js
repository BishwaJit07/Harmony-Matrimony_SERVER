const { MongoClient ,  ServerApiVersion } = require('mongodb');
require("dotenv").config();
// Connection URI for your MongoDB database
const mongoUri = process.env.MONGO_URL;

// Create a MongoDB client
const mongoClient = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// Connect to MongoDB using the native driver
async function connectMongoClient() {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB using the native driver');
  } catch (error) {
    console.error('Error connecting to MongoDB using the native driver:', error);
  }
}

// Export the MongoDB client and the connect function
module.exports = { mongoClient, connectMongoClient };