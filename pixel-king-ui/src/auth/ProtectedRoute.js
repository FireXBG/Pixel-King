import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, userRole, loading } = useContext(AuthContext);

    // Logging the current status for debugging
    console.log('ProtectedRoute Debug:', {
        isAuthenticated,
        userRole,
        roles,
        loading
    });

    if (loading) {
        return <div>Loading...</div>; // Keep this until the authentication check is done
    }

    // Redirect to admin login if not authenticated and accessing admin roles
    if (!isAuthenticated && roles && roles.includes('admin')) {
        return <Navigate to="/admin/login" />;
    }

    // Redirect if user role doesn't match the required roles
    if (roles && roles.length > 0 && !roles.includes(userRole)) {
        console.log('Redirecting to / because of role mismatch');
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
