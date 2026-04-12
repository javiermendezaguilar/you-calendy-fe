// LocalStorage Safety Utility - Prevents missing data issues and API errors

/**
 * Safely get item from localStorage with fallback
 * @param {string} key - The localStorage key
 * @param {any} fallback - Fallback value if key doesn't exist
 * @returns {any} - The value or fallback
 */
export const safeGetItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) {
      return fallback;
    }
    
    // Try to parse JSON if it looks like JSON
    if (item.startsWith('{') || item.startsWith('[')) {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    }
    
    return item;
  } catch (error) {
    console.warn('Error getting localStorage item', { key, error });
    return fallback;
  }
};

/**
 * Safely set item to localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} - Success status
 */
export const safeSetItem = (key, value) => {
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.warn('Error setting localStorage item', { key, error });
    return false;
  }
};

/**
 * Safely remove item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} - Success status
 */
export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Error removing localStorage item', { key, error });
    return false;
  }
};

/**
 * Get all required authentication data for current context
 * Note: Tokens are now stored in httpOnly cookies, not localStorage
 * @param {string} userType - 'barber', 'client', or 'admin'
 * @returns {object} - Object with all required auth data
 */
export const getRequiredAuthData = (userType = 'barber') => {
  const authData = {};
  
  if (userType === 'admin') {
    // Tokens are in cookies (adminToken), only check user data
    authData.user = safeGetItem('adminUser');
  } else if (userType === 'client') {
    // Tokens are in cookies (clientToken), only check clientId
    authData.clientId = safeGetItem('clientId');
    authData.businessId = safeGetItem('businessId') || safeGetItem('client_business_id');
    authData.invitationToken = safeGetItem('invitationToken') || safeGetItem('client_invitation_token');
    authData.staffId = safeGetItem('clientStaffId') || safeGetItem('client_staff_id');
  } else {
    // Tokens are in cookies (userToken), only check user data
    authData.user = safeGetItem('user');
    authData.businessName = safeGetItem('businessName');
  }
  
  return authData;
};

/**
 * Validate that all required data exists for API calls
 * Note: Tokens are in httpOnly cookies, so we only validate user data presence
 * @param {string} userType - 'barber', 'client', or 'admin'
 * @returns {object} - Validation result with missing items
 */
export const validateRequiredData = (userType = 'barber') => {
  const authData = getRequiredAuthData(userType);
  const missing = [];
  const warnings = [];
  
  if (userType === 'admin') {
    // Only check user data (token is in cookie: adminToken)
    if (!authData.user) missing.push('adminUser');
  } else if (userType === 'client') {
    // Only check clientId (token is in cookie: clientToken)
    if (!authData.clientId) missing.push('clientId');
    if (!authData.businessId) warnings.push('businessId (may affect some features)');
    if (!authData.invitationToken) warnings.push('invitationToken (may affect booking flow)');
  } else {
    // Only check user data (token is in cookie: userToken)
    if (!authData.user) missing.push('user');
    if (!authData.businessName) warnings.push('businessName (may affect some features)');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    authData
  };
};

/**
 * Restore missing critical data from backup sources
 * @param {string} userType - 'barber', 'client', or 'admin'
 * @returns {object} - Restoration result
 */
export const restoreMissingData = (userType = 'barber') => {
  const validation = validateRequiredData(userType);
  const restored = [];
  
  if (!validation.isValid) {
    // Note: Tokens are in httpOnly cookies, no need to restore them
    // Only restore user data from alternative keys if needed
    
    // Try to restore client data from alternative keys
    if (userType === 'client') {
      if (!validation.authData.businessId) {
        const altBusinessId = safeGetItem('client_business_id');
        if (altBusinessId) {
          safeSetItem('businessId', altBusinessId);
          restored.push('businessId (from client_business_id)');
        }
      }
      
      if (!validation.authData.invitationToken) {
        const altInvitationToken = safeGetItem('client_invitation_token');
        if (altInvitationToken) {
          safeSetItem('invitationToken', altInvitationToken);
          restored.push('invitationToken (from client_invitation_token)');
        }
      }
      
      if (!validation.authData.staffId) {
        const altStaffId = safeGetItem('client_staff_id');
        if (altStaffId) {
          safeSetItem('clientStaffId', altStaffId);
          restored.push('clientStaffId (from client_staff_id)');
        }
      }
    }
  }
  
  return {
    restored,
    newValidation: validateRequiredData(userType)
  };
};

/**
 * Monitor localStorage for critical data and auto-restore if needed
 */
export const startDataMonitoring = () => {
  const checkInterval = 30000; // Check every 30 seconds
  
  const monitor = () => {
    // Get current user context
    const path = window.location.pathname;
    let userType = 'barber';
    
    if (path.startsWith('/admin')) {
      userType = 'admin';
    } else if (path.startsWith('/client') || path.includes('/book/')) {
      userType = 'client';
    }
    
    const validation = validateRequiredData(userType);
    
    if (!validation.isValid && validation.missing.length > 0) {
      const restoration = restoreMissingData(userType);
    }
  };
  
  // Initial check
  monitor();
  
  // Set up interval monitoring
  const intervalId = setInterval(monitor, checkInterval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Create a safe API call wrapper that validates data before making requests
 * @param {Function} apiCall - The API function to wrap
 * @param {string} userType - Required user type for this API call
 * @returns {Function} - Wrapped API function
 */
export const createSafeApiCall = (apiCall, userType = 'barber') => {
  return async (...args) => {
    // Validate required data before making API call
    const validation = validateRequiredData(userType);
    
    if (!validation.isValid) {
      // Try to restore missing data
      const restoration = restoreMissingData(userType);
      
      if (!restoration.newValidation.isValid) {
        const error = new Error(`Missing required data for API call: ${validation.missing.join(', ')}`);
        error.missingData = validation.missing;
        error.userType = userType;
        throw error;
      }
    }
    
    try {
      return await apiCall(...args);
    } catch (error) {
      // If API call fails due to auth issues, check if data is still valid
      if (error.response?.status === 401 || error.response?.status === 403) {
        const revalidation = validateRequiredData(userType);
        if (!revalidation.isValid) {
          console.warn('API call failed and auth data is missing:', revalidation.missing);
        }
      }
      throw error;
    }
  };
};

/**
 * Export all localStorage keys used in the application for reference
 * Note: Tokens are now stored in httpOnly cookies, not localStorage
 */
export const STORAGE_KEYS = {
  // User data (tokens are in httpOnly cookies)
  USER: 'user',
  ADMIN_USER: 'adminUser',
  CLIENT_ID: 'clientId',
  
  // Business data
  BUSINESS_NAME: 'businessName',
  BUSINESS_ID: 'businessId',
  CLIENT_BUSINESS_ID: 'client_business_id',
  
  // Client flow data
  INVITATION_TOKEN: 'invitationToken',
  CLIENT_INVITATION_TOKEN: 'client_invitation_token',
  STAFF_ID: 'clientStaffId',
  CLIENT_STAFF_ID: 'client_staff_id',
  CLIENT_DATA: 'client_data',
  
  // Google Analytics
  GA_MEASUREMENT_ID: 'ga_measurement_id',
  GA_CONNECTED: 'ga_connected'
};
