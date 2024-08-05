import React from 'react';
import PropTypes from 'prop-types';
import styles from './UsersList.module.css';

export default function UsersList({ users, onDeleteUser, onRoleChange }) {
    const handleRoleChange = (username, newRole) => {
        onRoleChange(username, newRole);
    };

    return (
        <div className={styles.usersListContainer}>
            <h1>Users List</h1>
            <ul>
                {users.map((user, index) => (
                    <li key={index} className={styles.usersListItem}>
                        <span>{user.username}</span>
                        <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.username, e.target.value)}
                            className={styles.roleSelect}
                        >
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            className={styles.usersListDeleteButton}
                            onClick={() => onDeleteUser(user.username)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

UsersList.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            username: PropTypes.string.isRequired,
            role: PropTypes.string.isRequired,
        })
    ).isRequired,
    onDeleteUser: PropTypes.func.isRequired,
    onRoleChange: PropTypes.func.isRequired,
};
