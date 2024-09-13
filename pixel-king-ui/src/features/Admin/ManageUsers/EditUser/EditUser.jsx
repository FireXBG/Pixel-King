import React, { useState } from 'react';
import axios from 'axios';
import styles from './EditUser.module.css';

export default function EditUser({ user, onClose, onUserUpdated }) {
    const [username, setUsername] = useState(user.username); // old username
    const [newUsername, setNewUsername] = useState(user.username); // new username
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(user.role);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send all the data to the backend
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user.username}`, {
                oldUsername: username, // old username
                newUsername, // new username
                password,
                role
            });
            console.log("Response from server:", response.data); // Log response
            onUserUpdated(); // Inform parent component to refresh the list
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error updating user:', error);
            setError('An error occurred while updating the user.');
        }
    };

    return (
        <div className={styles.editUserContainer}>
            <h1>Edit User</h1>
            {error && <p className={styles.editUserError}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.editUserForm}>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Old Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={styles.editUserInput}
                    />
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>New Username:</label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                        className={styles.editUserInput}
                    />
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Password (leave blank to keep current password):</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.editUserInput}
                    />
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className={styles.editUserInput}
                    >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className={styles.editUserButton}>Update User</button>
            </form>
        </div>
    );
}
