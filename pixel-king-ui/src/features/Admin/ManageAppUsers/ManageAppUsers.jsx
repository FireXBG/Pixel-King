import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageAppUsers.module.css';
import EditUser from './EditUser/EditUser'; // Import the EditUser component

export default function ManageAppUsers() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        // Fetch all users when the component loads
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/all-users`); // Replace with your endpoint
                setUsers(response.data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Function to handle opening the edit modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    // Function to handle closing the edit modal
    const closeEditModal = () => {
        setSelectedUser(null);
        setIsEditModalOpen(false);
    };

    // Function to handle user update (handled in the EditUser component)
    const handleUpdateUser = (updatedUser) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user._id === updatedUser._id ? updatedUser : user
            )
        );
        closeEditModal();
    };

    return (
        <div className={styles.container}>
            <table className={styles.userTable}>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Credits (Pixels)</th>
                    <th>Stripe Account</th>
                    <th>Edit</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.plan}</td>
                        <td>{user.credits}</td>
                        <td>
                            {user.customer_id ? (
                                <a href={`https://dashboard.stripe.com/customers/${user.customer_id}`} target="_blank" rel="noopener noreferrer">
                                    View Stripe Account
                                </a>
                            ) : 'N/A'}
                        </td>
                        <td>
                            <button className={styles.editButton} onClick={() => openEditModal(user)}>Edit</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeButton} onClick={closeEditModal}>X</button>
                        <EditUser user={selectedUser} onSave={handleUpdateUser} />
                    </div>
                </div>
            )}
        </div>
    );
}
