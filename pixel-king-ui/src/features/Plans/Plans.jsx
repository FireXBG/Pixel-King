import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plans.module.css';
import pros from '../../assets/pro.png';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import ConfirmModal from '../../shared/confirmModal/confirmModal';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Plans() {
    const [currentPlan, setCurrentPlan] = useState('Free');
    const [pixels, setPixels] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // Store selected plan for upgrade/downgrade
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

    const handleUpgradeOrDowngrade = async (planId, planName) => {
        if (currentPlan === 'King' && planName === 'Premium') {
            // Downgrading from King to Premium, show modal
            setSelectedPlan({ id: planId, name: planName });
            setShowConfirmModal(true);
        } else if (currentPlan === 'Premium' && planName === 'King') {
            // Upgrading from Premium to King, show modal
            setSelectedPlan({ id: planId, name: planName });
            setShowConfirmModal(true);
        } else {
            // Proceed directly to upgrade (like Free to Premium)
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
        }
    };

    const handleConfirmUpgradeOrDowngrade = async () => {
        setLoading(true);
        setShowConfirmModal(false); // Close the modal

        if (selectedPlan.name === 'Premium' && currentPlan === 'King') {
            // Handle downgrade from King to Premium
            try {
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/downgrade`, {
                    newPlanId: selectedPlan.id,
                    token: localStorage.getItem('userToken'),
                    planName: selectedPlan.name
                }, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });
                navigate('/my-account');
            } catch (error) {
                console.error('Error during plan downgrade:', error);
            } finally {
                setLoading(false);
            }
        } else if (selectedPlan.name === 'King' && currentPlan === 'Premium') {
            // Handle upgrade from Premium to King
            try {
                // Cancel the current Premium subscription
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/cancel-subscription`, {}, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });

                // Proceed with the upgrade to King plan
                const stripe = await stripePromise;
                const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-checkout-session`, {
                    planId: selectedPlan.id,
                    token: localStorage.getItem('userToken'),
                    planName: selectedPlan.name
                }, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });

                const result = await stripe.redirectToCheckout({
                    sessionId: data.sessionId,
                });

                if (result.error) {
                    console.error('Stripe error:', result.error.message);
                } else {
                    navigate('/my-account');
                }
            } catch (error) {
                console.error('Error upgrading to King plan:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelModal = () => {
        setShowConfirmModal(false);
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
                            className={currentPlan.toLowerCase() === 'free' ? "button2 currentPlan" : "button2"}
                            onClick={() => currentPlan.toLowerCase() !== 'free' && handleUpgradeOrDowngrade('price_1PpX8MFqQKSFArkNHlkLIemb', 'Free')}
                            disabled={currentPlan.toLowerCase() === 'free'}
                        >
                            {currentPlan.toLowerCase() === 'free' ? 'Current Plan' : 'Downgrade'}
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
                            className={currentPlan.toLowerCase() === 'premium' ? "button2 currentPlan" : "button2"}
                            onClick={() => handleUpgradeOrDowngrade('price_1PpX8MFqQKSFArkNHlkLIemb', 'Premium')}
                            disabled={loading || currentPlan.toLowerCase() === 'premium'}
                        >
                            {currentPlan.toLowerCase() === 'premium' ? 'Current Plan' : currentPlan.toLowerCase() === 'king' ? 'Downgrade' : loading ? 'Processing...' : 'Upgrade Now'}
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
                            className={currentPlan.toLowerCase() === 'king' ? "button2 currentPlan" : "button2"}
                            onClick={() => handleUpgradeOrDowngrade('price_1PraTvFqQKSFArkNw1mqHNPe', 'King')}
                            disabled={loading || currentPlan.toLowerCase() === 'king'}
                        >
                            {currentPlan.toLowerCase() === 'king' ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Now'}
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

            {showConfirmModal && (
                <ConfirmModal
                    title={`Confirm ${selectedPlan.name === 'Premium' ? 'Downgrade' : 'Upgrade'}`}
                    message={`Are you sure you want to ${selectedPlan.name === 'Premium' ? 'downgrade' : 'upgrade'} your plan? The current plan will be canceled.`}
                    onConfirm={handleConfirmUpgradeOrDowngrade}
                    onCancel={handleCancelModal}
                />
            )}
        </div>
    );
}
