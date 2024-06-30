import React, { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
    const [formStatus, setFormStatus] = useState(null); // null, 'success', or 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/contact`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setFormStatus('success');
                setMessage('Your message has been sent successfully!');
            } else {
                setFormStatus('error');
                setMessage('There was an error sending your message. Please try again.');
            }
        } catch (error) {
            setFormStatus('error');
            setMessage('There was an error sending your message. Please try again.');
        }
    };

    return (
        <div>
            <h1 className={styles.mainH1}>CONTACT US</h1>
            <div className={styles.contacts__wrapper}>
                <div className={styles.info__container}>
                    <h2>Empowering Creativity, One Pixel at a Time</h2>
                    <p>Email: example@example.com</p>
                    <p>Social: </p>
                </div>
                {formStatus === 'success' ? (
                    <p className={styles.successMessage}>{message}</p>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" required />
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                        <label htmlFor="message">Message:</label>
                        <textarea id="message" name="message" required></textarea>
                        <button type="submit">Submit</button>
                    </form>
                )}
                {formStatus === 'error' && (
                    <p className={styles.errorMessage}>{message}</p>
                )}
            </div>
        </div>
    );
}

export default Contact;
