import React, { useState, useEffect } from 'react';
import styles from './adminMessage.module.css';

export default function AdminMessage({ title, message, onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 500); // Match the duration of the slide-out animation
    };

    return (
        <div className={`${styles.adminMessage} ${isExiting ? styles.exiting : ''}`} onClick={handleClose}>
            <div className={styles.adminMessageContent}>
                <div>
                    <h2>{title}</h2>
                </div>
                <div className={styles.adminMessageContentBody}>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}
