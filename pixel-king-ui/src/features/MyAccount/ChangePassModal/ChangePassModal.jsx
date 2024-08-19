import styles from './ChangePassModal.module.css';
import { useState } from "react";
import axios from "axios";
import AdminMessage from "../../../core/adminMessage/adminMessage";

export default function ChangePasswordModal({ onClose }) {
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/updatePassword`, data, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            });
            onClose();
        } catch (error) {
            console.error('Error during password update:', error);
            setError(error.response.data.error);
        }
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Change Password</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label>
                        Current Password:
                        <input type="password" name="currentPassword" />
                    </label>
                    <label>
                        New Password:
                        <input type="password" name="newPassword" />
                    </label>
                    {error && (
                        <p className={styles.errorMessage}>
                            <AdminMessage
                                title="Error updating password"
                                message={error}
                                onClose={() => setError('')}
                            />
                        </p>
                    )}
                    <div className={styles.buttonsWrapper}>
                        <button type="submit" className='button2'>Save Changes</button>
                        <button type="button" onClick={onClose} className='button2'>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
