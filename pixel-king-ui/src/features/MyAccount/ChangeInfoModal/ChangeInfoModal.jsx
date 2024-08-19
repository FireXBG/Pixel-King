import styles from './ChangeInfoModal.module.css';
import { useState } from "react";
import axios from "axios";
import AdminMessage from "../../../core/adminMessage/adminMessage";

export default function ChangeInfoModal({ onClose, username, email }) {
    const [currentUsername, setCurrentUsername] = useState(username);
    const [currentEmail, setCurrentEmail] = useState(email);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setCurrentUsername(value);
        } else if (name === 'email') {
            setCurrentEmail(value);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newUsername = currentUsername;
        const newEmail = currentEmail;

        console.log('Updated Username:', newUsername);
        console.log('Updated Email:', newEmail);

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/updateUserInfo`, {
                username: newUsername,
                email: newEmail
            }, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                }
            })

            onClose();
        } catch (error) {
            console.error('Error during user info update:', error);
            setError(error.response.data.error);
        }
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Change Info</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input
                            type="text"
                            name="username"
                            value={currentUsername}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={currentEmail}
                            onChange={handleInputChange}
                        />
                    </label>
                    {error && <p className={styles.errorMessage}>
                        <AdminMessage
                            title='Error updating user'
                            message={error}
                            onClose={() => setError('')}
                        />
                    </p>}
                    <div className={styles.buttonsWrapper}>
                        <button type="submit" className='button2'>Save Changes</button>
                        <button type="button" onClick={onClose} className='button2'>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
