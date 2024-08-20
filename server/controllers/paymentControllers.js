const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const adminServices = require('../services/adminServices');
const paymentServices = require('../services/paymentServices');
const mongoose = require('mongoose');
const User = require('../models/usersSchema');

// Load the Stripe webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Route to create a checkout session
router.post('/create-checkout-session', express.json(), async (req, res) => {
    const { planId, token, planName } = req.body;
    const CORS_ORIGIN = process.env.CORS_ORIGIN;

    try {
        const user = await adminServices.verifyToken(token);
        let customerId = user.customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                }
            });

            await User.findByIdAndUpdate(user.id, { customer_id: customer.id });
            customerId = customer.id;
        }

        // Create a checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: planId,
                    quantity: 1,
                },
            ],
            customer: customerId,
            success_url: `${CORS_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CORS_ORIGIN}/cancel`,
            metadata: {
                userId: user.id,
                selectedPlanId: planName,
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
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;

            try {
                // Update the user plan and customer_id
                await User.findByIdAndUpdate(session.metadata.userId, {
                    plan: session.metadata.selectedPlanId,
                    customer_id: session.customer,
                });
            } catch (error) {
                console.error('Error upgrading plan:', error);
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            // Handle payment success events if needed
            const invoice = event.data.object;
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

router.get('/verify-session', async (req, res) => {
    const sessionId = req.query.session_id;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return res.json({
                success: true,
                session,
            });
        } else {
            return res.json({
                success: false,
                message: 'Payment not completed.',
            });
        }
    } catch (error) {
        console.error('Error fetching checkout session:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});

module.exports = router;
