import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ManageEmails.module.css';
import AddEmailModal from './AddEmailModal/AddEmailModal';

export default function ManageEmails() {
    const [emails, setEmails] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/emails`);
                setEmails(response.data.emails);
            } catch (error) {
                console.error('Error fetching emails:', error);
            }
        };

        fetchEmails();
    }, []);

    const handleAddEmailClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <button className='admin__button' onClick={handleAddEmailClick}>Add Email</button>
            <ul>
                {emails.map(email => (
                    <li key={email._id}>
                        <p>{email.email}</p>
                    </li>
                ))}
            </ul>
            {showModal && <AddEmailModal onClose={handleCloseModal} />}
        </>
    );
}
