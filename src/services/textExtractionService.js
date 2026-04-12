/**
 * Text Extraction Service
 * Automatically discovers and extracts hardcoded text from React components
 * Follows industry best practices for internationalization
 */

class TextExtractionService {
  constructor() {
    this.extractedTexts = new Set();
    this.componentTexts = new Map();
    this.isExtracting = false;
    this.observers = [];
  }

  /**
   * Initialize text extraction for the current page
   */
  async initializeExtraction() {
    if (this.isExtracting) return;
    
    this.isExtracting = true;
    this.extractedTexts.clear();
    
    // Start observing DOM changes
    this.startDOMObserver();
    
    // Extract initial text content
    this.extractFromDOM();
    
    // Extract from React component tree
    await this.extractFromReactComponents();
  }

  /**
   * Start observing DOM changes to catch dynamically added content
   */
  startDOMObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.extractFromElement(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  /**
   * Extract text from DOM elements
   */
  extractFromDOM() {
    const textElements = document.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, button, label, a, td, th, li'
    );

    textElements.forEach(element => {
      this.extractFromElement(element);
    });

    // Extract placeholder text
    const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputElements.forEach(element => {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder && this.isTranslatableText(placeholder)) {
        this.addExtractedText(placeholder, 'placeholder');
      }
    });

