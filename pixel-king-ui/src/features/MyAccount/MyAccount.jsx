import { useState, useEffect } from "react";
import axios from "axios";
import ChangeInfoModal from './ChangeInfoModal/ChangeInfoModal';
import ChangePasswordModal from './ChangePassModal/ChangePassModal';
import styles from './MyAccount.module.css';

export default function MyAccount() {
    const [userInfo, setUserInfo] = useState(null); // Start with null to indicate loading
    const [stripeDetails, setStripeDetails] = useState(null);
    const [isChangeInfoModalOpen, setIsChangeInfoModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false); // State to manage the cancel plan modal

    const fetchAccountDetails = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/account-details`, {
            headers: {
                Authorization: localStorage.getItem('userToken')
            }
        }).then(response => {
            console.log('Account details fetched:', response.data); // Log the response data
            setUserInfo(response.data);
            setStripeDetails(response.data.stripeDetails);
        }).catch(error => {
            console.error('Error during fetching account details:', error);
        });
    };

    useEffect(() => {
        fetchAccountDetails();
    }, []);

    const handleInfoModalClose = () => {
        setIsChangeInfoModalOpen(false);
        fetchAccountDetails(); // Refetch user info after closing the modal
    };

    const handlePasswordModalClose = () => {
        setIsChangePasswordModalOpen(false);
        fetchAccountDetails(); // Refetch user info after closing the modal
    };

    const handleCancelPlan = () => {
        setIsCancelPlanModalOpen(true); // Open the cancel plan confirmation modal
    };

    const confirmCancelPlan = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/cancel-subscription`, {}, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            });

            // Fetch updated user info after canceling the plan
            fetchAccountDetails();
        } catch (error) {
            console.error('Error cancelling plan:', error);
        } finally {
            setIsCancelPlanModalOpen(false);
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
                                    onClick={() => setIsChangeInfoModalOpen(true)}
                                >
                                    Change Info
                                </button>
                                <button
                                    className='button2'
                                    onClick={() => setIsChangePasswordModalOpen(true)}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.smallItemCredits}>
                        <h2 className={styles.secondHeading}>Credits</h2>
                        <div className={styles.creditsContainer}>
                            <p className={styles.creditsCount}>{userInfo?.credits}</p>
                            <button className='button2 addButton'>+</button>
                        </div>
                    </div>
                </div>
                <div className={styles.bigItem}>
                    <h2 className={styles.secondHeading}>Plan</h2>
                    <p>Current plan: {userInfo?.plan ? userInfo.plan.toUpperCase() : 'Loading...'}</p>
                    {stripeDetails && (
                        <div>
                            <p>Payment Method: {stripeDetails.cardBrand.toUpperCase()} **** **** **** {stripeDetails.cardLast4}</p>
                            <p>Expires: {stripeDetails.cardExpiryMonth}/{stripeDetails.cardExpiryYear}</p>
                            {stripeDetails.renews_at ? (
                                <p>Renews at: {new Date(stripeDetails.renews_at * 1000).toLocaleDateString()}</p>
                            ) : (
                                <p>Plan Expires at: {new Date(stripeDetails.expires_at * 1000).toLocaleDateString()}</p>
                            )}
                        </div>
                    )}

                    {userInfo?.plan === 'free' && (
                        <div className={styles.prosAndCons}>
                            <ul className={styles.pros}>
                                <li>
                                    <p>Access to thousands of wallpapers</p>
                                </li>
                                <li>
                                    <p>Download up to 10 4K wallpapers per day</p>
                                </li>
                                <li>
                                    <p>Add wallpapers to favorites</p>
                                </li>
                            </ul>
                            <ul className={styles.cons}>
                                <li>
                                    <p>Free 8K wallpapers</p>
                                </li>
                                <li>
                                    <p>Daily credits</p>
                                </li>
                                <li>
                                    <p>Free custom wallpapers</p>
                                </li>
                            </ul>
                        </div>
                    )}
                    <div className={styles.buttonsWrapper}>
                        <button className='button2' onClick={() => window.location.href = '/upgrade'}>
                            {userInfo?.plan === 'free' ? 'Upgrade Now' : 'Change Plan'}
                        </button>
                        {userInfo?.plan !== 'free' && (
                            <button className='button2' onClick={handleCancelPlan}>
                                Cancel Plan
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
                            <button className='button2' onClick={confirmCancelPlan}>
                                Yes, Cancel Plan
                            </button>
                            <button className='button2' onClick={() => setIsCancelPlanModalOpen(false)}>
                                No, Keep Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
