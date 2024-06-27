import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../auth/AuthContext';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/login`, { username, password });
            if (response.status === 200) {
                login(response.data.token);
            } else {
                console.error('Login failed');
                setError(true);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError(true);
        }
    };

    return (
        <div className={styles.login__container}>
            <h1>Admin Login</h1>
            <form className={styles.login__form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>Error: Invalid Credentials</p>}
        </div>
    );
}
