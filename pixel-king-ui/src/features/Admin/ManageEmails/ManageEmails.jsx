import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ManageEmails.module.css';
import AddEmailModal from './AddEmailModal/AddEmailModal';

export default function ManageEmails() {
    const [emails, setEmails] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchEmails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/emails`);
            setEmails(response.data.emails);
        } catch (error) {
            console.error('Error fetching emails:', error);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleAddEmailClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDeleteEmail = async (email) => {
        console.log('Delete email clicked:', email); // Debugging log
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/emails/${email}`);
            console.log('Email deleted successfully'); // Debugging log
            fetchEmails(); // Refetch emails after deletion
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    };

    return (
        <>
            <button className='admin__button' onClick={handleAddEmailClick}>Add Email</button>
            <ul className={styles.ul}>
                {emails.map(email => (
                    <li key={email._id} className={styles.li}>
                        <p>{email.email}</p>
                        <button
                            className='admin__button'
                            onClick={() => handleDeleteEmail(email.email)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            {showModal && <AddEmailModal onClose={handleCloseModal} onAddEmail={fetchEmails} />}
        </>
    );
}
