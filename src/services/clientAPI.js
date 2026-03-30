import { axiosInstance, formAxios } from '../configs/axios.config';

// Use the main axios instance for consistency
const apiClient = axiosInstance;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://you-calendy-be.up.railway.app';

/**
 * Get client details by invitation token
 * @param {string} token - Invitation token
 * @returns {Promise<Object>} Client and business data
 */
export const getClientByInvitationToken = async (token) => {
  try {
    if (!token || token.trim() === '') {
      throw new Error('Invalid invitation token provided');
    }
    
    const response = await apiClient.get(`/client/invitation/${token}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch invitation data');
    }
    
    if (!response.data.data || !response.data.data._id) {
      throw new Error('Invalid response format from server');
    }
    
    // The API returns the client data directly in response.data.data
    return { client: response.data.data };
  } catch (error) {
    console.error('Error fetching client invitation data:', error);
    throw error;
  }
};

/**
 * Complete client profile
 * @param {string} token - Invitation token
 * @param {Object} profileData - Profile completion data
 * @returns {Promise<Object>} Updated client data
 */
export const completeClientProfile = async (token, profileData) => {
  try {
    const formData = new FormData();
    formData.append('invitationToken', token);
    formData.append('firstName', profileData.firstName);
    formData.append('lastName', profileData.lastName);
    formData.append('email', profileData.email);
    
    if (profileData.profileImage) {
      formData.append('profileImage', profileData.profileImage);
    }

    const response = await formAxios.post('/client/complete-profile', formData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete profile');
    }

    // Store client ID only - token is stored in httpOnly cookie by backend
    // DO NOT store tokens in localStorage (security risk - vulnerable to XSS attacks)
    if (response.data.data.clientId) {
      localStorage.setItem('clientId', response.data.data.clientId);
    }
    // Note: clientToken is automatically set as httpOnly cookie by backend
    // No need to store it in localStorage

    return response.data.data;
  } catch (error) {
    console.error('Error completing client profile:', error);
    throw error;
  }
};

/**
 * Client login using clientId
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} Client data with token
 */
export const clientLogin = async (clientId) => {
  try {
    const response = await apiClient.post('/client/login', { clientId });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to login');
    }

    // Note: Tokens are stored in httpOnly cookies automatically by the backend (cookie: clientToken)
    // We only store clientId in localStorage for frontend use (no tokens)
    if (response.data.data.clientId) {
      localStorage.setItem('clientId', response.data.data.clientId);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error logging in client:', error);
    throw error;
  }
};

/**
 * Client sign up with email and password
 * @param {Object} signUpData - Sign up data
 * @param {string} signUpData.firstName - First name
 * @param {string} signUpData.lastName - Last name
 * @param {string} signUpData.email - Email address
 * @param {string} signUpData.phone - Phone number
 * @param {string} signUpData.password - Password
 * @param {string} signUpData.businessId - Business ID
 * @returns {Promise<Object>} Client data with token
 */
export const clientSignUp = async (signUpData) => {
  try {
    const response = await apiClient.post('/client/signup', signUpData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to sign up');
    }

    // Store clientId in localStorage (token is in httpOnly cookie)
    if (response.data.data.clientId) {
      localStorage.setItem('clientId', response.data.data.clientId);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error signing up client:', error);
    throw error;
  }
};

/**
 * Client sign in with email and password
 * @param {Object} signInData - Sign in data
 * @param {string} signInData.email - Email address
 * @param {string} signInData.password - Password
 * @param {string} signInData.businessId - Business ID
 * @returns {Promise<Object>} Client data with token
 */
export const clientSignIn = async (signInData) => {
  try {
    const response = await apiClient.post('/client/signin', signInData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to sign in');
    }

    // Store clientId in localStorage (token is in httpOnly cookie)
    if (response.data.data.clientId) {
      localStorage.setItem('clientId', response.data.data.clientId);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error signing in client:', error);
    throw error;
  }
};

/**
 * Request password reset token
 * @param {Object} forgotPasswordData - Forgot password data
 * @param {string} forgotPasswordData.email - Email address
 * @param {string} forgotPasswordData.businessId - Business ID
 * @returns {Promise<Object>} Response message
 */
export const clientForgotPassword = async (forgotPasswordData) => {
  try {
    const response = await apiClient.post('/client/forgot-password', forgotPasswordData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send reset token');
    }

    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Reset password using token
 * @param {Object} resetPasswordData - Reset password data
 * @param {string} resetPasswordData.email - Email address
 * @param {string} resetPasswordData.businessId - Business ID
 * @param {string} resetPasswordData.passwordResetToken - Reset token
 * @param {string} resetPasswordData.password - New password
 * @returns {Promise<Object>} Response message
 */
export const clientResetPassword = async (resetPasswordData) => {
  try {
    const response = await apiClient.post('/client/reset-password', resetPasswordData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset password');
    }

    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Client logout - clears authentication cookie
 * @returns {Promise<Object>} Logout response
 */
export const clientLogout = async () => {
  try {
    const response = await apiClient.post('/client/logout');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to logout');
    }
    
    // Clear all client-related localStorage data
    localStorage.removeItem('clientId');
    localStorage.removeItem('client_invitation_token');
    localStorage.removeItem('client_business_id');
    localStorage.removeItem('client_staff_id');
    localStorage.removeItem('client_data');
    localStorage.removeItem('invitationToken');
    localStorage.removeItem('businessId');
    localStorage.removeItem('clientStaffId');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    return response.data.data;
  } catch (error) {
    // Clear localStorage even if API call fails
    localStorage.removeItem('clientId');
    localStorage.removeItem('client_invitation_token');
    localStorage.removeItem('client_business_id');
    localStorage.removeItem('client_staff_id');
    localStorage.removeItem('client_data');
    localStorage.removeItem('invitationToken');
    localStorage.removeItem('businessId');
    localStorage.removeItem('clientStaffId');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    throw error;
  }
};

/**
 * Get business details by business ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Business data
 */
export const getBusinessDetails = async (businessId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/business/${businessId}`);
    
    if (!response.ok) {
      throw new Error('Business not found');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch business details');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching business details:', error);
    throw error;
  }
};

