import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated, clearAuthData } from '../../utils/authUtils';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if admin is authenticated
  if (!isAdminAuthenticated()) {
    // Clear any invalid auth data
    clearAuthData('admin');
    // Redirect to admin login page (/admin) if not authenticated
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  
  // User is authenticated and has admin privileges
  return children;
};

export default AdminProtectedRoute;
