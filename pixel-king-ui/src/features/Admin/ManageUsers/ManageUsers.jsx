import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageUsers.module.css';
import AddUser from './AddUser/AddUser';
import UsersList from './UsersList/UsersList';

function ManageUsers() {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`);
            setUsers(response.data.users);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleAddUserClick = () => {
        setShowAddUserModal(true);
    };

    const handleCloseModal = () => {
        setShowAddUserModal(false);
    };

    const handleUserAdded = () => {
        fetchUsers(); // Refresh the list of users
        setShowAddUserModal(false); // Close the modal
    };

    const handleDeleteUser = async (username) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/${username}`);
            fetchUsers(); // Refresh the list of users
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className={styles.container}>
            <button onClick={handleAddUserClick}>Add user</button>
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <UsersList users={users} onDeleteUser={handleDeleteUser} />
            )}
            {showAddUserModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <button onClick={handleCloseModal} className={styles.closeButton}>X</button>
                        <AddUser onClose={handleCloseModal} onUserAdded={handleUserAdded} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
