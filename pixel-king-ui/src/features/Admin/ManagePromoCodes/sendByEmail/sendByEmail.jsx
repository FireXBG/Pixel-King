import React, { useState } from 'react';
import axios from 'axios';
import styles from './sendByEmail.module.css';

export default function SendEmailModal({ promoCode, onClose, onSend }) {
    const [modalEmail, setModalEmail] = useState('');

    const handleSendPromoCodeByEmail = async () => {
        if (modalEmail) {
            try {
                // Make the POST request to the backend to send the promo code via email
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/send-promo-code`, {
                    promoCode, // send the whole promoCode object
                    email: modalEmail
                });

                if (response.status !== 200) {
                    throw new Error('Failed to send promo code via email');
                }
                // Call the onSend callback to indicate success and close the modal
                onSend(modalEmail);
                onClose();

                alert('Promo code sent successfully');
            } catch (error) {
                console.error('Error sending promo code via email:', error);
                alert('Failed to send promo code. Please try again.');
            }
        } else {
            alert('Please enter a valid email.');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>X</button>
                <h2>Send Promo Code: {promoCode?.code}</h2>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Recipient Email:</label>
                    <input
                        type="email"
                        className={styles.input}
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="Enter recipient email"
                    />
                </div>
                <button className={styles.sendButton} onClick={handleSendPromoCodeByEmail}>
                    Send Promo Code
                </button>
            </div>
        </div>
    );
}
