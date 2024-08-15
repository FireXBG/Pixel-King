import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, isUserAuthenticated, userRole } = useContext(AuthContext);

    if (!isUserAuthenticated && !isAuthenticated) {
        return roles && roles.includes('admin') ? <Navigate to="/admin/login" /> : <Navigate to="/login" />;
    }

    if (roles && roles.length > 0) {
        if (roles.includes('admin') && userRole !== 'admin') {
            return <Navigate to="/" />;
        }
    }

    return children;
};

export default ProtectedRoute;