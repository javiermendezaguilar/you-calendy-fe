import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authManager from '../utils/authManager';
import { getCurrentUserContext } from '../utils/authUtils';

/**
 * Hook to manage authentication state and handle auth events
 */
export const useAuthManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthLogout = useCallback((event) => {
    const { reason } = event.detail || {};
    console.log('Authentication logout detected:', reason);
    
    // Determine redirect path based on current context and preserve current route
    const userContext = getCurrentUserContext();
    const currentPath = location.pathname;
    let redirectPath = '/login';
    
    if (userContext === 'admin') {
      // For admin side - preserve the current route
      if (currentPath === '/admin') {
        redirectPath = '/admin';
      } else {
        // Preserve the current admin route
        redirectPath = currentPath || '/admin';
      }
    } else if (userContext === 'client') {
      // For client side (barber profile link) - preserve the barber profile link
      if (currentPath.includes('/barber/profile/')) {
        redirectPath = currentPath; // Return the same barber profile link
      } else {
        redirectPath = '/client-session-expired';
      }
    } else {
      // For barber side (business owner) - preserve the current route
      if (currentPath === '/login' || currentPath.includes('/login')) {
        redirectPath = '/login';
      } else {
        // Preserve the current barber route
        redirectPath = currentPath || '/login';
      }
    }
    
    // Only redirect if not already on a login page
    if (!location.pathname.includes('login') && !location.pathname.includes('session-expired')) {
      navigate(redirectPath, { 
        replace: true,
        state: { 
          message: reason === 'session_expired' 
            ? 'Your session has expired. Please log in again.' 
            : 'You have been logged out.'
        }
      });
    }
  }, [navigate, location.pathname]);

  const handleAuthLogin = useCallback(() => {
    console.log('Authentication login detected');
    // You can add any post-login logic here
  }, []);

  useEffect(() => {
    // Initialize auth manager
    authManager.init();

    // Listen for auth events
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:login', handleAuthLogin);

    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:login', handleAuthLogin);
      authManager.stopHeartbeat();
    };
  }, [handleAuthLogout, handleAuthLogin]);

  return {
    authManager,
    getSessionInfo: () => authManager.getSessionInfo(),
    validateSession: () => authManager.validateCurrentSession(),
    refreshToken: () => authManager.refreshToken()
  };
};

/**
 * Hook for components that need to monitor session status
 */
export const useSessionMonitor = () => {
  const { getSessionInfo } = useAuthManager();
  
  return {
    getSessionInfo,
    isSessionValid: () => {
      const info = getSessionInfo();
      return info?.isValid || false;
    },
    isSessionNearExpiry: () => {
      const info = getSessionInfo();
      return info?.isNearExpiry || false;
    },
    getTimeUntilExpiry: () => {
      const info = getSessionInfo();
      return info?.timeUntilExpiry || 0;
    }
  };
};

export default useAuthManager;