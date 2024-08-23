const express = require('express');
const router = express.Router();
const userServices = require('../services/usersServices')
const adminServices = require("../services/adminServices");
const User = require('../models/usersSchema');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const token = await userServices.login(data);
        res.status(200).json(token);
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/register', async (req, res) => {
    const data = req.body;
    try {
        const token = await userServices.register(data);
        res.status(201).json(token);
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/info', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const userInfo = await userServices.userInfo(token);
        console.log(userInfo);
        res.status(200).json(userInfo);
    } catch (error) {
        console.error("Error during user info:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/updateUserInfo', async (req, res) => {
    const data = req.body;
    const token = req.headers.authorization;
    try {
        const updatedUserInfo = await userServices.updateUserInfo(data, token);
        res.status(200).json(updatedUserInfo);
    } catch (error) {
        console.error("Error during user info update:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/updatePassword', async (req, res) => {
    const data = req.body;
    const token = req.headers.authorization;
    try {
        const updatedPassword = await userServices.updatePassword(data, token);
        res.status(200).json(updatedPassword);
    } catch (error) {
        console.error("Error during user password update:", error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/account-details', async (req, res) => {
    const userToken = req.headers.authorization;

    try {
        console.log("Verifying user with token:", userToken);
        const tokenPayload = await adminServices.verifyToken(userToken);

        if (!tokenPayload || !tokenPayload.id) {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(tokenPayload.id);
        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({ message: 'User not found in database' });
        }

        console.log("User found in database:", user);
        console.log("User plan:", user.plan);

        let stripeDetails = null;
        if (user.plan !== 'free' && user.customer_id) {
            console.log("Fetching Stripe customer details for customer ID:", user.customer_id);

            const customer = await stripe.customers.retrieve(user.customer_id);
            const paymentMethods = await stripe.paymentMethods.list({
                customer: user.customer_id,
                type: 'card',
            });

            if (paymentMethods.data.length > 0) {
                const card = paymentMethods.data[0].card;

                const subscription = await stripe.subscriptions.list({
                    customer: user.customer_id,
                    status: 'active',
                    limit: 1,
                });

                if (subscription.data.length > 0) {
                    const activeSubscription = subscription.data[0];
                    stripeDetails = {
                        cardBrand: card.brand,
                        cardLast4: card.last4,
                        cardExpiryMonth: card.exp_month,
                        cardExpiryYear: card.exp_year,
                        renews_at: !activeSubscription.cancel_at_period_end ? activeSubscription.current_period_end : null,
                        expires_at: activeSubscription.cancel_at_period_end ? activeSubscription.current_period_end : null,
                    };
                    console.log("Stripe details set:", stripeDetails);
                } else {
                    console.log("No active subscription found for customer ID:", user.customer_id);
                }
            } else {
                console.log("No payment methods found for customer ID:", user.customer_id);
            }
        } else {
            console.log("User has a free plan or no customer ID:", { plan: user.plan, customer_id: user.customer_id });
        }

        return res.json({
            username: user.username,
            email: user.email,
            plan: user.plan,
            credits: user.credits,
            stripeDetails,
        });

    } catch (error) {
        console.error('Error fetching account details:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;