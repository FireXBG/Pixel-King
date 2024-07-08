import React, { useState } from 'react';
import axios from 'axios';
import styles from './AddUser.module.css';

export default function AddUser({ onClose, onUserAdded }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/authorizeUser`, { username, password });
            onUserAdded(); // Inform parent component to refresh the list
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error adding user:', error);
            setError('An error occurred while adding the user.');
        }
    };

    return (
        <div className={styles.addUserContainer}>
            <h1>Add User</h1>
            {error && <p className={styles.addUserError}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.addUserForm}>
                <div className={styles.addUserFormGroup}>
                    <label className={styles.addUserLabel}>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={styles.addUserInput}
                    />
                </div>
                <div className={styles.addUserFormGroup}>
                    <label className={styles.addUserLabel}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.addUserInput}
                    />
                </div>
                <button type="submit" className={styles.addUserButton}>Add User</button>
            </form>
        </div>
    );
}
