// API Error Handler - Prevents API errors due to missing localStorage data

import { validateRequiredData, restoreMissingData, createSafeApiCall } from './localStorageSafety';
import { getCurrentUserContext } from './authUtils';
import authManager from './authManager';

/**
 * Enhanced error handler for API calls
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @returns {object} - Error analysis and recommendations
 */
export const handleApiError = (error, context = 'API Call') => {
  const userContext = getCurrentUserContext();
  const errorInfo = {
    type: 'unknown',
    shouldRetry: false,
    shouldLogout: false,
    missingData: [],
    message: error.message || 'Unknown error occurred',
    context
  };

  // Network errors
  if (!error.response) {
    errorInfo.type = 'network';
    errorInfo.shouldRetry = true;
    errorInfo.message = 'Network connection issue. Please check your internet connection.';
    console.warn(`Network error in ${context}:`, error.message);
    return errorInfo;
  }

  const status = error.response.status;

  // Authentication errors
  if (status === 401) {
    errorInfo.type = 'authentication';
    
    // Check if we have the required data
    const validation = validateRequiredData(userContext);
    
    if (!validation.isValid) {
      errorInfo.missingData = validation.missing;
      errorInfo.message = `Missing authentication data: ${validation.missing.join(', ')}`;
      
      // Try to restore missing data
      const restoration = restoreMissingData(userContext);
      
      if (restoration.restored.length > 0) {
        errorInfo.shouldRetry = true;
        errorInfo.message = `Restored missing data: ${restoration.restored.join(', ')}. Please try again.`;
        console.log('Restored missing auth data for retry:', restoration.restored);
      } else {
        errorInfo.shouldLogout = true;
        errorInfo.message = 'Authentication session has expired. Please log in again.';
      }
    } else {
      // We have the data but still got 401, likely token expired
      errorInfo.shouldLogout = true;
      errorInfo.message = 'Your session has expired. Please log in again.';
    }
    
    return errorInfo;
  }

  // Authorization errors
  if (status === 403) {
    errorInfo.type = 'authorization';
    errorInfo.message = 'You do not have permission to perform this action.';
    console.warn(`Authorization error in ${context}:`, error.response.data);
    return errorInfo;
  }

  // Client errors (400-499)
  if (status >= 400 && status < 500) {
    errorInfo.type = 'client';
    
    // Check for specific client errors that might be due to missing data
    if (status === 400) {
      const validation = validateRequiredData(userContext);
      
      if (!validation.isValid) {
        errorInfo.missingData = validation.missing;
        errorInfo.message = `Request failed due to missing data: ${validation.missing.join(', ')}`;
        
        const restoration = restoreMissingData(userContext);
        if (restoration.restored.length > 0) {
          errorInfo.shouldRetry = true;
          errorInfo.message = `Restored missing data: ${restoration.restored.join(', ')}. Please try again.`;
        }
      } else {
        errorInfo.message = error.response.data?.message || 'Invalid request. Please check your input.';
      }
    } else if (status === 404) {
      errorInfo.message = 'The requested resource was not found.';
    } else {
      errorInfo.message = error.response.data?.message || 'Client error occurred.';
    }
    
    return errorInfo;
  }

  // Server errors (500-599)
  if (status >= 500) {
    errorInfo.type = 'server';
    errorInfo.shouldRetry = true;
    errorInfo.message = 'Server error occurred. Please try again in a moment.';
    console.error(`Server error in ${context}:`, error.response.data);
    return errorInfo;
  }

  // Unknown error
  console.error(`Unknown error in ${context}:`, error);
  return errorInfo;
};

/**
 * Wrapper for API calls that automatically handles errors and missing data
 * @param {Function} apiCall - The API function to call
 * @param {object} options - Options for the wrapper
 * @returns {Function} - Wrapped API function
 */
