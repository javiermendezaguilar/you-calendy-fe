import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../contexts/AnalyticsContext';

/**
 * Custom hook for automatic page tracking
 */
export const usePageTracking = () => {
  const location = useLocation();
  const { trackPageView, isConnected } = useAnalytics();

  useEffect(() => {
    if (isConnected) {
      trackPageView(location.pathname, document.title);
    }
  }, [location.pathname, isConnected, trackPageView]);
};

/**
 * Custom hook for business event tracking
 */
export const useBusinessTracking = () => {
  const analytics = useAnalytics();

  return {
    // Appointment related
    onAppointmentBooked: (serviceType, businessId) => {
      analytics.trackAppointmentBooked(serviceType, businessId);
    },
    
    // User related
    onUserRegistered: (method = 'email') => {
      analytics.trackUserRegistration(method);
    },
    
    onUserLoggedIn: (method = 'email') => {
      analytics.trackLogin(method);
    },
    
    // Business related
    onServiceCreated: (serviceType) => {
      analytics.trackServiceCreated(serviceType);
    },
    
    onBusinessProfileCompleted: () => {
      analytics.trackBusinessProfileCompleted();
    },
    
    // Subscription related
    onSubscriptionUpgraded: (planType) => {
      analytics.trackSubscriptionUpgrade(planType);
    },
    
    // Communication related
    onClientInviteSent: (method = 'email') => {
      analytics.trackClientInviteSent(method);
    },
    
    onNotificationSent: (type) => {
      analytics.trackNotificationSent(type);
    },
    
    // Custom events
    onCustomEvent: (action, category, label, value) => {
      analytics.trackEvent(action, category, label, value);
    },
    
    // Conversion tracking
    onConversion: (type, value) => {
      analytics.trackConversion(type, value);
    }
  };
};

/**
 * Custom hook for form tracking
 */
export const useFormTracking = (formName) => {
  const { trackEvent } = useAnalytics();

  return {
    onFormStart: () => {
      trackEvent('form_start', 'engagement', formName);
    },
    
    onFormComplete: () => {
      trackEvent('form_complete', 'engagement', formName);
    },
    
    onFormError: (errorType) => {
      trackEvent('form_error', 'engagement', `${formName}_${errorType}`);
    },
    
    onFieldFocus: (fieldName) => {
      trackEvent('field_focus', 'engagement', `${formName}_${fieldName}`);
    }
  };
};
