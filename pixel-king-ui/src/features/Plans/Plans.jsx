import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plans.module.css';
import pros from '../../assets/pro.png';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import pixelImg from '../../assets/Diamond.png';
import AuthContext from '../../auth/AuthContext';
import ConfirmModal from '../../shared/confirmModal/confirmModal';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Plans() {
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPlan, setPendingPlan] = useState(null);
    const { isUserAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch user plan info on component load
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/info`, {
                    headers: {
                        Authorization: localStorage.getItem('userToken'),
                    },
                });
                setCurrentPlan(response.data.plan);
            } catch (error) {
                console.error('Error during user info fetch:', error);
            }
        };
        fetchUserInfo();
    }, []);

    // Handle plan changes (upgrade/downgrade)
    const handleConfirm = (plan) => {
        // Redirect to login if the user is not authenticated
        if (!isUserAuthenticated) {
            navigate('/login');
            return;
        }

        // Show confirmation for downgrades and upgrades
        if ((currentPlan === 'King' && plan === 'Premium') || (currentPlan === 'Premium' && plan === 'King')) {
            setPendingPlan(plan);
            setShowConfirmModal(true);
        } else {
            // Directly handle upgrades from Free to Premium or King
            confirmPlanChange(plan);
        }
    };

    // Close confirmation modal
    const closeConfirmModal = () => {
        setPendingPlan(null);
        setShowConfirmModal(false);
    };

    // Handle confirmed plan change (downgrade/upgrade)
    const confirmPlanChange = async (plan) => {
        setShowConfirmModal(false);

        if (plan === 'free') {
            navigate('/account');
        } else if (plan === 'Premium' && currentPlan === 'King') {
            // Downgrade from King to Premium
            setLoading(true);
            try {
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/downgrade`, {
                    token: localStorage.getItem('userToken'),
                    newPlanId: 'price_1PpX8MFqQKSFArkNHlkLIemb',
                    planName: 'Premium',
                });
                setCurrentPlan('Premium');
                navigate('/account');
            } catch (error) {
                console.error('Error downgrading to Premium:', error);
            } finally {
                setLoading(false);
            }
        } else if (plan === 'King') {
            // Upgrade to King (from free or Premium)
            setLoading(true);
            try {
                const cancelCurrentSubscription = currentPlan !== 'free';
                if (cancelCurrentSubscription) {
                    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/cancel-subscription`, {}, {
                        headers: { Authorization: localStorage.getItem('userToken') }
                    });
                }

                const { data } = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-checkout-session`,
                    {
                        planId: 'price_1PraTvFqQKSFArkNw1mqHNPe',  // King Price ID
                        token: localStorage.getItem('userToken'),
                        planName: 'King'
                    }
                );
                const stripe = await stripePromise;
                const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (result.error) {
                    console.error('Stripe error:', result.error.message);
                }
            } catch (error) {
                console.error('Error upgrading to King:', error);
            } finally {
                setLoading(false);
            }
        } else if (plan === 'Premium' && currentPlan === 'free') {
            // Direct upgrade from Free to Premium
            setLoading(true);
            try {
                const { data } = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-checkout-session`,
                    {
                        planId: 'price_1PpX8MFqQKSFArkNHlkLIemb',
                        token: localStorage.getItem('userToken'),
                        planName: 'Premium'
                    }
                );
                const stripe = await stripePromise;
                const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (result.error) {
                    console.error('Stripe error:', result.error.message);
                }
            } catch (error) {
                console.error('Error upgrading to Premium:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle pixel purchase
    const handlePixelPurchase = async (pixelAmount) => {
        if (!isUserAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-pixels-checkout-session`,
                {
                    quantity: pixelAmount,
                    token: localStorage.getItem('userToken'),
                }
            );

            const stripe = await stripePromise;
            const result = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (result.error) {
                console.error('Stripe error:', result.error.message);
            }
        } catch (error) {
            console.error('Error creating pixels checkout session:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.shopWrapper}>
            <h1 className="mainH1">Plans</h1>
            <div className={styles.plansContainer}>
                <div className={styles.plan}>
                    <h2 className={styles.planName}>Free</h2>
                    <p className={styles.price}>€0.00 <br /><span>For Ever</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li><img src={pros} alt="Pros" /><p>Up to 10 (4K) wallpapers per month</p></li>
                            <li><img src={pros} alt="Pros" /><p>Weekly Wallpapers</p></li>
                            <li><img src={pros} alt="Pros" /><p>Unlimited HD Downloads</p></li>
                        </ul>
                        <button
                            className={currentPlan === 'free' ? 'button2 currentPlan' : 'button2'}
                            onClick={() => currentPlan !== 'free' && navigate('/account')}
                        >
                            {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                        </button>
                    </div>
                </div>

                <div className={styles.plan}>
                    <h2 className={styles.planName}>Premium</h2>
                    <p className={styles.price}>€1.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li><img src={pros} alt="Pros" /><p>Unlimited HD & 4K Downloads</p></li>
                            <li><img src={pros} alt="Pros" /><p>60 Pixels per Month</p></li>
                            <li><img src={pros} alt="Pros" /><p>Up to 20 (8K) Downloads per month</p></li>
                            <li><img src={pros} alt="Pros" /><p>Includes all Free plan features</p></li>
                        </ul>
                        <button
                            className={currentPlan === 'Premium' ? 'button2 currentPlan' : 'button2'}
                            onClick={() => {
                                if (currentPlan === 'King') {
                                    handleConfirm('Premium');  // Confirm downgrade
                                } else if (currentPlan === 'free') {
                                    handleConfirm('Premium');  // Upgrade from free
                                }
                            }}
                        >
                            {currentPlan === 'Premium' ? 'Current Plan' : (currentPlan === 'King' ? 'Downgrade' : 'Upgrade Now')}
                        </button>
                    </div>
                </div>

                <div className={styles.plan}>
                    <h2 className={styles.planName}>King</h2>
                    <p className={styles.price}>€2.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li><img src={pros} alt="Pros" /><p>Unlimited 8K Downloads</p></li>
                            <li><img src={pros} alt="Pros" /><p>125 Pixels per month</p></li>
                            <li><img src={pros} alt="Pros" /><p>Includes all Premium features</p></li>
                            <li><img src={pros} alt="Pros" /><p>No Download limits</p></li>
                            <li><img src={pros} alt="Pros" /><p>No Ads</p></li>
                        </ul>
                        <button
                            className={currentPlan === 'King' ? 'button2 currentPlan' : 'button2'}
                            onClick={() => handleConfirm('King')}
                        >
                            {currentPlan === 'King' ? 'Current Plan' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>
            </div>

            <h1 className="mainH1">Purchase Pixels</h1>
            <div className={styles.pixelGrid}>
                <button className="button2" onClick={() => handlePixelPurchase(100)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>100<span className={styles.pixelPriceSpan}>€5.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(250)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>250<span className={styles.pixelPriceSpan}>€12.50</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(500)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>500<span className={styles.pixelPriceSpan}>€25.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(1000)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>1000<span className={styles.pixelPriceSpan}>€50.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(2500)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>2500<span className={styles.pixelPriceSpan}>€125.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(5000)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/>{' '}
                    <span className={styles.pixelPrice}>5000<span className={styles.pixelPriceSpan}>€250.00</span></span>
                </button>
            </div>

            {showConfirmModal && (
                <ConfirmModal
                    title="Confirm Subscription Change"
                    message={`Are you sure you want to ${pendingPlan === 'King' ? 'upgrade to King' : 'downgrade to Premium'}?`}
                    onConfirm={() => confirmPlanChange(pendingPlan)}
                    onCancel={closeConfirmModal}
                />
            )}
        </div>
    );
}
