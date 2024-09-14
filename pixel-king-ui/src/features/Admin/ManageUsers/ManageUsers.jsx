import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageUsers.module.css';
import AddUser from './AddUser/AddUser';
import EditUser from './EditUser/EditUser';
import UsersList from './UsersList/UsersList';

function ManageUsers() {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/apixq/users`);
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
        setShowEditUserModal(false);
    };

    const handleUserAdded = () => {
        fetchUsers();
        setShowAddUserModal(false);
    };

    const handleUserUpdated = () => {
        fetchUsers();
        setShowEditUserModal(false);
    };

    const handleDeleteUser = async (username) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/${username}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleRoleChange = async (username, newRole) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${username}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleEditUserClick = (user) => {
        setSelectedUser(user);
        setShowEditUserModal(true);
    };

    return (
        <div className={styles.container}>
            <button className='admin__button' onClick={handleAddUserClick}>Add user</button>
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <UsersList users={users} onDeleteUser={handleDeleteUser} onRoleChange={handleRoleChange} onEditUserClick={handleEditUserClick} />
            )}
            {showAddUserModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <button onClick={handleCloseModal} className={styles.closeButton}>X</button>
                        <AddUser onClose={handleCloseModal} onUserAdded={handleUserAdded} />
                    </div>
                </div>
            )}
            {showEditUserModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <button onClick={handleCloseModal} className={styles.closeButton}>X</button>
                        <EditUser user={selectedUser} onClose={handleCloseModal} onUserUpdated={handleUserUpdated} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
