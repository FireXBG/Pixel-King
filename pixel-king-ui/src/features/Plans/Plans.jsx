import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plans.module.css';
import pros from '../../assets/pro.png';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import ConfirmModal from '../../shared/confirmModal/confirmModal';
import pixelImg from '../../assets/Diamond.png'; // Imported Pixel Image

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Plans() {
    const [currentPlan, setCurrentPlan] = useState('Free');
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/info`, {
            headers: {
                Authorization: localStorage.getItem('userToken')
            }
        }).then(response => {
            setCurrentPlan(response.data.plan);
        }).catch(error => {
            console.error('Error during user info:', error);
        });
    }, []);

    const handlePixelPurchase = async (pixelAmount) => {
        setLoading(true);
        try {
            const stripe = await stripePromise;
            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-pixels-checkout-session`, {
                quantity: pixelAmount,
                token: localStorage.getItem('userToken')
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
            }
        } catch (error) {
            console.error('Error creating pixels checkout session:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.shopWrapper}>
            <h1 className='mainH1'>Plans</h1>
            <div className={styles.plansContainer}>
                <div className={styles.plan}>
                    <h2 className={styles.planName}>Free</h2>
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
                        <button className={currentPlan.toLowerCase() === 'free' ? "button2 currentPlan" : "button2"}>
                            {currentPlan.toLowerCase() === 'free' ? 'Current Plan' : 'Downgrade'}
                        </button>
                    </div>
                </div>
                <div className={styles.plan}>
                    <h2 className={styles.planName}>Premium</h2>
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
                                <p>Up to 20 (8K) Downloads per month</p>
                            </li>
                            <li>
                                <img src={pros} alt="Pros"/>
                                <p>Includes all Free plan features</p>
                            </li>
                        </ul>
                        <button className={currentPlan.toLowerCase() === 'premium' ? "button2 currentPlan" : "button2"}>
                            {currentPlan.toLowerCase() === 'premium' ? 'Current Plan' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>
                <div className={styles.plan}>
                    <h2 className={styles.planName}>King</h2>
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
                        <button className={currentPlan.toLowerCase() === 'king' ? "button2 currentPlan" : "button2"}>
                            {currentPlan.toLowerCase() === 'king' ? 'Current Plan' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>
            </div>

            {/* New Grid Section for Pixel Purchase */}
            <h1 className='mainH1'>Purchase Pixels</h1>
            <div className={styles.pixelGrid}>
                <button className="button2" onClick={() => handlePixelPurchase(60)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span className={styles.pixelPrice}>60<span className={styles.pixelPriceSpan}>€3.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(120)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span
                    className={styles.pixelPrice}>120<span className={styles.pixelPriceSpan}>€3.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(240)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span
                    className={styles.pixelPrice}>240<span className={styles.pixelPriceSpan}>€6.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(500)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span
                    className={styles.pixelPrice}>500<span className={styles.pixelPriceSpan}>€25.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(1200)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span
                    className={styles.pixelPrice}>1200<span className={styles.pixelPriceSpan}>€60.00</span></span>
                </button>
                <button className="button2" onClick={() => handlePixelPurchase(3100)}>
                    <img src={pixelImg} alt="pixel icon" className={styles.pixelIcon}/> <span
                    className={styles.pixelPrice}>3100<span className={styles.pixelPriceSpan}>€155.00</span></span>
                </button>
            </div>
        </div>
    );
}
