import axios from "axios";
import authManager from "../utils/authManager";
import { handleAutoLogout, isAutoLogoutInProgress, trackSuccess } from "../utils/autoLogout";
import { getCurrentUserContext } from "../utils/authUtils";

// Use environment variable for API base URL with fallback
export const baseURL = import.meta.env.VITE_API_URL || "https://api.groomnest.com";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for authentication
});


const formApi = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for authentication
});

const apis = [api, formApi];

apis.forEach((instance) => {
  instance.interceptors.request.use(
    (config) => {
      // Authentication is handled automatically via httpOnly cookies (withCredentials: true)
      // No need to manually add Authorization headers - cookies are sent automatically

      // Signal current user context to backend to disambiguate cookies when multiple are present
      try {
        const userContext = getCurrentUserContext();
        if (userContext) {
          config.headers['x-user-context'] = userContext;
        }
      } catch {
        // Ignore context detection errors
      }
      
      // Add client ID header for client-side API calls
      const clientId = localStorage.getItem('clientId');
      if (clientId && config.url && (config.url.includes('/client/') || config.url.includes('/notifications'))) {
        config.headers['x-client-id'] = clientId;
      }
      
      // Add timezone offset header as fallback for all requests
      // This ensures backend can use timezone info even if query param is missing
      // JavaScript's getTimezoneOffset() returns minutes to subtract from UTC to get local time
      // So for UTC+5, it returns -300, and we need to send +300
      const timezoneOffset = -new Date().getTimezoneOffset();
      config.headers['x-timezone-offset'] = timezoneOffset.toString();

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      trackSuccess();
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const statusCode = error.response?.status;
      
      // Handle 401 (Unauthorized) errors
      if (statusCode === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        if (isAutoLogoutInProgress()) {
          return Promise.reject(error);
        }
        
        try {
          const isOptionalEndpoint = originalRequest?.url?.includes('/notifications');
          
          if (!isOptionalEndpoint) {
            const isSessionValid = await authManager.validateCurrentSession();
            
            if (isSessionValid) {
              return instance(originalRequest);
            } else {
              await handleAutoLogout(error, originalRequest);
            }
          }
        } catch (validationError) {
          console.error('Session validation failed:', validationError);
          if (validationError.response?.status === 401 || validationError.response?.status === 403) {
            await handleAutoLogout(error, originalRequest);
          }
        }
      }
      
      // Handle 403 (Forbidden) errors - track failures
      if (statusCode === 403 && !isAutoLogoutInProgress()) {
        const url = originalRequest?.url || error.config?.url;
        const isOptionalEndpoint = url?.includes('/notifications');
        const isPublicRoute = url?.includes('/client/invitation/') || 
                             url?.includes('/appointments/available') ||
                             url?.includes('/business/public/');
        
        if (!isOptionalEndpoint && !isPublicRoute) {
          const errorMessage = error.response?.data?.message || '';
          const isAuthError = errorMessage.toLowerCase().includes('forbidden') ||
                            errorMessage.toLowerCase().includes('not logged in') ||
                            errorMessage.toLowerCase().includes('unauthorized') ||
                            errorMessage.toLowerCase().includes('session');
          
          if (isAuthError) {
            await handleAutoLogout(error, originalRequest);
          }
        }
      }
      
      // Handle 404 (Not Found) errors - track failures
      if (statusCode === 404 && !isAutoLogoutInProgress()) {
        const url = originalRequest?.url || error.config?.url;
        const errorMessage = (error.response?.data?.message || '').toLowerCase();
        const isPublicRoute = url?.includes('/client/invitation/') || 
                             url?.includes('/appointments/available') ||
                             url?.includes('/business/public/');
        
        const isAuthRelated404 = (errorMessage.includes('user not found') ||
                                 errorMessage.includes('client not found') ||
                                 errorMessage.includes('not logged in')) &&
                                !isPublicRoute &&
                                (url?.includes('/business/') || 
                                 url?.includes('/admin/') || 
                                 url?.includes('/appointments/') ||
                                 (url?.includes('/client/') && !url?.includes('/client/invitation/')));
        
        if (isAuthRelated404) {
          await handleAutoLogout(error, originalRequest);
        }
      }
      
      // Handle network errors gracefully
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.warn('Network error detected, request may have failed due to connectivity issues');
        // Don't clear auth data for network errors
      }
      
      // Handle server errors (5xx) - don't clear auth data
      if (error.response?.status >= 500) {
        console.warn('Server error detected, not clearing authentication data');
      }
      
      // Handle specific API errors that shouldn't cause logout
      if (error.response?.status === 404 || error.response?.status === 400) {
        // These are client errors but not auth-related
        console.log('Client error detected, maintaining current session');
      }
      
      return Promise.reject(error);
    }
  );
});

export default api;
export { api as axiosInstance, formApi as formAxios };
