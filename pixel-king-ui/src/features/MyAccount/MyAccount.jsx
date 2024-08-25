import { useState, useEffect } from "react";
import axios from "axios";
import ChangeInfoModal from './ChangeInfoModal/ChangeInfoModal';
import ChangePasswordModal from './ChangePassModal/ChangePassModal';
import styles from './MyAccount.module.css';
import pros from '../../assets/pro.png';
import cons from '../../assets/cons.png';
import {useNavigate, useLocation} from "react-router-dom";

export default function MyAccount() {
    const [userInfo, setUserInfo] = useState(null);
    const [stripeDetails, setStripeDetails] = useState(null);
    const [isChangeInfoModalOpen, setIsChangeInfoModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false);
    const [loadingButton, setLoadingButton] = useState(""); // Keep track of which button is loading

    const navigate = useNavigate();
    const location = useLocation();

    const fetchAccountDetails = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/account-details`, {
            headers: {
                Authorization: localStorage.getItem('userToken')
            }
        }).then(response => {
            setUserInfo(response.data);
            setStripeDetails(response.data.stripeDetails);
        }).catch(error => {
            console.error('Error during fetching account details:', error);
        });
    };

    useEffect(() => {
        fetchAccountDetails();
    }, [location.pathname]);

    const handleInfoModalClose = () => {
        setIsChangeInfoModalOpen(false);
        fetchAccountDetails();
    };

    const handlePasswordModalClose = () => {
        setIsChangePasswordModalOpen(false);
        fetchAccountDetails();
    };

    const handleCancelPlan = () => {
        setIsCancelPlanModalOpen(true);
    };

    const confirmCancelPlan = async () => {
        setLoadingButton("cancelModal");
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/cancel-subscription`, {}, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            });

            fetchAccountDetails();
        } catch (error) {
            console.error('Error cancelling plan:', error);
        } finally {
            // Add a short delay before resetting the loading state
            setTimeout(() => {
                setLoadingButton(""); // Reset loading state
                setIsCancelPlanModalOpen(false);
            }, 500); // 500ms delay
        }
    };

    const handleRenewPlan = async () => {
        setLoadingButton("renew");
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/renew`, {}, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            });
            fetchAccountDetails();
        } catch (error) {
            console.error('Error renewing plan:', error);
        } finally {
            setLoadingButton(""); // Reset loading state
        }
    };

    return (
        <div>
            <h1 className={styles.heading}>My Account</h1>
            <div className={styles.itemsWrapper}>
                <div className={styles.smallItemsWrapper}>
                    <div className={styles.smallItem}>
                        <h2 className={styles.secondHeading}>Personal Info</h2>
                        <div className={styles.firstSmallWrapper}>
                            <div className={styles.infoContainer}>
                                <p>Username: <span className={styles.spanGradient}>{userInfo?.username}</span></p>
                                <p>Email: <span className={styles.spanGradient}>{userInfo?.email}</span></p>
                            </div>
                            <div className={styles.infoActionButtons}>
                                <button
                                    className='button2'
                                    onClick={() => {
                                        setLoadingButton("info");
                                        setIsChangeInfoModalOpen(true);
                                    }}
                                >
                                    {loadingButton === "info" ? <div className={styles.loader}></div> : "Change Info"}
                                </button>
                                <button
                                    className='button2'
                                    onClick={() => {
                                        setLoadingButton("password");
                                        setIsChangePasswordModalOpen(true);
                                    }}
                                >
                                    {loadingButton === "password" ? <div className={styles.loader}></div> : "Change Password"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.smallItemCredits}>
                        <h2 className={styles.secondHeading}>Pixels</h2>
                        <div className={styles.creditsContainer}>
                            <p className={styles.creditsCount}>{userInfo?.credits}</p>
                            <button className='button2 addButton'>+</button>
                        </div>
                    </div>
                </div>
                <div className={styles.bigItem}>
                    <h2 className={styles.secondHeading}>Plan</h2>
                    <p className={styles.currentPlan}>Current plan: <span className={styles.spanGradient}>{userInfo?.plan ? userInfo.plan.toUpperCase() : <div className={styles.loader}></div>}</span></p>
                    {stripeDetails && (
                        <div className={styles.planInfo}>
                            <p>Payment Method: {stripeDetails.cardBrand.toUpperCase()} **** ****
                                **** {stripeDetails.cardLast4}</p>
                            <p>Expires: {stripeDetails.cardExpiryMonth}/{stripeDetails.cardExpiryYear}</p>
                            {stripeDetails.expires_at && (
                                <p>Expires at: {new Date(stripeDetails.expires_at * 1000).toLocaleDateString()}</p>
                            )}
                            {stripeDetails.renews_at && (
                                <p>Renews at: {new Date(stripeDetails.renews_at * 1000).toLocaleDateString()}</p>
                            )}
                        </div>
                    )}
                    {userInfo?.plan === 'free' && (
                        <div className={styles.prosAndCons}>
                            <ul className={styles.pros}>
                                <li>
                                    <img src={pros} alt="Pros" className={styles.icon} />
                                    <p>Access to thousands of wallpapers</p>
                                </li>
                                <li>
                                    <img src={pros} alt="Pros" className={styles.icon} />
                                    <p>Download up to 10 4K wallpapers per day</p>
                                </li>
                                <li>
                                    <img src={pros} alt="Pros" className={styles.icon} />
                                    <p>Add wallpapers to favorites</p>
                                </li>
                            </ul>
                            <ul className={styles.cons}>
                                <li>
                                    <img src={cons} alt="Cons" className={styles.icon} />
                                    <p>No access to 8K wallpapers</p>
                                </li>
                                <li>
                                    <img src={cons} alt="Cons" className={styles.icon} />
                                    <p>Limited daily pixels</p>
                                </li>
                                <li>
                                    <img src={cons} alt="Cons" className={styles.icon} />
                                    <p>No custom wallpapers</p>
                                </li>
                            </ul>
                        </div>
                    )}
                    <div className={styles.buttonsWrapper}>
                        <button className='button2' onClick={() => navigate('/upgrade')}>
                            {userInfo?.plan === 'free' ? 'Upgrade Now' : 'Change Plan'}
                        </button>

                        {userInfo?.plan !== 'free' && !stripeDetails?.cancel_at_period_end && (
                            <button className='button2' onClick={handleCancelPlan}>
                                {loadingButton === "cancel" ? <div className={styles.loader}></div> : "Cancel Plan"}
                            </button>
                        )}

                        {stripeDetails?.cancel_at_period_end && (
                            <button className='button2' onClick={handleRenewPlan}>
                                {loadingButton === "renew" ? <div className={styles.loader}></div> : "Renew Plan"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isChangeInfoModalOpen && (
                <ChangeInfoModal
                    username={userInfo?.username}
                    email={userInfo?.email}
                    onClose={handleInfoModalClose}
                />
            )}
            {isChangePasswordModalOpen && (
                <ChangePasswordModal
                    onClose={handlePasswordModalClose}
                />
            )}
            {isCancelPlanModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Are you sure you want to cancel your plan?</h2>
                        <div className={styles.modalActions}>
                            <button
                                className='button2'
                                onClick={() => {
                                    setLoadingButton("cancelModal");
                                    confirmCancelPlan();
                                }}
                            >
                                {loadingButton === "cancelModal" ? <div className={styles.loader}></div> : "Yes, Cancel Plan"}
                            </button>
                            <button
                                className='button2'
                                onClick={() => setIsCancelPlanModalOpen(false)}
                            >
                                No, Keep Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
