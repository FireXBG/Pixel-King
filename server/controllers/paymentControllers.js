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
                console.log('Updating user plan and customer_id');
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
        case 'customer.subscription.deleted': {
            // Downgrade the user's plan in your database
            const userId = event.data.object.metadata.userId;
            console.log('Downgrading user plan:', userId);
            const user = await User.findById(userId);
            const customerId = user.customer_id;

            // Retrieve the active subscription associated with the customer and check if the period end date has passed
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
            });

            if (subscriptions.data.length === 0) {
                console.log('No active subscription found for this customer');
                // Set user to free plan

                await paymentServices.resetPlan(userId)
                return;
            }
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

router.post('/cancel-subscription', async (req, res) => {
    try {
        const token = req.headers.authorization;

        // Verify token and get user ID
        const { id } = await adminServices.verifyToken(token);

        // Find the user in the database
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const customer_id = user.customer_id;
        console.log('Customer ID:', customer_id);

        // Retrieve the active subscription associated with the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer_id,
            status: 'active',
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ message: 'No active subscription found for this customer' });
        }

        // Assume there is only one active subscription per user, cancel it
        const subscriptionId = subscriptions.data[0].id;
        const canceledSubscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

        res.json({ message: 'Subscription cancellation scheduled successfully', subscription: canceledSubscription });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/renew', async (req, res) => {
    try {
        const token = req.headers.authorization;

        // Verify token and get user ID
        const { id } = await adminServices.verifyToken(token);

        // Find the user in the database
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const customer_id = user.customer_id;
        if (!customer_id) {
            return res.status(400).json({ message: 'User does not have a Stripe customer ID' });
        }

        // Retrieve the active subscription associated with the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer_id,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ message: 'No active subscription found for this customer' });
        }

        const subscriptionId = subscriptions.data[0].id;
        const subscription = subscriptions.data[0];

        if (subscription.cancel_at_period_end) {
            // Renew the subscription by setting cancel_at_period_end to false
            const renewedSubscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false,
            });

            res.json({ message: 'Subscription renewed successfully', subscription: renewedSubscription });
        } else {
            res.json({ message: 'Subscription is already active and set to renew' });
        }
    } catch (error) {
        console.error('Error renewing subscription:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;