// New API functions for client profile functionality
export const clientAPI = {
  // Profile management
  getProfile: () => apiClient.get('/client/profile'),
  getPublicProfile: (clientId) => apiClient.get(`/client/profile/${clientId}`),
  updateProfile: (formData) => {
    const invitationToken = localStorage.getItem('invitationToken');
    const queryParam = invitationToken ? `?invitationToken=${invitationToken}` : '';
    return formAxios.patch(`/client/profile${queryParam}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProfile: () => apiClient.delete('/client/profile'),
  
  // Gallery management
  getGallery: (clientId) => apiClient.get(`/client/gallery/${clientId}`),
  uploadHaircutImage: (clientId, formData) => 
    apiClient.post(`/client/gallery/${clientId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteGalleryImage: (galleryId) => {
    const invitationToken = localStorage.getItem('invitationToken');
    const queryParam = invitationToken ? `?invitationToken=${invitationToken}` : '';
    return apiClient.delete(`/client/gallery/${galleryId}${queryParam}`);
  },
  
  // Suggestions and reports (client-side endpoints)
  addSuggestion: (galleryId, formData) => {
    // Add invitation token as query parameter as fallback
    const invitationToken = localStorage.getItem('invitationToken');
    const queryParam = invitationToken ? `?invitationToken=${invitationToken}` : '';
    
    return apiClient.post(`/client/gallery/${galleryId}/suggestions${queryParam}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateSuggestion: (galleryId, suggestionId, data) => {
    // Always ensure invitation token is included if no clientId is available
    const clientId = localStorage.getItem('clientId');
    const invitationToken = localStorage.getItem('invitationToken') || localStorage.getItem('client_invitation_token');
    
    let queryParam = '';
    // Add invitation token if no clientId is available
    if (!clientId && invitationToken) {
      queryParam = `?invitationToken=${invitationToken}`;
    }
    
    // Check if data is FormData (has file) or just text data
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    
    return apiClient.put(`/client/gallery/${galleryId}/suggestions/${suggestionId}${queryParam}`, data, {
      headers
    });
  },
  reportImage: (galleryId, formData) => {
    // Add invitation token as query parameter as fallback
    const invitationToken = localStorage.getItem('invitationToken');
    const queryParam = invitationToken ? `?invitationToken=${invitationToken}` : '';
    
    return apiClient.post(`/client/gallery/${galleryId}/reports${queryParam}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Notifications (client-side endpoints)
  getNotificationPreferences: () => 
    apiClient.get('/client/notifications'),
  toggleNotifications: (enabled) => 
    apiClient.patch('/client/notifications', { enabled }),
  
  // Business information (for public access)
  getBusinessDetails: (businessId) => 
    apiClient.get(`/client/business/${businessId}`),
  getBusinessGallery: (businessId) => 
    apiClient.get(`/client/business/${businessId}/gallery`),
};

export default clientAPI;
