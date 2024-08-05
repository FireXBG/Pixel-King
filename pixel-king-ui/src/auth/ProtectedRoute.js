import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, userRole } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" />;
    }

    if (roles && roles.length > 0 && !roles.includes(userRole)) {
        return <Navigate to="/admin/wallpapers" />;
    }

    return children;
};

export default ProtectedRoute;
