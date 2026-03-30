/**
 * Utility functions for handling client invitation tokens
 */

const INVITATION_TOKEN_KEY = 'client_invitation_token';
const BUSINESS_ID_KEY = 'client_business_id';
const STAFF_ID_KEY = 'client_staff_id';
const CLIENT_DATA_KEY = 'client_data';

/**
 * Store invitation token in localStorage
 * @param {string} token - Invitation token
 */
export const storeInvitationToken = (token) => {
  if (token) {
    localStorage.setItem(INVITATION_TOKEN_KEY, token);
  }
};

/**
 * Store business ID in localStorage
 * @param {string} businessId - Business ID
 */
export const storeBusinessId = (businessId) => {
  if (businessId) {
    localStorage.setItem(BUSINESS_ID_KEY, businessId);
  }
};

/**
 * Get invitation token from localStorage
 * @returns {string|null} - Invitation token or null if not found
 */
export const getInvitationToken = () => {
  return localStorage.getItem(INVITATION_TOKEN_KEY);
};

/**
 * Get business ID from localStorage
 * @returns {string|null} - Business ID or null if not found
 */
export const getBusinessId = () => {
  return localStorage.getItem(BUSINESS_ID_KEY);
};

/**
 * Remove invitation token from localStorage
 */
export const clearInvitationToken = () => {
  localStorage.removeItem(INVITATION_TOKEN_KEY);
};

/**
 * Remove business ID from localStorage
 */
export const clearBusinessId = () => {
  localStorage.removeItem(BUSINESS_ID_KEY);
};

/**
 * Check if there's an invitation token in the current URL
 * @returns {string|null} - Invitation token from URL or null
 */
export const getInvitationTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('invitation_token');
};

/**
 * Check if there's a business ID in the current URL
 * @returns {string|null} - Business ID from URL or null
 */
export const getBusinessIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('business');
};

/**
 * Process invitation token and business ID from URL and store them
 * Call this when the app loads to handle invitation links
 */
export const processInvitationFromUrl = () => {
  const token = getInvitationTokenFromUrl();
  const businessId = getBusinessIdFromUrl();
  
  if (token) {
    storeInvitationToken(token);
  }
  
  if (businessId) {
    storeBusinessId(businessId);
  }
  
  // Clean up URL by removing the parameters
  if (token || businessId) {
    const url = new URL(window.location);
    url.searchParams.delete('invitation_token');
    url.searchParams.delete('business');
    window.history.replaceState({}, '', url);
  }
};

/**
 * Store staff ID in localStorage
 * @param {string} staffId - Staff ID
 */
export const storeStaffId = (staffId) => {
  if (staffId) {
    localStorage.setItem(STAFF_ID_KEY, staffId);
  }
};

/**
 * Get staff ID from localStorage
 * @returns {string|null} - Staff ID or null if not found
 */
export const getStaffId = () => {
  return localStorage.getItem(STAFF_ID_KEY);
};

/**
 * Remove staff ID from localStorage
 */
export const clearStaffId = () => {
  localStorage.removeItem(STAFF_ID_KEY);
};

/**
 * Store client data in localStorage (sanitized - removes sensitive data)
 * @param {Object} clientData - Client data object
 */
export const storeClientData = (clientData) => {
  if (clientData) {
    // Sanitize client data - only store what's needed, remove sensitive info
    const sanitized = {
      _id: clientData.client?._id || clientData._id,
      firstName: clientData.client?.firstName || clientData.firstName,
      lastName: clientData.client?.lastName || clientData.lastName,
      email: clientData.client?.email || clientData.email,
      phone: clientData.client?.phone || clientData.phone,
      isProfileComplete: clientData.client?.isProfileComplete || clientData.isProfileComplete,
      staff: clientData.client?.staff || clientData.staff,
      business: clientData.client?.business?._id || clientData.business?._id,
      // DO NOT store: invitationToken, password hashes, sensitive business data
    };
    localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(sanitized));
  }
};

/**
 * Get client data from localStorage
 * @returns {Object|null} - Client data or null if not found
 */
export const getClientData = () => {
  const data = localStorage.getItem(CLIENT_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Remove client data from localStorage
 */
export const clearClientData = () => {
  localStorage.removeItem(CLIENT_DATA_KEY);
};

/**
 * Clear all invitation-related data from localStorage
 */
export const clearAllInvitationData = () => {
  clearInvitationToken();
  clearBusinessId();
  clearStaffId();
  clearClientData();
};

/**
 * Get the business ID from various sources (URL, localStorage, etc.)
 * @returns {string|null} - Business ID or null
 */
export const getCurrentBusinessId = () => {
  // First check URL parameters
  const urlBusinessId = getBusinessIdFromUrl();
  if (urlBusinessId) {
    return urlBusinessId;
  }
  
  // Then check localStorage
  const storedBusinessId = getBusinessId();
  if (storedBusinessId) {
    return storedBusinessId;
  }
  
  return null;
};

/**
 * Get the current staff ID from localStorage
 * @returns {string|null} - Staff ID or null
 */
export const getCurrentStaffId = () => {
  return getStaffId();
};
