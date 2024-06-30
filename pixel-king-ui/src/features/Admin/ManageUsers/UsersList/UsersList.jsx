import React from 'react';
import PropTypes from 'prop-types';
import styles from './UsersList.module.css';

export default function UsersList({ users, onDeleteUser }) {
    return (
        <div className={styles.usersListContainer}>
            <h1>Users List</h1>
            <ul>
                {users.map((user, index) => (
                    <li key={index} className={styles.usersListItem}>
                        {user.username}
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
        })
    ).isRequired,
    onDeleteUser: PropTypes.func.isRequired,
};
