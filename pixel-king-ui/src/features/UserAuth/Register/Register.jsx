import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false); // State to handle checkbox

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (!termsAccepted) {
            setError('You must accept the terms and conditions.');
            return;
        }

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
                <input name='username' placeholder='Create a username'/>
            </label>
            <label>
                Email
                <input name='email' type='email' placeholder='Enter your email'/>
            </label>
            <label>
                Password
                <input name='password' type='password' placeholder='Create a password' />
            </label>
            <label className={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                I accept the <a href="/terms" className={styles.link}>terms and conditions</a>.
            </label>
            <button className='button1' type='submit'>Register</button>
            <p>Already have an account? <button onClick={() => navigate('/login')} className={styles.link}>Login</button></p>
        </form>
    );
}
