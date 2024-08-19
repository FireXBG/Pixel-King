const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const adminServices = require('../services/adminServices');
const paymentServices = require('../services/paymentServices');
const mongoose = require('mongoose');

// Load the Stripe webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Route to create a checkout session
router.post('/create-checkout-session', express.json(), async (req, res) => {
    const { planId, token, planName } = req.body;
    console.log('Plan ID:', planId);
    console.log('Token:', token);
    const CORS_ORIGIN = process.env.CORS_ORIGIN;
    try {
        const userId = (await adminServices.verifyToken(token)).id;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: planId, // Use the correct Price ID
                    quantity: 1,
                },
            ],
            success_url: `${CORS_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CORS_ORIGIN}/cancel`,
            metadata: {
                userId: userId,
                selectedPlanId: planName, // Ensure this is correctly set
            },
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Pass the raw body (req.body) to the constructEvent method
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            // console.log(`Checkout session completed for session ID: ${session.id}`);
            // console.log(`User ID: ${session.metadata.userId}`);
            // console.log(`Selected Plan: ${session.metadata.selectedPlanId}`);

            try {
                await paymentServices.upgradePlan(session.metadata.selectedPlanId, session.metadata.userId);
            } catch (error) {
                console.error('Error upgrading plan:', error);
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object;
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
