import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
            <h2 className={styles.heading}>NICE TO MEET YOU!</h2>
            {error && <p className={styles.error}>{error}</p>}

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
                    name='email'
                    type='email'
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label className={`${styles.label} ${email && styles.filled}`}>
                    Email
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

            <label className={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <p className={styles.linkP}>I accept the <a href="/privacy" className={styles.link}>Privacy Policy</a>.</p>
            </label>

            <button className='button1' type='submit'>Register</button>

            <p className={styles.p}>Already have an account?
                <button onClick={() => navigate('/login')} className={styles.link}>
                    Login
                </button>
            </p>
        </form>
    );
}
