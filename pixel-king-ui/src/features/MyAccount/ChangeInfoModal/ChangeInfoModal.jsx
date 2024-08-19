import styles from './ChangeInfoModal.module.css';
import { useState } from "react";

export default function ChangeInfoModal({ onClose, username, email }) {
    const [currentUsername, setCurrentUsername] = useState(username);
    const [currentEmail, setCurrentEmail] = useState(email);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setCurrentUsername(value);
        } else if (name === 'email') {
            setCurrentEmail(value);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const newUsername = currentUsername;
        const newEmail = currentEmail;

        console.log('Updated Username:', newUsername);
        console.log('Updated Email:', newEmail);

        onClose();
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Change Info</h2>
                <form onSubmit={handleSubmit}>
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
                    <div className={styles.buttonsWrapper}>
                        <button type="submit" className='button2'>Save Changes</button>
                        <button type="button" onClick={onClose} className='button2'>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
