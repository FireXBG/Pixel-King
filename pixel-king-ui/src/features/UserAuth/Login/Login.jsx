import React, { useContext, useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../auth/AuthContext';
import PixelsContext from '../../../context/pixelsContext';

export default function Login() {
    const { userLogin } = useContext(AuthContext);
    const { updatePixels } = useContext(PixelsContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, data);

            const token = response.data;

            if (token) {
                userLogin(token);
                updatePixels();
                navigate('/account');
            } else {
                throw new Error('Token not found in response');
            }
        } catch (error) {
            setError('Invalid credentials');
            console.error('Login failed:', error);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.heading}>WELCOME BACK!</h2>

            <div className={`${styles.inputWrapper}`}>
                <input
                    name='username'
                    className={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label className={`${styles.label} ${username && styles.filled}`}>
                    Username
                </label>
            </div>

            <div className={`${styles.inputWrapper}`}>
                <input
                    name='password'
                    type='password'
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label className={`${styles.label} ${password && styles.filled}`}>
                    Password
                </label>
            </div>

            <button className='button1' type='submit'>LOGIN</button>
            <p className={styles.p}>DON'T HAVE AN ACCOUNT?
                <button onClick={() => navigate('/register')} className={styles.link}>
                    REGISTER
                </button>
            </p>
            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
}
