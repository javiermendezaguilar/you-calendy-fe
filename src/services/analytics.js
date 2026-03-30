import ReactGA from 'react-ga4';

class GoogleAnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.measurementId = null;
  }

  /**
   * Initialize Google Analytics
   * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
   */
  initialize(measurementId) {
    if (!measurementId) {
      console.warn('Google Analytics Measurement ID not provided');
      return false;
    }

    try {
      ReactGA.initialize(measurementId, {
        debug: process.env.NODE_ENV === 'development',
        testMode: process.env.NODE_ENV === 'test'
      });

      this.isInitialized = true;
      this.measurementId = measurementId;
      console.log('Google Analytics initialized successfully:', measurementId);
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
      return false;
    }
  }

  /**
   * Track page views
   * @param {string} path - Page path
   * @param {string} title - Page title
   */
  trackPageView(path, title) {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title
    });
  }

  /**
   * Track custom events
   * @param {string} action - Event action
   * @param {string} category - Event category
   * @param {string} label - Event label (optional)
   * @param {number} value - Event value (optional)
   */
  trackEvent(action, category, label = null, value = null) {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    const eventData = {
      action,
      category
    };

    if (label) eventData.label = label;
    if (value !== null) eventData.value = value;

    ReactGA.event(eventData);
  }

  /**
   * Track user interactions specific to your calendly app
   */
  trackAppointmentBooked(serviceType, businessId) {
    this.trackEvent('appointment_booked', 'engagement', serviceType, 1);
  }

  trackUserRegistration(method) {
    this.trackEvent('user_registration', 'user_action', method, 1);
  }

  trackLogin(method) {
    this.trackEvent('login', 'user_action', method, 1);
  }

  trackServiceCreated(serviceType) {
    this.trackEvent('service_created', 'business_action', serviceType, 1);
  }

  trackSubscriptionUpgrade(planType) {
    this.trackEvent('subscription_upgrade', 'conversion', planType, 1);
  }

  trackBusinessProfileCompleted() {
    this.trackEvent('business_profile_completed', 'onboarding', null, 1);
  }

  trackClientInviteSent(method) {
    this.trackEvent('client_invite_sent', 'engagement', method, 1);
  }

  trackNotificationSent(type) {
    this.trackEvent('notification_sent', 'communication', type, 1);
  }

  /**
   * Set user properties
   * @param {string} userId - User ID
   * @param {object} properties - User properties
   */
  setUserProperties(userId, properties = {}) {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    ReactGA.set({
      user_id: userId,
      ...properties
    });
  }

  /**
   * Track conversion events (for business goals)
   */
  trackConversion(conversionType, value = null) {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    ReactGA.event({
      action: 'conversion',
      category: 'business_goal',
      label: conversionType,
      value: value
    });
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      measurementId: this.measurementId
    };
  }
}

// Create singleton instance
const gaService = new GoogleAnalyticsService();

export default gaService;
