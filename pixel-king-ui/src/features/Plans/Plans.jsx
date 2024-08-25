import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plans.module.css';
import pros from '../../assets/pro.png';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Plans() {
    const [currentPlan, setCurrentPlan] = useState('Free');
    const [pixels, setPixels] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/info`, {
            headers: {
                Authorization: localStorage.getItem('userToken')
            }
        }).then(response => {
            setCurrentPlan(response.data.plan);
            setPixels(response.data.credits);
        }).catch(error => {
            console.error('Error during user info:', error);
        });
    }, []);

    const handleUpgrade = async (planId, planName) => {
        if (planName === 'Free') {
            // Redirect to /account when downgrading to Free
            navigate('/account');
            return;
        }
        if (currentPlan === 'King' && planName === 'Premium') {
            // Downgrading from King to Premium, send to the downgrade endpoint
            setLoading(true);
            try {
                const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/downgrade`, {
                    newPlanId: planId,
                    token: localStorage.getItem('userToken'),
                    planName: planName
                }, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });

                navigate('/account');
            } catch (error) {
                console.error('Error downgrading subscription:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Handle upgrade
        setLoading(true);
        try {
            const stripe = await stripePromise;
            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-checkout-session`, {
                planId: planId,
                token: localStorage.getItem('userToken'),
                planName: planName
            }, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            });

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (result.error) {
                console.error('Stripe error:', result.error.message);
            } else {
                navigate('/my-account');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.shopWrapper}>
            <h1 className='mainH1'>Plans</h1>
            <div className={styles.plansContainer}>
                <div className={styles.plan}>
                    <h2>Free</h2>
                    <p className={styles.price}>€0.00 <br /><span>For Ever</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros} alt="Pros" />
                                <p>Up to 10 (4K) wallpapers per month</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros" />
                                <p>Weekly Wallpapers</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros" />
                                <p>Unlimited HD Downloads</p>
                            </li>
                        </ul>
                        <button
                            className={currentPlan === 'Free' ? "button2 currentPlan" : "button2"}
                            onClick={() => currentPlan !== 'Free' && handleUpgrade('price_1PpX8MFqQKSFArkNHlkLIemb', 'Free')}
                            disabled={currentPlan === 'Free'}
                        >
                            {currentPlan === 'Free' ? 'Current Plan' : 'Downgrade'}
                        </button>
                    </div>
                </div>
                <div className={styles.plan}>
                    <h2>Premium</h2>
                    <p className={styles.price}>€1.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Unlimited HD & 4K Downloads</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>60 Pixels per Month</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Up to 20 (8K) Download per month</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Includes all free plan features</p>
                            </li>
                        </ul>
                        <button
                            className={currentPlan === 'Premium' ? "button2 currentPlan" : "button2"}
                            onClick={() => currentPlan !== 'Premium' && handleUpgrade('price_1PpX8MFqQKSFArkNHlkLIemb', 'Premium')}
                            disabled={loading || currentPlan === 'Premium'}
                        >
                            {currentPlan === 'Premium' ? 'Current Plan' : currentPlan === 'King' ? 'Downgrade' : loading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>
                <div className={styles.plan}>
                    <h2>King</h2>
                    <p className={styles.price}>€2.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Unlimited 8K Downloads</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>125 Pixels per month</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Includes all Premium features</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>No Download limits</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>No Ads</p>
                            </li>
                        </ul>
                        <button
                            className={currentPlan === 'King' ? "button2 currentPlan" : "button2"}
                            onClick={() => currentPlan !== 'King' && handleUpgrade('price_1PraTvFqQKSFArkNw1mqHNPe', 'King')}
                            disabled={loading || currentPlan === 'King'}
                        >
                            {currentPlan === 'King' ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>
            </div>
            <h1 className='mainH1'>Pixels</h1>
            <div>
                <form className={styles.creditsForm}>
                    <label>
                        <p>Current Pixels: {pixels}</p>
                        <input type='number' placeholder='Enter Pixels' />
                        <button className='button2'>Add Pixels</button>
                    </label>
                </form>
            </div>
        </div>
    );
}
