const express = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.PAYMENT_KEY);
const schedule = require("node-schedule");

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

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.pmqtpdf.mongodb.net/?retryWrites=true&w=majority`;

// make a .env file and put this there -

// DB_User = SoulMate-Matrimony
// DB_Pass = LV2hgni1aq9w6d5H
// ACCESS_TOKEN_SECRET = 85cb704d0594706c59a8ce4c369af0c8dc6740b0053052e47e20b33775fc78b2d6583a29f44bae285e03bf2e0a7fa81db861441961df8eb5cc5d0fd46028bb88
// SSLID=soulm64e6111916384
// SSLPASS=soulm64e6111916384@ssl
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const store_id = process.env.SSLID;
// soulm64e6111916384
const store_passwd = process.env.SSLPASS;
// soulm64e6111916384@ssl
const is_live = false; //true for live, false for sandbox

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    function getCollection(collectionName) {
      return client.db("SoulMate-Matrimony").collection(collectionName);
    }

    const usersCollection = getCollection("users");
    const authorityCollection = getCollection("authority");
    const coupleCollection = getCollection("CoupleData");
    const blogsCollection = getCollection("blogs");
    const userVerification = getCollection("userVerification");
    const bookedServiceCollection = getCollection("bookedService");
    const paymentHistoryCollection = getCollection("paymentHistory");
    const orderCollection = getCollection("order");
    const reviewCollection = getCollection("review");
    const teamMemberCollection = getCollection("meetourteam");
    // JWt
    const contactCollection = getCollection("contacts");
    const serviceCollection = getCollection("services");
    const statusCollection = getCollection("statusPost");
    const meetCollection = getCollection("setMeeting");

    // JWt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res.send({ token });
    });

    // PAYMENT_KEY=sk_test_51Ni8a5GFYl3GiivUgPzTNfNymFHldn7Wbmsgin0vFLUwo1VpXbjHO7DwTod7w77vCEy3HLyj3Mc09MfuN5ereJRZ00AGjsKM6l

    // stripe payment
    app.post("/stripe-payment", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      console.log(price, amount);

      try {
        const paymentIntent = await stripe.paymentIntent.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.log("Error creating payment intent:", error.message);
        res.status(500).json({ error: "Failed to create payment intent" });
      }
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;

      // console.log(price, amount);
      // res.send({
      //   clientSecret: paymentIntent.client_secret,
      // });
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).json({ error: "Failed to create payment intent" });
      }
    });

    // post stripe payment in database
    app.post("/save-payments", async (req, res) => {
      const payment = req.body;
      console.log(payment);
      const result = await paymentHistoryCollection.insertOne(payment);
      res.send(result);
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
      console.log(email);
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

    app.get("/userInfo", verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "invalid email" });
      }
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    //update user data
    app.put("/update1", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      const updateDoc = {
        $set: {
          profile_complete: updateInfo.profile_complete,
          mobile: updateInfo.mobile,
          age: updateInfo.age,
          height: updateInfo.height,
          weight: updateInfo.weight,
          marital_status: updateInfo.maritalStatus,
          gender: updateInfo.gender,
          religion: updateInfo.religion,
          profile: updateInfo.profileFor,
          country: updateInfo.country,
          state: updateInfo.state,
          city: updateInfo?.city,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    //update user data
    app.put("/update2", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      console.log(updateInfo);
      const updateDoc = {
        $set: {
          profile_complete: updateInfo.profile_complete,
          education: updateInfo.education,
          qualifications: updateInfo.qualifications,
          work: updateInfo.workingIn,
          jobSector: updateInfo.jobSector,
          yearlyIncome: updateInfo.salary,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.put("/update3", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      console.log(updateInfo);
      const updateDoc = {
        $set: {
          profile_complete: updateInfo.profile_complete,
          religionValue: updateInfo.religionValue,
          foodHabit: updateInfo.foodHabit,
          smokingHabit: updateInfo.smokingHabit,
          drinkHabit: updateInfo.drinkHabit,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.put("/update4", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      console.log(updateInfo);
      const updateDoc = {
        $set: {
          profile_complete: updateInfo.profile_complete,
          profileImage: updateInfo.profileImage,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
    app.put("/update5", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      const updateDoc = {
        $set: {
          profile_complete: updateInfo.profile_complete,
          aboutMe: updateInfo.aboutMe,
          interests: updateInfo.hobbies,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.put("/update7", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      const updateDoc1 = {
        $set: {
          profile_complete: updateInfo.profile_complete,
        },
      };
      const options = { upsert: true };
      const updateProfile_complete = await usersCollection.updateOne(
        query,
        updateDoc1,
        options
      );
      const verifyUser = await userVerification.insertOne(updateInfo);
      res.send({ updateProfile_complete, verifyUser });
    });

    //get all user
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

    //  team Members
    app.get("/team", async (req, res) => {
      const result = await teamMemberCollection.find().toArray();
      return res.send(result);
    });

    app.post("/authority", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };

      const excitingUser = await authorityCollection.findOne(query);

      if (excitingUser) {
        return res.send({ message: "user exists" });
      }
      const result = await authorityCollection.insertOne(user);
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

    //  user review
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      return res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const newreview = req.body;
      console.log(newreview);
      const result = await reviewCollection.insertOne(newstory);
      return res.send(result);
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
    // get single service data
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    // post user booked service data
    app.post("/bookedService", async (req, res) => {
      const serviceData = req.body;
      const result = await bookedServiceCollection.insertOne(serviceData);
      res.send(result);
    });

    // post service data
    app.post("/service", async (req, res) => {
      const serviceData = req.body;
      const result = await serviceCollection.insertOne(serviceData);
      res.send(result);
    });

    app.get("/singleBookedService/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookedServiceCollection.find(query).toArray();
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

    app.patch("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: {
          react: 1,
        },
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/blogsDetails/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    app.get("/blogs/type/:type", async (req, res) => {
      const type = req.params.type;
      const filter = { type: type };
      const result = await blogsCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/popularBlog", async (req, res) => {
      const query = {};
      const options = {
        sort: { react: -1 },
      };
      const result = await blogsCollection.find(query, options).toArray();
      return res.send(result);
    });

    app.get("/blogsLatest", async (req, res) => {
      const query = {};
      sortBy = { _id: -1 };
      const result = await blogsCollection.find(query).sort(sortBy).toArray();
      return res.send(result);
    });

    app.patch("/blogss/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: {
          react: -1,
        },
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
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
    // SslCommerz payment api
    app.post("/order", async (req, res) => {
      const order = req.body;
      const train_id = new ObjectId().toString();
      const data = {
        total_amount: order.price,
        currency: "BDT",
        tran_id: train_id,
        success_url: `https://soulmates-server-two.vercel.app/payment/success/${train_id}`,
        fail_url: `https://soulmates-server-two.vercel.app/payment/fail/${train_id}`,
        cancel_url: "http://localhost:3030/cancel", //not Important
        ipn_url: "http://localhost:3030/ipn", //not Important
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: order.name,
        cus_email: order.name,
        cus_add1: order.location,
        cus_add2: order.location,
        cus_city: order.location,
        cus_state: order.location,
        cus_postcode: order.post,
        cus_country: "Bangladesh",
        cus_phone: order.phone,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: order.post,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });

        const finalOrder = {
          order,
          paidStatus: false,
          transaction: train_id,
        };
        const result = orderCollection.insertOne(finalOrder);

        console.log("Redirecting to: ", GatewayPageURL);
      });

      app.post("/payment/success/:tranId", async (req, res) => {
        console.log(req.params.tranId);
        const result = await orderCollection.updateOne(
          { transaction: req.params.tranId },
          {
            $set: {
              paidStatus: true,
            },
          }
        );
        if (result.modifiedCount > 0) {
          //update users plan
          let visitCount = 0;
          const query = { transaction: req.params.tranId };
          const plan = await orderCollection.findOne(query);

          if (plan.order.plan === "gold") {
            visitCount = 20;
          } else if (plan.order.plan === "platinum") {
            visitCount = 30;
          }

          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          const filter = { email: plan.order.email };
          const option = { upsert: true };
          const setCls = {
            $set: {
              expire: nextMonth,
              plan: plan.order.plan,
              profileVisit: visitCount,
            },
          };

          const result = await usersCollection.updateOne(
            filter,
            setCls,
            option
          );

          res.redirect(
            `https://soulmates-server-two.vercel.app/payment/success/${req.params.tranId}`
          );
        }
      });
      app.post("/payment/fail/:tranId", async (req, res) => {
        const result = await orderCollection.deleteOne({
          transaction: req.params.tranId,
        });
        if (result.deletedCount) {
          res.redirect(
            `https://soulmates-server-two.vercel.app/payment/fail/${req.params.tranId}`
          );
        }
      });
    });

    //user plan set
    app.get("/userPlan", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      const query = { email: email };
      const result = await usersCollection.findOne(query);

      if (!result) {
        return res.status(404).json({ error: "User not found." });
      }

      const planData = {
        userEmail: result.email,
        userPlan: result.plan,
        profileVisit: result.profileVisit,
      };

      res.send(planData);
    });

    app.put("/profileVisit", async (req, res) => {
      const filter = { email: req.query.user };
      const option = { upsert: true };
      const setCls = {
        $inc: {
          profileVisit: -1,
        },
      };

      const result = await usersCollection.updateOne(filter, setCls, option);
      res.send(result);
    });

    //using node-schedule part
    const updateDays = async (filterPlan, increment) => {
      const filter = { plan: filterPlan };
      const option = { upsert: true };
      const setCls = {
        $set: {
          profileVisit: increment,
        },
      };
      const result = await usersCollection.updateMany(filter, setCls, option);
    };

    const updateMonths = async (planItm) => {
      const currentTime = new Date();
      const query = { plan: planItm, expire: { $lte: currentTime } };
      const objects = await usersCollection.find(query).toArray();

      for (const obj of objects) {
        await usersCollection.updateOne(
          { _id: obj._id },
          { $set: { plan: "free", profileVisit: 50, expire: new Date() } }
        );
      }
    };

    schedule.scheduleJob("* 1 * * *", async () => {
      await updateDays("gold", 120);
      await updateDays("platinum", 130);
      await updateMonths("gold");
      await updateMonths("platinum");
      console.log("schedule Running....");
    });

    //if any issue comment this line.
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.connect();
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
