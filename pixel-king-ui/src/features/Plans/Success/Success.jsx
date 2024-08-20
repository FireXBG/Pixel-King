import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Success.module.css';

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [sessionDetails, setSessionDetails] = useState(null);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        const verifySession = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/verify-session?session_id=${sessionId}`);
                const data = await response.json();

                if (data.success) {
                    setSuccess(true);
                    setSessionDetails(data.session);
                } else {
                    setSuccess(false);
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [searchParams]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!success) {
        return <div className={styles.failed}>Payment verification failed. Please try again or contact support.</div>;
    }

    // Ensure sessionDetails is defined before accessing its properties
    if (!sessionDetails) {
        return <div>Error loading session details. Please try again.</div>;
    }

    return (
        <div className={styles.main}>
            <h1 className='mainH1'>Payment Successful!</h1>
            <div>
                <p className={styles.p}>Thank you for your purchase!</p>
                <p className={styles.p}>Your payment of ${(sessionDetails.amount_total / 100).toFixed(2)} was successful.</p>
            </div>
        </div>
    );
};

export default SuccessPage;