    // Extract aria-labels and titles
    const ariaElements = document.querySelectorAll('[aria-label], [title]');
    ariaElements.forEach(element => {
      const ariaLabel = element.getAttribute('aria-label');
      const title = element.getAttribute('title');
      
      if (ariaLabel && this.isTranslatableText(ariaLabel)) {
        this.addExtractedText(ariaLabel, 'aria-label');
      }
      
      if (title && this.isTranslatableText(title)) {
        this.addExtractedText(title, 'title');
      }
    });
  }

  /**
   * Extract text from a specific DOM element
   */
  extractFromElement(element) {
    // Skip developer tools and non-website content
    if (this.shouldSkipElement(element)) {
      return;
    }

    // For elements with data-translated="true", extract the original translation key
    if (element.hasAttribute('data-translated') && element.getAttribute('data-translated') === 'true') {
      // Try to find the original text from the element's content
      const displayedText = element.textContent.trim();
      if (displayedText && this.isTranslatableText(displayedText)) {
        this.addExtractedText(displayedText, 'translated-content');
      }
      return;
    }

    // Skip if element has i18n-skip attribute
    if (element.hasAttribute('data-i18n-skip')) {
      return;
    }

    // Get direct text content (not from children)
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Only accept text nodes that are direct children
          return node.parentNode === element ? 
            NodeFilter.FILTER_ACCEPT : 
            NodeFilter.FILTER_REJECT;
        }
      }
    );

    let textNode;
    while (textNode = walker.nextNode()) {
      const text = textNode.textContent.trim();
      if (text && this.isTranslatableText(text)) {
        this.addExtractedText(text, 'content');
      }
    }
  }

  /**
   * Check if element should be skipped during extraction
   */
  shouldSkipElement(element) {
    // Note: We now process elements with data-translated="true" to extract their content
    // This change allows us to capture translated content for the translation API

    // Skip style elements and CSS content
    if (element.tagName === 'STYLE' || element.tagName === 'LINK' || element.tagName === 'SCRIPT') {
      return true;
    }

    // Skip elements with specific classes or IDs that indicate developer tools
    const skipSelectors = [
      '[class*="devtools"]',
      '[class*="react-query"]',
      '[class*="tanstack"]',
      '[class*="apexcharts"]',
      '[class*="apex-charts"]',
      '[id*="devtools"]',
      '[id*="react-query"]',
      '[id*="apexcharts"]',
      '[data-testid]',
      '.mantine-spotlight-root',
      '.mantine-spotlight-overlay',
      '[class*="spotlight"]',
      '[title*="alt+"]',
      '[aria-label*="alt+"]',
      '[class*="shortcut"]',
      '[class*="hotkey"]',
      '[data-hotkey]',
      '[accesskey]'
    ];

    // Check if element matches any skip selector
    for (const selector of skipSelectors) {
      if (element.matches && element.matches(selector)) {
        return true;
      }
    }

    // Skip elements with keyboard shortcuts or accessibility attributes that might contain shortcuts
    if (element.hasAttribute('accesskey') || 
        element.hasAttribute('data-hotkey') ||
        (element.getAttribute('title') && element.getAttribute('title').includes('alt+')) ||
        (element.getAttribute('aria-label') && element.getAttribute('aria-label').includes('alt+'))) {
      return true;
    }

    // Skip if element is inside a developer tool container
    const parentElement = element.closest('[class*="devtools"], [class*="react-query"], [class*="tanstack"], [class*="spotlight"]');
    if (parentElement) {
      return true;
    }

    // Skip elements that are not visible (hidden developer tools)
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true;
    }

    return false;
  }

  /**
   * Extract text from React components using React DevTools
   */
  async extractFromReactComponents() {
    // Extract all translation keys from BatchTranslationContext
    await this.extractFromTranslationKeys();
    
    // This would require React DevTools integration
    // For now, we'll rely on DOM extraction and manual registration
  // Debug: React component extraction placeholder (silenced)
  }

  /**
   * Extract all translation keys from the BatchTranslationContext
   */
  async extractFromTranslationKeys() {
    try {
      const catalog = window.__batchTranslationCatalog;
      
      // Access the TRANSLATION_KEYS if exported
      if (catalog?.TRANSLATION_KEYS) {
        Object.values(catalog.TRANSLATION_KEYS).forEach(text => {
          if (text && this.isTranslatableText(text)) {
            this.addExtractedText(text, 'translation-key');
          }
        });
        // console.log(`Extracted ${Object.keys(catalog.TRANSLATION_KEYS).length} translation keys`);
      }
      
      // Also extract from COMMON_TEXTS if available
      if (catalog?.COMMON_TEXTS) {
        catalog.COMMON_TEXTS.forEach(text => {
          if (text && this.isTranslatableText(text)) {
            this.addExtractedText(text, 'common-text');
          }
        });
  // Debug: common texts count (silenced)
      }
    } catch (error) {
      console.warn('Error extracting translation keys:', error);
      this.extractFromWindowTranslationKeys();
    }
  }

  /**
   * Fallback method to extract translation keys from window object
   */
  extractFromWindowTranslationKeys() {
    // Define the translation keys directly as fallback
    const fallbackTranslationKeys = {
      'dashboard': 'Dashboard',
      'appointments': 'Appointments', 
      'clients': 'Clients',
      'marketing': 'Marketing',
      'staffManagement': 'Staff Management',
      'clientsNotes': 'Clients Notes',
      'businessSettings': 'Business Settings',
      'support': 'Support',
      'suggestFeature': 'Suggest Feature',
      'appointment': 'Appointment',
      'notification': 'Notification',
      'appointmentsOccupancy': 'Appointments & Occupancy',
      'revenueProjection': 'Revenue Projection',
      'loginSuccessful': 'Login successful',
      'profile': 'Profile',
      'welcomeToYouCalendyManagement': 'Welcome to YouCalendy Management',
      'makeAnAppointment': 'Make an appointment',
      'easilyManageClientsBookings': 'Easily manage your clients and bookings',
      'clientHasGivenSuggestion': 'Client has given a suggestion about the haircut style',
      'forMyUpcomingAppointment': 'For my upcoming appointment, I\'d like to try a specific haircut style. Let me know if it suits me!',
      'mins': 'Mins',
      'share': 'Share',
      'shareAppointment': 'Share Appointment',
      'logIn': 'Log in',
      'signUpFree': 'Sign Up Free',
      'close': 'Close',
      'cancel': 'Cancel'
    };

    Object.values(fallbackTranslationKeys).forEach(text => {
      if (text && this.isTranslatableText(text)) {
        this.addExtractedText(text, 'fallback-translation-key');
      }
    });
  }

  /**
   * Check if text should be translated
   */
  isTranslatableText(text) {
    // Skip empty strings
    if (!text || text.trim().length === 0) return false;
    
    // Skip single characters
    if (text.trim().length === 1) return false;
    
    // Skip numbers only
    if (/^\d+$/.test(text.trim())) return false;
    
    // Skip URLs
    if (/^https?:\/\//.test(text.trim())) return false;
    
    // Skip email addresses
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) return false;
    
    // Skip CSS classes and IDs
    if (/^[.#][a-zA-Z0-9_-]+$/.test(text.trim())) return false;
    
    // Skip file paths
    if (/[\/\\]/.test(text.trim())) return false;
    
    // Skip code-like strings
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text.trim()) && text.trim().length < 3) return false;
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(text)) return false;
    
    // Skip language names (should not be translated)
    const languageNames = [
      'Language', 'English', 'Spanish', 'French', 'German', 'Italian', 
      'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
    ];
    if (languageNames.includes(text.trim())) return false;
    
    // Content handled by translation system is now marked with data-translated attribute
    // and will be skipped during DOM extraction, so no need for hardcoded patterns
    
    // Skip developer tools and non-website content
    const developerToolsPatterns = [
      /open\s+tanstack\s+query\s+devtools/i,
      /react\s+query\s+devtools/i,
      /devtools/i,
      /toggle\s+navigation/i,
      /notifications\s+alt\+t/i,
      /keyboard\s+shortcut/i,
      /alt\+[a-z0-9]/i,
      /ctrl\+[a-z0-9]/i,
      /cmd\+[a-z0-9]/i,
      /shift\+[a-z0-9]/i,
      /\b[a-z]+\s+alt\+[a-z0-9]/i,
      /\balt\+[a-z0-9]\s+[a-z]+/i
    ];
    
    if (developerToolsPatterns.some(pattern => pattern.test(text.trim()))) {
      return false;
    }
    
    // Skip language flags and language selection text
    const languagePatterns = [
      /^🇺🇸\s*English$/i,
      /^🇪🇸\s*Español$/i,
      /^🇫🇷\s*Français$/i,
      /^🇩🇪\s*Deutsch$/i,
      /^🇮🇹\s*Italiano$/i,
      /^🇵🇹\s*Português$/i,
      /^[\u{1F1E6}-\u{1F1FF}]{2}\s*[a-zA-Z]+$/u,  // Any flag emoji followed by language name
      /^(English|Español|Français|Deutsch|Italiano|Português)$/i
    ];
    
    if (languagePatterns.some(pattern => pattern.test(text.trim()))) {
      return false;
    }
    
    // Skip CSS content and styling patterns
    const cssPatterns = [
      /\.(apexcharts|apex-charts)/i,
      /transform\s*:/i,
      /flex-direction\s*:/i,
      /justify-content\s*:/i,
      /align-items\s*:/i,
      /position\s*:\s*(relative|absolute|fixed)/i,
      /display\s*:\s*(flex|block|none)/i,
      /cursor\s*:\s*(pointer|auto)/i,
      /opacity\s*:\s*[0-9.]+/i,
      /margin\s*:/i,
      /padding\s*:/i,
      /font-size\s*:/i,
      /line-height\s*:/i,
      /overflow\s*:/i,
      /pointer-events\s*:/i,
      /transform-origin\s*:/i,
      /transform-box\s*:/i,
      /flex-wrap\s*:/i,
      /bottom\s*:\s*[0-9]+/i,
      /scaleY\(-1\)/i,
      /scaleX\(-1\)/i,
      /translateY\(-100%\)/i
    ];

    if (cssPatterns.some(pattern => pattern.test(text.trim()))) {
      return false;
    }

    // Skip common non-translatable patterns
    const skipPatterns = [
      /^\s*[{}()\[\]<>]+\s*$/,  // Brackets and symbols only
      /^\s*[.,;:!?]+\s*$/,      // Punctuation only
      /^\s*[-_=+*\/]+\s*$/,     // Special characters only
      /^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i, // Time formats
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // Date formats
      /^[A-Z]{2,}$/,             // All caps abbreviations (unless common words)
    ];
    
    return !skipPatterns.some(pattern => pattern.test(text.trim()));
  }

  /**
   * Add extracted text to the collection
   */
  addExtractedText(text, type = 'content') {
    const cleanText = text.trim();
    if (cleanText && !this.extractedTexts.has(cleanText)) {
      this.extractedTexts.add(cleanText);
  // Debug: extracted text (silenced)
    }
  }

  /**
   * Get all extracted texts as an array
   */
  getExtractedTexts() {
    return Array.from(this.extractedTexts);
  }

  /**
   * Get extracted texts grouped by component/page
   */
  getGroupedTexts() {
    return Object.fromEntries(this.componentTexts);
  }

  /**
   * Register texts for a specific component
   */
  registerComponentTexts(componentName, texts) {
    this.componentTexts.set(componentName, texts);
    texts.forEach(text => this.extractedTexts.add(text));
  }

  /**
   * Stop all observers and cleanup
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isExtracting = false;
  }

  /**
   * Reset the service
   */
  reset() {
    this.cleanup();
    this.extractedTexts.clear();
    this.componentTexts.clear();
  }
}

// Create singleton instance
const textExtractionService = new TextExtractionService();

export default textExtractionService;

// Export utility functions
export const extractTextsFromPage = async () => {
  await textExtractionService.initializeExtraction();
  return textExtractionService.getExtractedTexts();
};

export const getPageTexts = () => {
  return textExtractionService.getExtractedTexts();
};

export const registerPageTexts = (componentName, texts) => {
  textExtractionService.registerComponentTexts(componentName, texts);
};

export const cleanupExtraction = () => {
  textExtractionService.cleanup();
};
