import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // We'll store this on login
    const location = useLocation();

    if (!token) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && userRole !== 'admin') {
        // If they need admin access but don't have it, send them back to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
