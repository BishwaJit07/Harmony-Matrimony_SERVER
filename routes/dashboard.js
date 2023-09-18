const express = require('express');
const { mongoClient } = require('../mongodbConnection');
const router = express.Router();


const orderCollection = mongoClient.db("SoulMate").collection("order")
const usersCollection = mongoClient.db("SoulMate").collection("users")
const coupleCollection = mongoClient.db("SoulMate").collection("CoupleData")
const blogsCollection = mongoClient.db("SoulMate").collection("blogs")
const paymentHistoryCollection = mongoClient.db("SoulMate").collection("paymentHistory")


// admin Dashboard

router.get("/adminStats", async (req, res) => {
    try{
        const user = await usersCollection.estimatedDocumentCount();
        const coupleDate = await coupleCollection.estimatedDocumentCount();
        const blog = await blogsCollection.estimatedDocumentCount();
        const subscription = await orderCollection.estimatedDocumentCount();
        const servicesPackage =
            await paymentHistoryCollection.estimatedDocumentCount();
        const payments = await orderCollection.find().toArray();
        const subpayment = payments.reduce(
            (sum, payment) => sum + payment.order.price,
            0
        );
    
        const services = await paymentHistoryCollection.find().toArray();
        const cardService = services.reduce(
            (sum, payment) => sum + payment.price,
            0
        );
        const cardServiceBd = parseFloat(cardService) * 100;
        const revenue = cardServiceBd + subpayment;
        res.send({
            user,
            coupleDate,
            blog,
            subscription,
            revenue,
            servicesPackage,
        });
    }
    catch (err) {
        res.status(500).json(err)
    }
});
router.get("/monthStats", async (req, res) => {
   try{
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );
    const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    );
    const result = await Promise.all([
        orderCollection
            .aggregate([
                {
                    $match: {
                        orderDate: {
                            $gte: firstDayOfMonth,
                            $lte: lastDayOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$order.price" },
                    },
                },
            ])
            .toArray(),
        paymentHistoryCollection
            .aggregate([
                {
                    $match: {
                        paymentDate: {
                            $gte: firstDayOfMonth,
                            $lte: lastDayOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: "$price" },
                    },
                },
            ])
            .toArray(),
    ]);

    const monthlyRevenue = result[0][0]?.totalRevenue || 0;
    const monthlyPayments = result[1][0]?.totalPayments || 0;
    const netMonthlyRevenue = monthlyRevenue - monthlyPayments;
    res.send({ monthlyRevenue, monthlyPayments, netMonthlyRevenue });
   }
   catch (err) {
    res.status(500).json(err)
}
});

//support dashboard
router.get("/userStats/:email", async (req, res) => {
    try{
        const email = req.params.email;
        const users = await usersCollection.estimatedDocumentCount();
        const coupleDate = await coupleCollection.estimatedDocumentCount();
        const blogs = await blogsCollection.estimatedDocumentCount();
        const subscription = await orderCollection.estimatedDocumentCount();
        const servicesPackage = await paymentHistoryCollection.estimatedDocumentCount();
    
        const user = await usersCollection.countDocuments({ email });
        const order = await orderCollection.countDocuments({
            "order.email": email,
        });
        const blog = await blogsCollection.countDocuments({ email });
        const bookedService = await bookedServiceCollection.countDocuments({
            email,
        });
        const bookedServices = await bookedServiceCollection.estimatedDocumentCount();
        const package = await orderCollection.findOne({ "order.email": email });
        const services = await paymentHistoryCollection.find({ email }).toArray();
    
        res.send({
            users,user, blogs,  blog, order,  bookedService, bookedServices, package,  services, subscription, coupleDate,
        });
    }
    catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router;