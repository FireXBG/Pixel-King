import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManagePromoCodes.module.css';
import SendEmailModal from './sendByEmail/sendByEmail'; // Assuming this is your modal component

export default function ManagePromoCodes() {
    const [email, setEmail] = useState('');
    const [pixels, setPixels] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [promoCodesList, setPromoCodesList] = useState([]);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [selectedPromoCode, setSelectedPromoCode] = useState(null);
    const [modalEmail, setModalEmail] = useState('');

    // Fetch promo codes on component mount
    useEffect(() => {
        const fetchPromoCodes = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/promo-codes`);
                setPromoCodesList(response.data.promoCodes);
            } catch (error) {
                console.error('Error fetching promo codes:', error);
            }
        };

        fetchPromoCodes();
    }, []);

    // Generate promo code
    const generatePromoCode = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/promo-codes/generate`, {
                pixels
            });
            setPromoCodesList([...promoCodesList, response.data.promoCode]);
            setPixels(0);
            setPromoCode(response.data.promoCode.code);
        } catch (error) {
            console.error('Error generating promo code:', error);
        }
    };

    // Open the email modal
    const openSendEmailModal = (promoCode) => {
        setSelectedPromoCode(promoCode);
        setIsSendModalOpen(true);
    };

    // Close the email modal
    const closeSendEmailModal = () => {
        setIsSendModalOpen(false);
        setSelectedPromoCode(null);
        setModalEmail('');
    };

    // Delete promo code
    const deletePromoCode = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/promo-codes/${id}`);
            setPromoCodesList(promoCodesList.filter((promo) => promo._id !== id));
        } catch (error) {
            console.error('Error deleting promo code:', error);
        }
    };

    // Handle sending promo code by email
    const handleSendPromoCodeByEmail = async (email) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/promo-codes/send-email`, {
                code: selectedPromoCode.code,
                email: email
            });
            alert('Promo code sent successfully');
            closeSendEmailModal();
        } catch (error) {
            console.error('Error sending promo code via email:', error);
            alert('Failed to send promo code. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Promo Codes</h1>

            {/* Section for generating a promo code */}
            <div className={styles.section}>
                <h2>Generate Promo Code</h2>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Pixels (Credits):</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={pixels}
                        onChange={(e) => setPixels(e.target.value)}
                        placeholder="Enter pixels amount"
                    />
                </div>
                <button className={styles.generateButton} onClick={generatePromoCode}>
                    Generate Promo Code
                </button>
                {promoCode && <p className={styles.successMessage}>Generated Code: {promoCode}</p>}
            </div>

            {/* Section for managing promo codes */}
            <div className={styles.section}>
                <h2>Manage Promo Codes</h2>
                {promoCodesList.length === 0 ? (
                    <p>No promo codes available.</p>
                ) : (
                    <table className={styles.promoTable}>
                        <thead>
                        <tr>
                            <th>Promo Code</th>
                            <th>Pixels</th>
                            <th>Expiration Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {promoCodesList.map((promo) => (
                            <tr key={promo._id}>
                                <td>{promo.code}</td>
                                <td>{promo.pixels}</td>
                                <td>{promo.expirationDate ? new Date(promo.expirationDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{promo.isActive ? 'Active' : 'Inactive'}</td>
                                <td>
                                    <button className={styles.emailButton} onClick={() => openSendEmailModal(promo)}>Send by Email</button>
                                    <button className={styles.deleteButton} onClick={() => deletePromoCode(promo._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for sending promo code by email */}
            {isSendModalOpen && (
                <SendEmailModal
                    promoCode={selectedPromoCode}
                    onClose={closeSendEmailModal}
                    onSend={handleSendPromoCodeByEmail}
                />
            )}
        </div>
    );
}
