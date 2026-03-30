// Utility functions for authentication checks

/**
 * Check if user is authenticated as a barber
 * @returns {boolean}
 * Note: Authentication is handled via httpOnly cookies. This checks for user data presence.
 */
export const isBarberAuthenticated = () => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return false;
  }
  
  try {
    const user = JSON.parse(userStr);
    // If there's a role field, check if it's barber or admin
    // If no role field, assume all authenticated users are barbers
    if (user.role && user.role !== 'barber' && user.role !== 'admin') {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error parsing barber user data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated as a client
 * @returns {boolean}
 * Note: Authentication is handled via httpOnly cookies. This checks for clientId presence.
 */
export const isClientAuthenticated = () => {
  const clientId = localStorage.getItem('clientId');
  
  // Client authentication is based on having clientId (token is in cookie)
  return !!clientId;
};

/**
 * Check if user is authenticated as an admin
 * @returns {boolean}
 * Note: Authentication is handled via httpOnly cookies. This checks for admin user data presence.
 */
export const isAdminAuthenticated = () => {
  const adminUserStr = localStorage.getItem('adminUser');
  
  if (!adminUserStr) {
    return false;
  }
  
  try {
    const adminUser = JSON.parse(adminUserStr);
    // Check if user has admin or sub-admin role
    if (adminUser.role !== 'admin' && adminUser.role !== 'sub-admin') {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error parsing admin user data:', error);
    return false;
  }
};

/**
 * Get current user data
 * @param {string} userType - 'barber', 'client', or 'admin'
 * @returns {object|null}
 */
export const getCurrentUser = (userType = 'barber') => {
  try {
    if (userType === 'admin') {
      const adminUserStr = localStorage.getItem('adminUser');
      return adminUserStr ? JSON.parse(adminUserStr) : null;
    } else {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Clear authentication data while preserving important non-auth data
 * @param {string} userType - 'barber', 'client', or 'admin'
 * @param {boolean} preserveBusinessData - Whether to preserve business-related data
 */
export const clearAuthData = (userType = 'barber', preserveBusinessData = true) => {
  // Note: Tokens are stored in httpOnly cookies, cleared by backend
  if (userType === 'admin') {
    localStorage.removeItem('adminUser');
  } else if (userType === 'client') {
    localStorage.removeItem('clientId');
    
    // Only clear client-related data if not preserving business data
    if (!preserveBusinessData) {
      localStorage.removeItem('client_invitation_token');
      localStorage.removeItem('client_business_id');
      localStorage.removeItem('client_staff_id');
      localStorage.removeItem('client_data');
      localStorage.removeItem('invitationToken');
      localStorage.removeItem('businessId');
      localStorage.removeItem('clientStaffId');
    }
  } else {
    localStorage.removeItem('user');
    
    // Only clear business data if not preserving
    if (!preserveBusinessData) {
      localStorage.removeItem('businessName');
    }
  }
  // Note: Tokens are stored in httpOnly cookies, cleared by backend
};

/**
 * Safely clear all authentication data (for complete logout)
 * @param {string} userType - 'barber', 'client', or 'admin'
 */
export const clearAllAuthData = (userType = 'barber') => {
  // Clear user-specific data
  clearAuthData(userType, false);
  
  // Clear all common auth-related data
  // Note: Tokens are stored in httpOnly cookies, cleared by backend
  localStorage.removeItem('clientId');
  localStorage.removeItem('client_invitation_token');
  localStorage.removeItem('client_business_id');
  localStorage.removeItem('client_staff_id');
  localStorage.removeItem('client_data');
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
 * Preserve important localStorage data during auth operations
 * @returns {object} - Object containing preserved data
 */
export const preserveImportantData = () => {
  const preserved = {};
  
  // Google Analytics data
  const gaMeasurementId = localStorage.getItem('ga_measurement_id');
  const gaConnected = localStorage.getItem('ga_connected');
  
  if (gaMeasurementId) preserved.ga_measurement_id = gaMeasurementId;
  if (gaConnected) preserved.ga_connected = gaConnected;
  
  // Business data that should persist
  const businessName = localStorage.getItem('businessName');
  if (businessName) preserved.businessName = businessName;
  
  // Client invitation data (important for client flows)
  const invitationToken = localStorage.getItem('client_invitation_token') || localStorage.getItem('invitationToken');
  const businessId = localStorage.getItem('client_business_id') || localStorage.getItem('businessId');
  const staffId = localStorage.getItem('client_staff_id') || localStorage.getItem('clientStaffId');
  
  if (invitationToken) {
    preserved.client_invitation_token = invitationToken;
    preserved.invitationToken = invitationToken;
  }
  if (businessId) {
    preserved.client_business_id = businessId;
    preserved.businessId = businessId;
  }
  if (staffId) {
    preserved.client_staff_id = staffId;
    preserved.clientStaffId = staffId;
  }
  
  return preserved;
};

/**
 * Restore preserved data to localStorage
 * @param {object} preservedData - Data to restore
 */
export const restorePreservedData = (preservedData) => {
  Object.entries(preservedData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, value);
    }
  });
};

/**
 * Determine the current user context based on URL path
 * @returns {string} - 'admin', 'client', or 'barber'
 */
export const getCurrentUserContext = () => {
  const path = window.location.pathname;
  const search = window.location.search;

  if (path.startsWith('/admin')) {
    return 'admin';
  }

  // Detect invitation-based client onboarding: /client/invitation/:token or query contains ?business=
  const isClientInvitationPath = /\/client\/invitation\//.test(path) || (path.startsWith('/client') && /[?&]business=/.test(search));

  if (path.startsWith('/client') || path.includes('/book/') || isClientInvitationPath) {
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      return 'client';
    }
    // If invitation path and we have at least an invitation token + business id, treat as client context (limited)
    if (isClientInvitationPath) {
      const invitationToken = localStorage.getItem('client_invitation_token') || localStorage.getItem('invitationToken');
      const businessId = localStorage.getItem('client_business_id') || localStorage.getItem('businessId');
      if (invitationToken && businessId) {
        return 'client';
      }
    }
    return 'barber';
  }

  // Check for client context on barber public profile pages
  // If user has clientId and is on a barber profile page, they're a client viewing the barber
  if (path.startsWith('/barber/profile/') || path.startsWith('/barber/')) {
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      return 'client';
    }
  }

  if (path.includes('/invitation')) {
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      return 'client';
    }
    const invitationToken = localStorage.getItem('client_invitation_token') || localStorage.getItem('invitationToken');
    if (invitationToken) {
      return 'client';
    }
    return 'barber';
  }

  return 'barber';
};

/**
 * Get the appropriate token based on current context
 * @deprecated Tokens are now stored in httpOnly cookies, not localStorage
 * @returns {null} - Always returns null as tokens are in cookies
 */
export const getContextualToken = () => {
  // Tokens are now stored in httpOnly cookies and sent automatically
  // No need to retrieve tokens from localStorage
  return null;
};

/**
 * Check if the current context has valid authentication
 * @returns {boolean}
 */
export const isCurrentContextAuthenticated = () => {
  const context = getCurrentUserContext();
  
  switch (context) {
    case 'admin':
      return isAdminAuthenticated();
    case 'client':
      return isClientAuthenticated();
    case 'barber':
    default:
      return isBarberAuthenticated();
  }
};