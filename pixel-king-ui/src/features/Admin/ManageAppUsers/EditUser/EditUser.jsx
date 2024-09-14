import React, { useState } from 'react';
import axios from 'axios';
import styles from './EditUser.module.css';

export default function EditUser({ user, onSave }) {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [plan, setPlan] = useState(user?.plan || 'Free');
    const [credits, setCredits] = useState(user?.credits || 0);

    const handleSave = async () => {
        const updatedUser = {
            ...user,
            username,
            email,
            plan,
            credits
        };

        console.log("Updated user data being sent to backend:", updatedUser);

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/users/edit/${user._id}`,  // Pass the correct user ID
                updatedUser
            );
            console.log('User updated successfully:', response.data);
            onSave(response.data.updatedUser); // Call onSave to update parent component
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    return (
        <div className={styles.editUserContainer}>
            <h2>Edit User: {user?.username}</h2>
            <form className={styles.editUserForm}>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Username:</label>
                    <input
                        type="text"
                        className={styles.editUserInput}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Email:</label>
                    <input
                        type="email"
                        className={styles.editUserInput}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Plan:</label>
                    <select
                        className={styles.editUserInput}
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                    >
                        <option value="Free">Free</option>
                        <option value="Premium">Premium</option>
                        <option value="King">King</option>
                    </select>
                </div>
                <div className={styles.editUserFormGroup}>
                    <label className={styles.editUserLabel}>Credits (Pixels):</label>
                    <input
                        type="number"
                        className={styles.editUserInput}
                        value={credits}
                        onChange={(e) => setCredits(e.target.value)}
                    />
                </div>
                <button type="button" className={styles.editUserButton} onClick={handleSave}>
                    Save
                </button>
            </form>
        </div>
    );
}