export const createRobustApiCall = (apiCall, options = {}) => {
  const {
    userType = null,
    context = 'API Call',
    maxRetries = 2,
    retryDelay = 1000,
    onError = null,
    onRetry = null
  } = options;

  return async (...args) => {
    const actualUserType = userType || getCurrentUserContext();
    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Validate required data before each attempt
        const validation = validateRequiredData(actualUserType);
        
        if (!validation.isValid) {
          console.warn(`Attempt ${attempt + 1}: Missing required data:`, validation.missing);
          
          const restoration = restoreMissingData(actualUserType);
          
          if (restoration.restored.length > 0) {
            console.log(`Attempt ${attempt + 1}: Restored data:`, restoration.restored);
          } else if (attempt === 0) {
            // Only throw on first attempt if we can't restore data
            const error = new Error(`Missing required data: ${validation.missing.join(', ')}`);
            error.missingData = validation.missing;
            throw error;
          }
        }
        
        // Make the API call
        const result = await apiCall(...args);
        
        // Success - reset any error state
        if (attempt > 0) {
          console.log(`API call succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        const errorInfo = handleApiError(error, context);
        
        // Handle logout if required
        if (errorInfo.shouldLogout) {
          console.warn('API error requires logout:', errorInfo.message);
          authManager.handleInvalidSession();
          throw error;
        }
        
        // Don't retry if it's not a retryable error
        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          if (onError) {
            onError(error, errorInfo, attempt + 1);
          }
          throw error;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          console.log(`Retrying API call in ${retryDelay}ms (attempt ${attempt + 2}/${maxRetries + 1})`);
          
          if (onRetry) {
            onRetry(error, errorInfo, attempt + 1);
          }
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  };
};

/**
 * Create a safe API call that validates data and handles errors gracefully
 * @param {Function} apiCall - The API function
 * @param {string} userType - Required user type
 * @param {string} context - Context for error reporting
 * @returns {Function} - Safe API function
 */
export const createSafeApiCallWithErrorHandling = (apiCall, userType = null, context = 'API Call') => {
  const safeCall = createSafeApiCall(apiCall, userType || getCurrentUserContext());
  
  return createRobustApiCall(safeCall, {
    userType,
    context,
    maxRetries: 2,
    retryDelay: 1000,
    onError: (error, errorInfo, attempt) => {
      console.error(`${context} failed after ${attempt} attempts:`, errorInfo.message);
    },
    onRetry: (error, errorInfo, attempt) => {
      console.log(`${context} retry ${attempt}:`, errorInfo.message);
    }
  });
};

/**
 * Global error handler for unhandled API errors
 * @param {Error} error - The unhandled error
 * @param {string} context - Where the error occurred
 */
export const handleGlobalApiError = (error, context = 'Global') => {
  const errorInfo = handleApiError(error, context);
  
  // Log the error
  console.error(`Unhandled API error in ${context}:`, {
    type: errorInfo.type,
    message: errorInfo.message,
    missingData: errorInfo.missingData,
    shouldLogout: errorInfo.shouldLogout
  });
  
  // Handle logout if required
  if (errorInfo.shouldLogout) {
    authManager.handleInvalidSession();
  }
  
  // Show user-friendly message
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('api:error', {
      detail: {
        message: errorInfo.message,
        type: errorInfo.type,
        context
      }
    }));
  }
  
  return errorInfo;
};

/**
 * Setup global error handlers for unhandled promise rejections
 */
export const setupGlobalErrorHandlers = () => {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      
      // Only handle API-related errors
      if (error && (error.response || error.request || error.config)) {
        console.warn('Unhandled API promise rejection:', error);
        handleGlobalApiError(error, 'Unhandled Promise');
        
        // Prevent the default browser behavior
        event.preventDefault();
      }
    });
    
    // Handle general errors
    window.addEventListener('error', (event) => {
      const error = event.error;
      
      // Only handle API-related errors
      if (error && (error.response || error.request || error.config)) {
        console.warn('Unhandled API error:', error);
        handleGlobalApiError(error, 'Global Error Handler');
      }
    });
  }
};

// Export error types for reference
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  CLIENT: 'client',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};