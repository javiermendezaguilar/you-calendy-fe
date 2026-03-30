/**
 * Automatic Logout Utility
 * Handles automatic logout when cookies fail and APIs return 401/403 errors
 * Only triggers logout when multiple APIs fail (indicating cookie failure), not on single failures
 */

import { getCurrentUserContext } from './authUtils';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_URL || 'https://you-calendy-be.up.railway.app';

// Failure tracking for detecting cookie failures
const failureTracker = {
  failures: [],
  windowMs: 10000, // 10 second window
  threshold: 3, // Require 3+ failures before logout
  lastSuccessTime: null
};

/**
 * Track API failure
 * @param {string} url - The API URL that failed
 * @param {number} statusCode - HTTP status code
 */
const trackFailure = (url, statusCode) => {
  const now = Date.now();
  
  // Remove old failures outside the time window
  failureTracker.failures = failureTracker.failures.filter(
    failure => now - failure.timestamp < failureTracker.windowMs
  );
  
  // Add new failure
  failureTracker.failures.push({
    url,
    statusCode,
    timestamp: now
  });
};

/**
 * Track successful API call - reset failure counter
 */
export const trackSuccess = () => {
  failureTracker.lastSuccessTime = Date.now();
  failureTracker.failures = [];
};

/**
 * Check if we have enough failures to indicate cookie failure
 * @returns {boolean}
 */
const hasMultipleFailures = () => {
  const now = Date.now();
  
  // If we had a recent success, don't logout
  if (failureTracker.lastSuccessTime && 
      now - failureTracker.lastSuccessTime < failureTracker.windowMs) {
    return false;
  }
  
  // Check if we have enough failures in the time window
  return failureTracker.failures.length >= failureTracker.threshold;
};

/**
 * Validate cookie by calling /auth/me endpoint
 * @param {string} userType - 'admin', 'barber', or 'client'
 * @returns {Promise<boolean>}
 */
const validateCookie = async (userType) => {
  try {
    let endpoint = '/auth/me';
    if (userType === 'client') {
      endpoint = '/client/me';
    }
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Help backend choose the correct cookie when multiple are present
        'x-user-context': userType === 'admin' ? 'admin' : (userType === 'client' ? 'client' : 'barber')
      }
    });
    
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.warn('Cookie validation failed:', error.message);
    return false;
  }
};

/**
 * Determine user type based on current context and route
 * @param {string} url - The API URL that failed
 * @returns {string} - 'admin', 'barber', or 'client'
 */
const determineUserType = (url) => {
  // Check URL path to determine context
  if (url?.includes('/admin/')) {
    return 'admin';
  }
  
  if (url?.includes('/client/') && !url?.includes('/business/')) {
    return 'client';
  }
  
  // Check localStorage to determine context
  const context = getCurrentUserContext();
  return context || 'barber';
};

/**
 * Clear authentication cookie via backend API
 * This ensures cookies are properly cleared on the server side
 * @param {string} userType - 'admin', 'barber', or 'client'
 * @returns {Promise<void>}
 */
