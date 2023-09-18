const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const { ObjectId } = require('mongodb');
const router = express.Router();
require("dotenv").config();
const paymentHistoryCollection = mongoClient.db("SoulMate").collection("paymentHistory");
const orderCollection = mongoClient.db("SoulMate").collection("order");
const usersCollection = mongoClient.db("SoulMate").collection("users");


const stripe = require("stripe")(process.env.PAYMENT_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.SSLID;
const store_passwd = process.env.SSLPASS;
const is_live = false;

async function updateUserPlanSystem(plan) {
    let visitCount;

    if (plan.plan === "lovebirds") {
        visitCount = 10;
    } else if (plan.plan === "premium") {
        visitCount = 30;
    } else if (plan.plan === "ultimate") {
        visitCount = 70;
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const filter = { _id: new ObjectId(plan.userId) };
    const option = { upsert: true };
    const setCls = {
        $set: {
            expire: nextMonth,
            plan: plan.plan,
            profileVisit: visitCount,
        },
    };

    await usersCollection.updateOne(filter, setCls, option);
}


//stripe payment
router.post("/create-payment-intent", async (req, res) => {
    const { price } = req.body;
    const amount = price;
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
router.post("/save-payments", async (req, res) => {
    try {
        const payment = req.body;
        const result = await paymentHistoryCollection.insertOne(payment);

        if (result.insertedId) {
            const query = { _id: result.insertedId };
            const plan = await paymentHistoryCollection.findOne(query);
            if (plan.plan) {
                await updateUserPlanSystem(plan);
                res.send(result);
            }
        }
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




// SslCommerz payment api
router.post("/order", async (req, res) => {
    try {
        const order = req.body;
        const train_id = new ObjectId().toString();
        const data = {
            total_amount: order.price,
            currency: "BDT",
            tran_id: train_id,
            success_url: `https://harmony-matrimony-server.vercel.router/payment/success/${train_id}`,
            fail_url: `https://harmony-matrimony-server.vercel.router/payment/fail/${train_id}`,
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
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post("/payment/success/:tranId", async (req, res) => {
    try {
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

            const query = { transaction: req.params.tranId };
            const plan = await orderCollection.findOne(query);

            await updateUserPlanSystem(plan.order);

            res.redirect(
                `http://localhost:5173/payment/success/${req.params.tranId}`
            );
        }
    }
    catch (error) {
        console.error('Error fetching users using the native driver:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post("/payment/fail/:tranId", async (req, res) => {
   try{
    const result = await orderCollection.deleteOne({
        transaction: req.params.tranId,
    });
    if (result.deletedCount) {
        res.redirect(
            `http://localhost:5173/payment/fail/${req.params.tranId}`
        );
    }
   }
   catch (error) {
    console.error('Error fetching users using the native driver:', error);
    res.status(500).json({ error: 'Server error' });
}
});

module.exports = router;