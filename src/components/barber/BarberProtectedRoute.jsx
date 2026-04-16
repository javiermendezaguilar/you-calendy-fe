import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isBarberAuthenticated, clearAuthData } from '../../utils/authUtils';

const BarberProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if barber is authenticated
  if (!isBarberAuthenticated()) {
    // Clear any invalid auth data
    clearAuthData("barber");
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default BarberProtectedRoute;
