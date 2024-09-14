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

    if(!userToken) {
        console.log("No token provided");
        return res.status(401).json({ message: 'You are not logged in' });
    }

    try {
        console.log("Verifying user with token:", userToken);
        const tokenPayload = await adminServices.verifyToken(userToken);

        if (!tokenPayload || !tokenPayload.id) {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch the user data from the database
        const user = await User.findById(tokenPayload.id);

        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({ message: 'User not found in database' });
        }

        let stripeDetails = null;

        if (user.plan !== 'free' && user.customer_id) {
            console.log("Fetching Stripe customer details for customer ID:", user.customer_id);

            // Fetch customer details from Stripe
            const customer = await stripe.customers.retrieve(user.customer_id);
            console.log("Stripe customer retrieved:", customer);

            // Fetch the default payment method
            const paymentMethods = await stripe.paymentMethods.list({
                customer: user.customer_id,
                type: 'card',
            });

            console.log("Payment methods retrieved:", paymentMethods);

            if (paymentMethods.data.length > 0) {
                const card = paymentMethods.data[0].card;

                // Fetch subscription details
                const subscription = await stripe.subscriptions.list({
                    customer: user.customer_id,
                    status: 'all',
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
                        cancel_at_period_end: activeSubscription.cancel_at_period_end,
                    };
                    console.log("Stripe details set:", stripeDetails);
                }
            }
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
        return res.status(500).json({ message: error });
    }
});

router.get('/free-downloads', async (req, res) => {
    const userToken = req.headers.authorization;

    try {
        const user = await adminServices.verifyToken(userToken);
        const userId = user.id;

        const downloads = await userServices.getFreeDownloads(userId);

        console.log("Free downloads fetched:", downloads);

        if (!user || !user.id) {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ DownloadsAvailable4K: downloads.DownloadsAvailable4K, DownloadsAvailable8K: downloads.DownloadsAvailable8K });
    } catch (error) {
        console.error("Error fetching free downloads:", error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find().select('username email plan credits customer_id');

        // Fetching customer details from Stripe for each user (optional)
        const detailedUsers = await Promise.all(users.map(async (user) => {
            let stripeInfo = null;
            if (user.customer_id) {
                try {
                    const customer = await stripe.customers.retrieve(user.customer_id);
                    stripeInfo = customer; // Add any specific stripe information if needed
                } catch (error) {
                    console.error('Error fetching Stripe details for customer:', user.customer_id);
                }
            }

            return {
                ...user._doc,
                stripe: stripeInfo ? stripeInfo : null
            };
        }));

        res.status(200).json({ users: detailedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

router.put('/edit/:id', async (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;

    try {
        const updatedUser = await userServices.updateUserById(userId, updatedData);
        res.status(200).json({ updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});


// Generate a promo code
router.post('/promo-codes/generate', async (req, res) => {
    const { pixels, expirationDate } = req.body;

    try {
        const promoCode = await userServices.generatePromoCode(pixels, expirationDate);
        res.status(201).json({ message: 'Promo code generated', promoCode });
    } catch (error) {
        console.error('Error generating promo code:', error);
        res.status(500).json({ error: 'Failed to generate promo code' });
    }
});

// Get all promo codes
router.get('/promo-codes', async (req, res) => {
    try {
        const promoCodes = await userServices.getAllPromoCodes();
        res.status(200).json({ promoCodes });
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({ error: 'Failed to fetch promo codes' });
    }
});

// Delete a promo code
router.delete('/promo-codes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await userServices.deletePromoCode(id);
        res.status(200).json({ message: 'Promo code deleted' });
    } catch (error) {
        console.error('Error deleting promo code:', error);
        res.status(500).json({ error: 'Failed to delete promo code' });
    }
});

// Send promo code via email
router.post('/promo-codes/send-email', async (req, res) => {
    const { code, email } = req.body;

    try {
        await userServices.sendPromoCodeEmail(code, email);
        res.status(200).json({ message: 'Promo code sent via email' });
    } catch (error) {
        console.error('Error sending promo code email:', error);
        res.status(500).json({ error: 'Failed to send promo code via email' });
    }
});

module.exports = router;