const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.MONGO_URL;


const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports.mongoClient = mongoClient;