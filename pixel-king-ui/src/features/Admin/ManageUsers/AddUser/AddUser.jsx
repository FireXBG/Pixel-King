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
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/authorizeUser`, { username, password });
            onUserAdded(); // Inform parent component to refresh the list
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error adding user:', error);
            setError('An error occurred while adding the user.');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Add User</h1>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add User</button>
            </form>
        </div>
    );
}
