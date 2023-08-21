const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// mongo db

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.pmqtpdf.mongodb.net/?retryWrites=true&w=majority`;

// make a .env file and put this there -

// DB_User = SoulMate-Matrimony
// DB_Pass = LV2hgni1aq9w6d5H
// ACCESS_TOKEN_SECRET = 85cb704d0594706c59a8ce4c369af0c8dc6740b0053052e47e20b33775fc78b2d6583a29f44bae285e03bf2e0a7fa81db861441961df8eb5cc5d0fd46028bb88

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("SoulMate-Matrimony").collection("users");
    const coupleCollection = client
      .db("SoulMate-Matrimony")
      .collection("CoupleData");
    const blogsCollection = client.db("SoulMate-Matrimony").collection("blogs");
    const contactCollection = client
      .db("SoulMate-Matrimony")
      .collection("contacts");
    const serviceCollection = client
      .db("SoulMate-Matrimony")
      .collection("services");
    const statusCollection = client
      .db("SoulMate-Matrimony")
      .collection("statusPost");

    // JWt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res.send({ token });
    });

    // admin middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res
          .status(403)
          .send({ error: true, message: "forbidden message" });
      }
      next();
    };
    // app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
    //   const result = await userCollection.find().toArray();
    //   res.send(result)
    // })

    // instructor middleware
    const verifyInstructor = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "instructor") {
        return res
          .status(403)
          .send({ error: true, message: "forbidden message" });
      }
      next();
    };

    //admin verification
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // check Instructor
    app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ instructor: false });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "instructor" };
      res.send(result);
    });

    app.get('/userInfo', verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email)
      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'invalid email' })
      }
      const query = { email: email }
      const result = await usersCollection.findOne(query);
      res.send(result) 
    })

    //user get point
    app.get("/allUser", async (req, res) => {
      const result = await usersCollection.find().toArray();
      return res.send(result);
    });

    app.get("/specificUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      return res.send(result);
    });

    app.post("/allUser", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };

      const excitingUser = await usersCollection.findOne(query);

      if (excitingUser) {
        return res.send({ message: "user exists" });
      }
      const result = await usersCollection.insertOne(user);
      return res.send(result);
    });

    //Couples related api

    app.get("/allCouple", async (req, res) => {
      const result = await coupleCollection.find().toArray();
      return res.send(result);
    });

    app.post("/allCouple", async (req, res) => {
      const newstory = req.body;
      console.log(newstory);
      const result = await coupleCollection.insertOne(newstory);
      return res.send(result);
    });
    app.get("/allCouple/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coupleCollection.findOne(query);
      res.send(result);
    });

    app.post("/contact", async (req, res) => {
      const contactData = req.body;
      const result = await contactCollection.insertOne(contactData);
      res.send(result);
    });

    // get photography services data
    app.get("/service/photography", async (req, res) => {
      const query = { category: "photography" };
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/service/hotel", async (req, res) => {
      const query = { category: "hotel" };
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/service/catering", async (req, res) => {
      const query = { category: "catering" };
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    });

    //blogs related api

    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      return res.send(result);
    });

    app.post("/blogs", async (req, res) => {
      const newBlogs = req.body;
      console.log(newBlogs);
      const result = await blogsCollection.insertOne(newBlogs);
      return res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    //user status post
    app.get("/statusPosts", async (req, res) => {
      let query = {};
      sortBy = { _id: -1 };
      if (req.query?.user) {
        query = { userId: req.query.user };
      }
      const result = await statusCollection.find(query).sort(sortBy).toArray();
      return res.send(result);
    });

    app.post("/statusPost", async (req, res) => {
      const newStatus = req.body;
      const result = await statusCollection.insertOne(newStatus);
      return res.send(result);
    });

    app.delete("/statusPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const status = await statusCollection.deleteOne(query);
      res.send(status);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//server get point
app.get("/", (req, res) => {
  res.send("Soulmate matrimony running");
});

app.listen(port, () => {
  console.log(`SoulMate listening on port ${port}`);
});
