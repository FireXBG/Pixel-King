import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // New loading state
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            if (token && role) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setIsAuthenticated(true);
                setUserRole(role);
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
            }

            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
                setIsUserAuthenticated(true);
            } else {
                setIsUserAuthenticated(false);
            }

            setLoading(false); // Authentication check is complete
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const login = (token, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        setUserRole(role);
        navigate('/admin/wallpapers');
    };

    const userLogin = (token) => {
        localStorage.setItem('userToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsUserAuthenticated(true);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUserRole(null);
        navigate('/admin/login');
    };

    const userLogout = () => {
        localStorage.removeItem('userToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsUserAuthenticated(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            login,
            logout,
            isUserAuthenticated,
            userLogin,
            userLogout,
            loading, // Expose loading state
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
