import React, { useContext, useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../auth/AuthContext';
import PixelsContext from '../../../context/pixelsContext'; // Import PixelsContext

export default function Login() {
    const { userLogin } = useContext(AuthContext);
    const { updatePixels } = useContext(PixelsContext); // Access updatePixels from PixelsContext
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, data);

            const token = response.data;

            if (token) {
                userLogin(token); // Call userLogin to save the token and login the user
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
            <h2 className={styles.heading}>Login</h2>
            <label>
                Username
                <input name='username' placeholder='Enter your username'/>
            </label>
            <label>
                Password
                <input name='password' type='password' placeholder='Enter your password' />
            </label>
            <button className='button1' type='submit'>Login</button>
            <p className={styles.p}>Don't have an account? <button onClick={() => navigate('/register')} className={styles.link}>Register</button></p>
            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
}
