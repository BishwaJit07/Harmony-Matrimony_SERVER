const express = require('express');
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken')
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "access unauthorized" });
  }
  //jwt token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JwtAccess_Token, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .send({ error: true, message: "access unauthorized" });
    }
    req.decoded = decoded;
    next();
  });
};

// mongo db 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.pmqtpdf.mongodb.net/?retryWrites=true&w=majority`;

// make a .env file and put this there - 

// DB_User = SoulMate-Matrimony
// DB_Pass = LV2hgni1aq9w6d5H


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
    // await client.connect();

    const usersCollection = client.db("SoulMate-Matrimony").collection("users");
    const coupleCollection = client.db("SoulMate-Matrimony").collection("CoupleData");
    const blogsCollection = client.db("SoulMate-Matrimony").collection("blogs");
    const contactCollection = client.db("SoulMate-Matrimony").collection("contacts");
    const serviceCollection = client.db("SoulMate-Matrimony").collection("services");
    // JWt 
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res.send({ jwtToken });
    });

    // jwt user  verification
    app.get('/allUser/admin/:email',verifyJwt, async(req,res)=>{
      const email = req.params.email;

      if(req.decoded.email!== email){
        res.send({admin:false})
      }

      const query = {email:email}
      const user = await usersCollection.findOne(query);
      const result = {admin:user?.role==='admin'}
      res.send(result)
    })

    app.get('/allUser/instructor/:email', verifyJwt, async(req,res)=>{
      const email = req.params.email;
      const query = {email:email}
      const user = await usersCollection.findOne(query);
      const result = {instructor:user?.role1==='instructor'}
      res.send(result)
    })

    //user get point
     app.get("/allUser", async (req, res) => {
            const result = await usersCollection.find().toArray();
            return res.send(result);
          });

          app.get("/specificUser/:id", async (req, res) => {
            const id= req.params.id;
            const query = {_id: new ObjectId(id)}
           const result = await usersCollection.findOne(query);
           return res.send(result);
         });

    app.post("/allUser",  async (req, res) => {
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
            const id= req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await coupleCollection.findOne(query);
            res.send(result)
          })

    app.post('/contact', async(req, res) => {
      const contactData = req.body
      const result = await contactCollection.insertOne(contactData)
      res.send(result)
    })

    // get services data
    app.get('/service/photography', async(req, res) => {
      const query = { category: "photography" };
      const result = await serviceCollection.find(query).toArray()
      res.send(result)
    })

    
         
        

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
            const id= req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await blogsCollection.findOne(query);
            res.send(result)
          })

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
