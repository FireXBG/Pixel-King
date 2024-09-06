import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const PixelsContext = createContext();

export const PixelsProvider = ({ children }) => {
    const [pixels, setPixels] = useState('...'); // Initial pixel count placeholder

    // Fetch the user's pixel count from the backend
    const fetchPixels = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/account-details`, {
                headers: {
                    Authorization: localStorage.getItem('userToken'),
                },
            });
            setPixels(response.data.credits); // Set pixel count from backend
        } catch (error) {
            console.error('Error fetching user pixels:', error);
            setPixels(0); // Set to 0 on error
        }
    };

    // Call fetchPixels when the component mounts
    useEffect(() => {
        fetchPixels();
    }, []);

    // Function to fetch updated pixels after an action
    const updatePixels = async () => {
        await fetchPixels(); // Just re-fetch the updated pixels from the backend
    };

    return (
        <PixelsContext.Provider value={{ pixels, updatePixels }}>
            {children}
        </PixelsContext.Provider>
    );
};

export default PixelsContext;
