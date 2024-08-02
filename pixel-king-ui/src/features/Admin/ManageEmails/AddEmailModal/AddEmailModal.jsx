import React, { useState } from 'react';
import styles from './AddEmailModal.module.css';
import axios from 'axios';

export default function AddEmailModal({ onClose, onAddEmail }) {
    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleAddEmail = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/emails`, { email });
            onAddEmail();
            onClose();
        } catch (error) {
            console.error('Error adding email:', error);
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                <button onClick={handleAddEmail}>Add Email</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
