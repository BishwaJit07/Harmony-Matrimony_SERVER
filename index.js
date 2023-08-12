const express = require('express');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// mongo db 

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://SoulMate-Matrimony:ksfIn7UGTTU4vOYq@cluster0.gq6gqcm.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("SoulMate-Matrimony").collection("users");
const coupleCollection = client.db("SoulMate-Matrimony").collection("CoupleData");
 


//user get point
 app.get("/users", async (req, res) => {
        const result = await usersCollection.find().toArray();
        return res.send(result);
      });

pp.post("/users",  async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
  
        const excitingUser = await usersCollection.findOne(query);
        console.log("existing User", excitingUser);
  
        if (excitingUser) {
          return res.send({ message: "user exists" });
        }
        const result = await usersCollection.insertOne(user);
        return res.send(result);
      });


 app.get("/allCouple", async (req, res) => {
        const result = await coupleCollection.find().toArray();
        return res.send(result);
      });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  
 catch (error) {
  console.error("MongoDB connection error:", error);
}
  
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



//server get point
app.get("/", (req, res) => {
  res.send("Soulmate matrimony runnng");
});

app.listen(port, () => {
  console.log(`SoulMate listening on port ${port}`);
});
