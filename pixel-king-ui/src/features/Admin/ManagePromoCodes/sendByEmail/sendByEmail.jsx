import React, { useState } from 'react';
import styles from './sendByEmail.module.css';

export default function SendEmailModal({ promoCode, onClose, onSend }) {
    const [modalEmail, setModalEmail] = useState('');

    const handleSendPromoCodeByEmail = () => {
        if (modalEmail) {
            onSend(modalEmail);
            onClose();
        } else {
            alert('Please enter a valid email.');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>X</button>
                <h2>Send Promo Code: {promoCode.code}</h2>
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