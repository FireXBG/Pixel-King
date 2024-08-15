import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/register`, data);
            if (response.status === 201) {
                navigate('/login');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
            console.error('Registration failed:', error);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.heading}>Register</h2>
            {error && <p className={styles.error}>{error}</p>}
            <label>
                Username
                <input name='username' />
            </label>
            <label>
                Email
                <input name='email' type='email' />
            </label>
            <label>
                Password
                <input name='password' type='password' />
            </label>
            <button className='button1' type='submit'>Register</button>
            <p>Already have an account? <button onClick={() => navigate('/login')} className={styles.link}>Login</button></p>
        </form>
    );
}