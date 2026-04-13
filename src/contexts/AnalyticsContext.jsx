import React, { createContext, useContext, useEffect, useState } from 'react';
import gaService from '../services/analytics';
import gaConfigService from '../services/googleAnalyticsConfig';
import { isAdminAuthenticated } from '../utils/authUtils';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [measurementId, setMeasurementId] = useState(null);

  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  const canReadAdminAnalyticsConfig = isAdminRoute && isAdminAuthenticated();

  /**
   * Connect to Google Analytics
   * @param {string} measurementId - GA4 Measurement ID
   */
  const connectGoogleAnalytics = async (measurementId) => {
    try {
      const success = gaService.initialize(measurementId);
      if (success) {
        // Save to backend
        const backendResult = await gaConfigService.saveConfiguration(measurementId);
        
        setIsConnected(true);
        setMeasurementId(measurementId);
        
        // Store in localStorage for persistence
        localStorage.setItem('ga_measurement_id', measurementId);
        localStorage.setItem('ga_connected', 'true');
        
        // Track initial page view
        gaService.trackPageView(window.location.pathname, document.title);
        
        const message = backendResult.success 
          ? 'Google Analytics connected and saved successfully!' 
          : 'Google Analytics connected locally! (Backend configuration will be saved when you have admin access)';
          
        return { success: true, message };
      } else {
        return { success: false, message: 'Failed to initialize Google Analytics' };
      }
    } catch (error) {
      console.error('Error connecting Google Analytics:', error);
      return { success: false, message: error.message };
    }
  };

  /**
   * Disconnect Google Analytics
   */
  const disconnectGoogleAnalytics = async () => {
    try {
      // Remove from backend
      await gaConfigService.removeConfiguration();
      
      setIsConnected(false);
      setMeasurementId(null);
      localStorage.removeItem('ga_measurement_id');
      localStorage.removeItem('ga_connected');
    } catch (error) {
      console.error('Error disconnecting Google Analytics:', error);
      // Still disconnect locally even if backend fails
      setIsConnected(false);
      setMeasurementId(null);
      localStorage.removeItem('ga_measurement_id');
      localStorage.removeItem('ga_connected');
    }
  };

  /**
   * Check if already connected on app load
   */
  useEffect(() => {
    const initializeAnalytics = async () => {
      // Backend configuration lives under an admin endpoint.
      // Public routes must not hit it or they will create noisy auth/CORS failures.
      if (canReadAdminAnalyticsConfig) {
        try {
          const backendConfig = await gaConfigService.getConfiguration();
          if (backendConfig.success && backendConfig.data?.googleAnalyticsApiKey) {
            const backendMeasurementId = backendConfig.data.googleAnalyticsApiKey;
            const success = gaService.initialize(backendMeasurementId);
            if (success) {
              setIsConnected(true);
              setMeasurementId(backendMeasurementId);
              localStorage.setItem('ga_measurement_id', backendMeasurementId);
              localStorage.setItem('ga_connected', 'true');
              return;
            }
          }
        } catch {
          // Silently handle - this is expected for non-admin users
        }
      }

      // Fallback to localStorage
      const savedMeasurementId = localStorage.getItem('ga_measurement_id');
      const savedConnectionStatus = localStorage.getItem('ga_connected');
      
      if (savedMeasurementId && savedConnectionStatus === 'true') {
        const success = gaService.initialize(savedMeasurementId);
        if (success) {
          setIsConnected(true);
          setMeasurementId(savedMeasurementId);
        }
      }
    };

    initializeAnalytics();
  }, [canReadAdminAnalyticsConfig]);

  /**
   * Track page views automatically on route changes
   */
  useEffect(() => {
    if (isConnected) {
      gaService.trackPageView(window.location.pathname, document.title);
    }
  }, [window.location.pathname, isConnected]);

  const value = {
    // Connection status
    isConnected,
    measurementId,
    
    // Connection methods
    connectGoogleAnalytics,
    disconnectGoogleAnalytics,
    
    // Tracking methods
    trackEvent: gaService.trackEvent.bind(gaService),
    trackPageView: gaService.trackPageView.bind(gaService),
    setUserProperties: gaService.setUserProperties.bind(gaService),
    
    // Business-specific tracking
    trackAppointmentBooked: gaService.trackAppointmentBooked.bind(gaService),
    trackUserRegistration: gaService.trackUserRegistration.bind(gaService),
    trackLogin: gaService.trackLogin.bind(gaService),
    trackServiceCreated: gaService.trackServiceCreated.bind(gaService),
    trackSubscriptionUpgrade: gaService.trackSubscriptionUpgrade.bind(gaService),
    trackBusinessProfileCompleted: gaService.trackBusinessProfileCompleted.bind(gaService),
    trackClientInviteSent: gaService.trackClientInviteSent.bind(gaService),
    trackNotificationSent: gaService.trackNotificationSent.bind(gaService),
    trackConversion: gaService.trackConversion.bind(gaService)
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