const clearAuthCookie = async (userType) => {
  try {
    // Use fetch instead of axios to avoid circular dependency
    // Call the appropriate logout endpoint to clear cookies
    if (userType === 'admin') {
      await fetch(`${baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({ userType: 'admin' })
      });
    } else if (userType === 'client') {
      await fetch(`${baseURL}/client/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({})
      });
    } else {
      // Barber/user logout
      await fetch(`${baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({ userType: 'user' })
      });
    }
  } catch (error) {
    // Even if logout API fails, continue with local cleanup
    console.warn('Logout API call failed, continuing with local cleanup:', error.message);
  }
};

/**
 * Clear localStorage authentication data
 * @param {string} userType - 'admin', 'barber', or 'client'
 */
const clearLocalAuthData = (userType) => {
  // Note: Tokens are stored in httpOnly cookies, cleared by backend
  if (userType === 'admin') {
    localStorage.removeItem('adminUser');
  } else if (userType === 'client') {
    localStorage.removeItem('clientId');
    localStorage.removeItem('client_data');
    localStorage.removeItem('client_invitation_token');
    localStorage.removeItem('client_business_id');
    localStorage.removeItem('client_staff_id');
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('businessName');
  }
  
  // Clear common auth-related data
  // Note: Tokens are stored in httpOnly cookies, cleared by backend
  localStorage.removeItem('invitationToken');
  localStorage.removeItem('businessId');
  localStorage.removeItem('clientStaffId');
  
  // Clear public profile data
  localStorage.removeItem('publicBusinessId');
  localStorage.removeItem('publicBarberData');
  localStorage.removeItem('publicStaffId');
  
  // Clear Google Analytics data
  localStorage.removeItem('ga_measurement_id');
  localStorage.removeItem('ga_connected');
  
  // Clear translation cache and language preference
  localStorage.removeItem('translationCache');
  localStorage.removeItem('batchTranslationCache');
  localStorage.removeItem('youCalendy_selectedLanguage');
  
  // Clear sessionStorage
  sessionStorage.clear();
};

/**
 * Get the appropriate redirect URL based on user type and current route
 * Preserves the current route for barber profile links, barber side, and admin side
 * @param {string} userType - 'admin', 'barber', or 'client'
 * @returns {string} - Redirect URL
 */
const getLoginPageUrl = (userType) => {
  const currentPath = window.location.pathname;
  
  // For client side (barber profile link) - preserve the barber profile link
  if (userType === 'client') {
    // Check if we're on a barber profile link (/barber/profile/:linkToken)
    if (currentPath.includes('/barber/profile/')) {
      return currentPath; // Return the same barber profile link
    }
    return '/client-session-expired';
  }
  
  // For admin side - preserve the current route
  if (userType === 'admin') {
    // If already on admin login, stay there, otherwise preserve current route
    if (currentPath === '/admin') {
      return '/admin';
    }
    // Preserve the current admin route
    return currentPath || '/admin';
  }
  
  // For barber side (business owner) - preserve the current route
  if (userType === 'barber') {
    // If already on login page, stay there, otherwise preserve current route
    if (currentPath === '/login' || currentPath.includes('/login')) {
      return '/login';
    }
    // Preserve the current barber route
    return currentPath || '/login';
  }
  
  // Fallback
  return '/login';
};

/**
 * Show appropriate logout message
 * @param {string} userType - 'admin', 'barber', or 'client'
 * @param {number} statusCode - HTTP status code (401, 403, or 404)
 */
const showLogoutMessage = (userType, statusCode) => {
  if (statusCode === 401) {
    toast.error('Your session has expired. Please log in again.');
  } else if (statusCode === 403) {
    toast.error('Access denied. Your session may have expired. Please log in again.');
  } else if (statusCode === 404) {
    toast.error('Authentication failed. Your session may have expired. Please log in again.');
  } else {
    toast.error('Authentication failed. Please log in again.');
  }
};

/**
 * Check if the current route is a public route that shouldn't trigger logout
 * @param {string} url - The API URL
 * @returns {boolean}
 */
const isPublicRoute = (url) => {
  if (!url) return false;
  
  const publicRoutes = [
    '/client/invitation/',
    '/appointments/available',
    '/business/public/',
    '/business/gallery/',
    '/business/hours/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/client/logout',
    '/auth/logout'
  ];
  
  return publicRoutes.some(route => url.includes(route));
};

/**
 * Check if we're already on a login page
 * @returns {boolean}
 */
const isOnLoginPage = () => {
  const path = window.location.pathname;
  return path.includes('/login') || 
         path.includes('/admin') && path === '/admin' ||
         path.includes('session-expired');
};

/**
 * Check if a 404 error is authentication-related (cookie failure)
 * When cookies fail, the backend returns 404 with "User not found" or "Client not found"
 * @param {object} error - Axios error object
 * @returns {boolean}
 */
const isAuthRelated404 = (error) => {
  if (error?.response?.status !== 404) {
    return false;
  }
  
  const errorMessage = (error?.response?.data?.message || '').toLowerCase();
  const url = error?.config?.url || error?.request?.responseURL || '';
  
  // Check if error message indicates authentication failure
  const authRelatedMessages = [
    'user not found',
    'client not found',
    'not logged in',
    'session expired',
    'authentication failed'
  ];
  
  const isAuthMessage = authRelatedMessages.some(msg => errorMessage.includes(msg));
  
  // Check if this is an authenticated endpoint (not a public route)
  const isAuthenticatedEndpoint = !isPublicRoute(url) && 
                                  (url.includes('/business/') || 
                                   url.includes('/admin/') || 
                                   url.includes('/appointments/') ||
                                   url.includes('/client/') && !url.includes('/client/invitation/'));
  
  return isAuthMessage && isAuthenticatedEndpoint;
};

let isLoggingOut = false;

/**
 * Handle automatic logout when multiple APIs fail (indicating cookie failure)
 * Only triggers logout when multiple failures occur, not on single API failures
 * 
 * @param {object} error - Axios error object
 * @param {object} config - Axios request config
 * @returns {Promise<void>}
 */
export const handleAutoLogout = async (error, config = {}) => {
  if (isLoggingOut) {
    return;
  }
  
  if (isOnLoginPage()) {
    return;
  }
  
  const statusCode = error?.response?.status;
  const url = error?.config?.url || config?.url || error?.request?.responseURL;
  
  const isAuthError = statusCode === 401 || 
                      statusCode === 403 || 
                      (statusCode === 404 && isAuthRelated404(error));
  
  if (!isAuthError) {
    return;
  }
  
  if (isPublicRoute(url)) {
    return;
  }
  
  if (url?.includes('/notifications') && statusCode === 401) {
    return;
  }
  
  if (!error?.response && (error?.code === 'NETWORK_ERROR' || error?.message === 'Network Error')) {
    return;
  }
  
  if (statusCode >= 500) {
    return;
  }
  
  // Track this failure
  trackFailure(url, statusCode);
  
  // Only proceed if we have multiple failures (indicating cookie issue)
  if (!hasMultipleFailures()) {
    console.log(`API failure tracked (${failureTracker.failures.length}/${failureTracker.threshold}). Waiting for more failures before logout.`);
    return;
  }
  
  // Validate cookie before logging out
  const userType = determineUserType(url);
  const isCookieValid = await validateCookie(userType);
  
  if (isCookieValid) {
    // Cookie is valid, reset failure tracker
    trackSuccess();
    console.log('Cookie validation passed. Resetting failure tracker.');
    return;
  }
  
  // Cookie is invalid and we have multiple failures - proceed with logout
  isLoggingOut = true;
  
  try {
    console.warn(`Multiple API failures detected (${failureTracker.failures.length}) and cookie validation failed for ${userType} side. Initiating automatic logout.`);
    
    await clearAuthCookie(userType);
    clearLocalAuthData(userType);
    showLogoutMessage(userType, statusCode);
    
    const loginUrl = getLoginPageUrl(userType);
    window.location.href = loginUrl;
    
  } catch (logoutError) {
    console.error('Error during automatic logout:', logoutError);
    const userType = determineUserType(url);
    const loginUrl = getLoginPageUrl(userType);
    window.location.href = loginUrl;
  } finally {
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

/**
 * Check if automatic logout is currently in progress
 * @returns {boolean}
 */
export const isAutoLogoutInProgress = () => {
  return isLoggingOut;
};

