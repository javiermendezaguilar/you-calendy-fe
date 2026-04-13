/**
 * Context Detection Service
 * 
 * This service detects the current user context to optimize translation loading:
 * - BARBER: Barber dashboard pages (/dashboard/*)
 * - ADMIN: Admin pages (/admin/*)
 * - CLIENT: Client pages (/client/*)
 * - PUBLIC: Landing pages, auth pages, and other public pages
 */

class ContextDetectionService {
  constructor() {
    this.currentContext = 'PUBLIC';
    this.listeners = new Set();
  }

  // Add listener for context changes
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentContext));
  }

  // Detect context based on current pathname
  detectContext(pathname = window.location.pathname) {
    let newContext = 'PUBLIC';

    if (pathname.startsWith('/admin')) {
      newContext = 'ADMIN';
    } else if (pathname.startsWith('/dashboard')) {
      newContext = 'BARBER';
    } else if (pathname.startsWith('/client')) {
      newContext = 'CLIENT';
    } else if (pathname.startsWith('/barber/profile/')) {
      // Public barber profile pages should have translation enabled
      newContext = 'BARBER_PROFILE';
    } else {
      // Public pages: landing, auth, help, etc.
      newContext = 'PUBLIC';
    }

    if (newContext !== this.currentContext) {
      this.currentContext = newContext;
      this.notifyListeners();
    }

    return newContext;
  }

  // Check if current page should have translation enabled
  shouldEnableTranslation(pathname = window.location.pathname) {
    const context = this.detectContext(pathname);
    
    // Exclude specific public pages from translation
    const publicPages = [
      '/',
      '/login',
      '/registration',
      '/details',
      '/configuration',
      '/location',
      '/business-hours',
      '/services',
      '/welcome',
      '/plan',
      '/admin-login',
      '/help-center',
      '/terms-and-conditions',
      '/privacy-policy',
      '/session-expired',
      '/client-session-expired'
    ];
    
    // Check if current path is a public page
    if (publicPages.includes(pathname)) {
      return false;
    }
    
    // Enable translation for authenticated user areas and public barber profiles
    return context === 'BARBER' || context === 'ADMIN' || context === 'CLIENT' || context === 'BARBER_PROFILE';
  }

  // Check if page has language selector (topbar/header)
  hasLanguageSelector(pathname = window.location.pathname) {
    // Use the same logic as shouldEnableTranslation
    // Language selector is only present on pages that support translation
    return this.shouldEnableTranslation(pathname);
  }

  // Get current context
  getCurrentContext() {
    return this.currentContext;
  }

  // Get context-specific text categories
  getContextTextCategories(context = this.currentContext) {
    const categories = {
      BARBER: [
        'dashboard',
        'appointments',
        'clients',
        'marketing',
        'staff',
        'business',
        'support',
        'common'
      ],
      BARBER_PROFILE: [
        'barber-profile',
        'appointments',
        'gallery',
        'services',
        'booking',
        'common'
      ],
      ADMIN: [
        'admin',
        'barber-management',
        'client-management',
        'platform-settings',
        'security',
        'support',
        'common'
      ],
      CLIENT: [
        'client',
        'profile',
        'appointments',
        'gallery',
        'notifications',
        'common'
      ],
      PUBLIC: [] // No translation for public pages
    };

    return categories[context] || [];
  }

  // Provide a minimal fallback set when no page texts have been registered yet
  getContextSpecificTexts(context = this.currentContext) {
    const textsByContext = {
      BARBER: [
        'Dashboard',
        'Appointments',
        'Clients',
        'Marketing',
        'Staff',
        'Support',
      ],
      BARBER_PROFILE: [
        'Book appointment',
        'Services',
        'Gallery',
        'Reviews',
      ],
      ADMIN: [
        'Admin Dashboard',
        'Barber Management',
        'Client Management',
        'Support',
      ],
      CLIENT: [
        'Profile',
        'Appointments',
        'Notifications',
        'Gallery',
      ],
      PUBLIC: [],
    };

    return textsByContext[context] || [];
  }

  // Check if a text belongs to current context
  isTextRelevantToContext(text, context = this.currentContext) {
    if (context === 'PUBLIC') {
      return false; // No translation for public pages
    }

    // Skip translation for numbers only
    if (/^\d+$/.test(text.trim())) {
      return false;
    }

    // Skip external library content (TanStack Query, React Query, etc.)
    const externalLibraryKeywords = [
      'tanstack', 'react-query', 'usequery', 'usemutation', 'querykey',
      'queryclient', 'invalidatequeries', 'refetchqueries', 'setquerydata',
      'getquerydata', 'suspense', 'errorboundary', 'staletime', 'cachetime',
      'refetchinterval', 'refetchonwindowfocus', 'retry', 'retrydelay'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Skip external library content
    if (externalLibraryKeywords.some(keyword => lowerText.includes(keyword))) {
      return false;
    }

    // For authenticated contexts, translate ALL project content except exclusions above
    // Context separation is handled by route-based loading, not text filtering
    return true;
  }

  // Check if text is barber-specific
  isBarberText(lowerText) {
    const barberKeywords = [
      'dashboard', 'appointment', 'client', 'marketing', 'staff',
      'business', 'service', 'barber', 'schedule', 'calendar',
      'booking', 'revenue', 'earnings', 'gallery', 'review',
      'support', 'suggest', 'feature', 'notification', 'choose',
      'file', 'remove', 'full', 'name', 'user', 'profile',
      'welcome', 'calendy', 'management', 'time', 'booked',
      'finished', 'shows', 'confirmed', 'cancelled', 'auto',
      'reminders', 'notify', 'delay', 'statistics', 'overview'
    ];
    return barberKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Check if text is admin-specific
  isAdminText(lowerText) {
    const adminKeywords = [
      'admin', 'management', 'platform', 'security', 'audit',
      'subscription', 'barber management', 'client management',
      'proposed interfaces', 'sub-admin', 'overview', 'directory',
      'browse', 'accounts', 'search', 'filter', 'appointments',
      'revenue', 'status', 'items', 'page', 'manage', 'registered',
      'barbers', 'monitor', 'maintain', 'statistics', 'metrics',
      'export', 'csv', 'pdf', 'monthly', 'total', 'completion',
      'rate', 'dashboard', 'load', 'failed', 'registered',
      'activity', 'glance', 'support', 'communication', 'notification',
      'alerts', 'tickets', 'technical', 'mass', 'target', 'audience',
      'users', 'pricing', 'plans', 'trials', 'promotional', 'offers',
      'monetization', 'integrations', 'third-party', 'tools',
      'analytics', 'capabilities', 'create', 'package', 'google'
    ];
    return adminKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Check if text is client-specific
  isClientText(lowerText) {
    const clientKeywords = [
      'client', 'profile', 'appointment', 'gallery', 'photo',
      'suggestion', 'report', 'feedback', 'haircut', 'invitation',
      'search', 'sort', 'filter', 'name', 'email', 'address',
      'status', 'filled', 'inactive', 'active', 'directory',
      'browse', 'accounts', 'activity', 'administrative', 'actions',
      'notes', 'description', 'phone', 'private', 'additional',
      'associated', 'staff', 'member', 'sms', 'complete',
      'visit', 'data', 'available', 'issue', 'content',
      'rating', 'respond', 'send', 'found', 'failed', 'image'
    ];
    return clientKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Initialize context detection
  initialize() {
    this.detectContext();
    
    // Listen for route changes
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.detectContext();
      });
      
      // Also listen for pushState/replaceState (for React Router)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => contextDetectionService.detectContext(), 0);
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => contextDetectionService.detectContext(), 0);
      };
    }
  }
}

const contextDetectionService = new ContextDetectionService();

// Initialize on import
if (typeof window !== 'undefined') {
  contextDetectionService.initialize();
}

export default contextDetectionService;
