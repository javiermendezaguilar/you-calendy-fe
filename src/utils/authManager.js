// Enhanced Authentication Manager for session stability
import { 
  clearAuthData, 
  clearAllAuthData, 
  getCurrentUserContext,
  getCurrentUser,
  preserveImportantData,
  restorePreservedData
} from './authUtils';
import { 
  validateRequiredData, 
  restoreMissingData, 
  startDataMonitoring 
} from './localStorageSafety';

class AuthManager {
  constructor() {
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
    this.heartbeatInterval = 60 * 1000; // 1 minute
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.heartbeatTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.dataMonitorCleanup = null;
  }

  /**
   * Initialize the authentication manager
   */
  init(options = {}) {
    const { skipInitialValidation = false } = options;

    this.startHeartbeat();
    this.setupStorageListener();
    if (!skipInitialValidation) {
      this.validateCurrentSession();
    }
    
    // Start localStorage data monitoring
    this.dataMonitorCleanup = startDataMonitoring();
    
    // Validate and restore any missing critical data on init
    this.validateAndRestoreData();
  }

  /**
   * Start periodic session validation
   */
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.validateSession();
    }, this.heartbeatInterval);
  }

  /**
   * Stop the heartbeat timer
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // Clean up data monitoring
    if (this.dataMonitorCleanup) {
      this.dataMonitorCleanup();
      this.dataMonitorCleanup = null;
    }
  }

  /**
   * Setup storage event listener for cross-tab synchronization
   */
  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token' || event.key === 'adminToken' || event.key === 'clientToken') {
        if (!event.newValue) {
          // Token was removed in another tab
          this.handleLogout();
        }
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, validate session
        this.validateCurrentSession();
      }
    });
  }

  /**
   * Validate current session immediately
   * Note: Uses cookies for authentication (sent automatically)
   */
  async validateCurrentSession() {
    // Check if user data exists in localStorage (indicates logged-in state)
    const context = getCurrentUserContext();
    const user = getCurrentUser(context);
    
    if (!user) {
      return false;
    }

    try {
      const isValid = await this.validateSessionWithServer();
      if (!isValid) {
        this.handleInvalidSession();
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Session validation failed:', error.message);
      return false;
    }
  }

  /**
   * Validate session with retry logic
   * Note: Uses cookies for authentication (sent automatically)
   */
  async validateSession() {
    // Check if user data exists in localStorage (indicates logged-in state)
    const context = getCurrentUserContext();
    const user = getCurrentUser(context);
    
    if (!user) {
      return;
    }

    try {
      // Validate session with server (cookies sent automatically)
      const isValid = await this.validateSessionWithServer();
      if (!isValid) {
        this.handleInvalidSession();
      }
    } catch (error) {
      console.warn('Session validation error:', error.message);
      // Don't immediately logout on network errors, allow retries
      if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        console.log('Network error during validation, will retry on next heartbeat');
      } else {
        this.handleInvalidSession();
      }
    }
  }

  /**
   * Validate session with server using cookies
   * Note: Cookies are sent automatically with credentials
   */
  async validateSessionWithServer() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.groomnest.com'}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Send cookies automatically
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return true;
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network Error');
      }
      throw error;
    }
  }

  /**
   * Attempt to refresh the token
   * @deprecated Token refresh not needed with httpOnly cookies - cookies are automatically sent
   */
  async refreshToken() {
    // With httpOnly cookies, tokens are automatically sent and refreshed by the server
    // No manual refresh needed
    return true;
  }

  /**
   * Perform the actual token refresh
   * @deprecated Not needed with httpOnly cookies
   */
  async performTokenRefresh() {
    // With httpOnly cookies, tokens are automatically sent and refreshed by the server
    // No manual refresh needed
    return true;
  }

  /**
   * Handle invalid session
   */
  handleInvalidSession() {
    console.log('Invalid session detected, clearing auth data');
    
    // Preserve important data before clearing auth
    const preservedData = preserveImportantData();
    
    this.handleLogout();
    
    // Restore important data after clearing auth
    restorePreservedData(preservedData);
  }

  /**
   * Handle logout
   * @param {boolean} preserveData - Whether to preserve important non-auth data
   */
  handleLogout(preserveData = true) {
    this.stopHeartbeat();
    
    // Clear authentication data
    const userContext = getCurrentUserContext();
    
    if (preserveData) {
      // Preserve important data during logout
      clearAuthData(userContext, true);
    } else {
      // Complete logout - clear everything
      clearAllAuthData(userContext);
    }
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { 
        reason: 'session_expired',
        preservedData: preserveData
      }
    }));
  }

  /**
   * Handle successful login
   */
  handleLogin() {
    this.startHeartbeat();
    
    // Emit custom event
    window.dispatchEvent(new CustomEvent('auth:login'));
  }

  /**
   * Retry mechanism for network operations
   */
  async retryOperation(operation, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  /**
   * Validate and restore missing critical data
   * Note: Tokens are in httpOnly cookies, so we only validate user data presence
   */
  validateAndRestoreData() {
    const userContext = getCurrentUserContext();
    const validation = validateRequiredData(userContext);
    
    if (!validation.isValid) {
      // Only log warning, don't treat as critical error
      // User data might be loading or cookies might handle authentication
      
      restoreMissingData(userContext);
      
      // Don't log error - missing user data is not critical since cookies handle auth
    }
    
    if (validation.warnings.length > 0) {
      // Non-critical data missing - handled silently
    }
  }

  /**
   * Get session info
   * Note: With httpOnly cookies, we can't decode tokens on client side
   * This returns user info from localStorage instead
   */
  getSessionInfo() {
    const context = getCurrentUserContext();
    const user = getCurrentUser(context);
    
    if (!user) {
      return null;
    }

    return {
      userId: user._id || user.id,
      context: context,
      user: user,
      isValid: true // Assume valid if user data exists (actual validation happens via cookies)
    };
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;
