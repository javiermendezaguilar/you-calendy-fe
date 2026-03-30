import { translateText, translateBatch } from './translationAPI';
import contextDetectionService from './contextDetectionService';

// Global cache for translations
const globalTranslationCache = new Map();
const pendingTranslations = new Map();
let isProcessingBatch = false;
let currentPageTexts = new Set();
let currentPage = null;

// Expose cache to window for debugging
if (typeof window !== 'undefined') {
  window.__translationCache = globalTranslationCache;
}

/**
 * Page-Based Batch Translation Service
 * 
 * This service implements efficient page-based batch translation by:
 * 1. Gathering all text for the current page
 * 2. Making a single API call per page when language changes
 * 3. Caching results for future use
 * 4. Providing loading states during translation
 */

class BatchTranslationService {
  constructor() {
    this.listeners = new Set();
    this.isLoading = false;
    // Load saved language from localStorage, default to 'en'
    this.currentLanguage = this.loadSavedLanguage();
    this.pageTexts = new Map(); // Store texts per page
    
    // Load user's language preference from backend if authenticated
    this.loadUserLanguagePreference();
    
    // For non-authenticated users, try browser detection if language is still English
    setTimeout(() => {
      this.handleInitialLanguageDetection();
    }, 1000);
  }

  // Load saved language from localStorage
  loadSavedLanguage() {
    try {
      const savedLanguage = localStorage.getItem('youCalendy_selectedLanguage');
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        // console.log('[BatchTranslation] Loaded saved language:', savedLanguage);
        return savedLanguage;
      }
    } catch (error) {
      console.warn('[BatchTranslation] Failed to load saved language:', error);
    }
    return 'en'; // Default to English
  }
  

  // Load user's language preference (local-only; backend disabled)
  async loadUserLanguagePreference() {
    try {
      const savedLanguage = this.loadSavedLanguage();
      if (savedLanguage && this.isValidLanguage(savedLanguage) && savedLanguage !== 'en') {
        this.currentLanguage = savedLanguage;
        this.notifyListeners();
        return;
      }
      
      // Fallback to browser detection for all contexts
      await this.detectAndSetBrowserLanguage();
    } catch (error) {
      console.warn('[BatchTranslation] Failed to load user language preference:', error);
    }
  }

  // Save language to localStorage
  saveLanguage(language) {
    try {
      localStorage.setItem('youCalendy_selectedLanguage', language);
      // console.log('[BatchTranslation] Saved language to localStorage:', language);
    } catch (error) {
      console.warn('[BatchTranslation] Failed to save language:', error);
    }
  }

  // Validate if language code is supported
  isValidLanguage(languageCode) {
    const supportedLanguages = ['en', 'es'];
    return supportedLanguages.includes(languageCode);
  }

  // Detect browser language and set it when user language is English from API
  async detectAndSetBrowserLanguage() {
    try {
      // Get browser language
      const browserLanguage = this.getBrowserLanguage();
      
      if (browserLanguage && browserLanguage !== 'en' && this.isValidLanguage(browserLanguage)) {
        console.log('[BatchTranslation] Detected browser language:', browserLanguage);
        
        // Check if we're on barber profile pages
        const isBarberProfile = this.isBarberProfileContext();
        
        // Backend save disabled; updating locally only
        // console.log('[BatchTranslation] Backend save disabled in detectAndSetBrowserLanguage');
        
        // Update local state (always, regardless of context)
        this.currentLanguage = browserLanguage;
        this.saveLanguage(browserLanguage);
        this.notifyListeners();
        
        return browserLanguage;
      }
      
      return null;
    } catch (error) {
      console.warn('[BatchTranslation] Failed to detect and set browser language:', error);
      return null;
    }
  }

  // Get browser language with fallback logic
  getBrowserLanguage() {
    try {
      // Get the primary language from navigator
      let language = navigator.language || navigator.languages?.[0] || navigator.userLanguage;
      
      if (!language) return 'en';
      
      // Extract the primary language code (e.g., 'en-US' -> 'en', 'zh-CN' -> 'zh')
      language = language.split('-')[0].toLowerCase();
      
      // Map some common language variants
      const languageMap = {
        'zh': 'zh', // Chinese
        'ja': 'ja', // Japanese
        'ko': 'ko', // Korean
        'ar': 'ar', // Arabic
        'hi': 'hi', // Hindi
        'es': 'es', // Spanish
        'fr': 'fr', // French
        'de': 'de', // German
        'it': 'it', // Italian
        'pt': 'pt', // Portuguese
        'ru': 'ru', // Russian
      };
      
      return languageMap[language] || 'en';
    } catch (error) {
      console.warn('[BatchTranslation] Failed to get browser language:', error);
      return 'en';
    }
  }

  // Check if we're in barber profile context
  isBarberProfileContext() {
    try {
      const pathname = window.location.pathname;
      
      // Check for barber profile routes
      const isBarberRoute = pathname.startsWith('/barber/') || 
                           pathname.includes('/barber/') ||
                           pathname.match(/\/barber\/[^\/]+$/); // matches /barber/{linkToken}
      
      // Also check if we have public barber data in localStorage
      const hasPublicBarberData = localStorage.getItem('publicBarberData') && 
                                 localStorage.getItem('publicBusinessId');
      
      return isBarberRoute || hasPublicBarberData;
    } catch (error) {
      console.warn('[BatchTranslation] Failed to detect barber profile context:', error);
      return false;
    }
  }

  // Handle initial language detection for non-authenticated users
  async handleInitialLanguageDetection() {
    try {
      const isBarberProfile = this.isBarberProfileContext();
      
      if (isBarberProfile) {
        // For barber profile: check localStorage first, then browser detection
        const savedLanguage = this.loadSavedLanguage();
        
        if (savedLanguage && savedLanguage !== 'en' && this.isValidLanguage(savedLanguage)) {
          console.log('[BatchTranslation] Barber profile - using saved language from localStorage:', savedLanguage);
          this.currentLanguage = savedLanguage;
          this.notifyListeners();
        } else {
          // No saved language or it's English, try browser detection
          const browserLanguage = this.getBrowserLanguage();
          
          if (browserLanguage && browserLanguage !== 'en' && this.isValidLanguage(browserLanguage)) {
            console.log('[BatchTranslation] Detected browser language for barber profile:', browserLanguage);
            
            // Update local state (no backend save for barber profiles)
            this.currentLanguage = browserLanguage;
            this.saveLanguage(browserLanguage);
            this.notifyListeners();
          }
        }
        return;
      }
      
      // For non-barber profile pages: only proceed if current language is English
      if (this.currentLanguage !== 'en') return;
      
      // Check if user is authenticated (if so, loadUserLanguagePreference will handle it)
      const token = sessionStorage.getItem('token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('adminToken') || 
                   localStorage.getItem('clientToken');
      
      if (token) return; // Let loadUserLanguagePreference handle authenticated users
      
      // For non-authenticated users, just detect and set locally
      const browserLanguage = this.getBrowserLanguage();
      
      if (browserLanguage && browserLanguage !== 'en' && this.isValidLanguage(browserLanguage)) {
        console.log('[BatchTranslation] Detected browser language for non-authenticated user:', browserLanguage);
        
        // Update local state
        this.currentLanguage = browserLanguage;
        this.saveLanguage(browserLanguage);
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('[BatchTranslation] Failed to handle initial language detection:', error);
    }
  }

  // Reset browser language detection (useful for testing scenarios)
  resetBrowserLanguageDetection() {
    try {
      localStorage.removeItem('youCalendy_browserLanguageDetected');
      console.log('[BatchTranslation] Browser language detection reset');
    } catch (error) {
      console.warn('[BatchTranslation] Failed to reset browser language detection:', error);
    }
  }

  // Add listener for state changes
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback({
      isLoading: this.isLoading,
      isProcessingBatch,
      currentLanguage: this.currentLanguage,
      translationsUpdated: Date.now() // Add timestamp to trigger re-renders
    }));
  }

  // Get cached translation
  getCachedTranslation(text, targetLang) {
    if (!text || !targetLang || targetLang === 'en') return text;
    const cacheKey = `${text}_${targetLang}`;
    return globalTranslationCache.get(cacheKey);
  }

  // Register text for current page with context filtering
  registerPageText(text, pageId = 'default') {
    if (!text || typeof text !== 'string') return;
    
    // Clean the text
    const cleanText = text.trim();
    if (!cleanText) return;
    
    // Check if translation should be enabled for current context
    if (!contextDetectionService.shouldEnableTranslation()) {
      // console.log('[BatchTranslation] Skipping text registration for public page:', cleanText);
      return;
    }
    
    // Check if text is relevant to current context
    const currentContext = contextDetectionService.getCurrentContext();
    if (!contextDetectionService.isTextRelevantToContext(cleanText, currentContext)) {
      // console.log(`[BatchTranslation] Skipping irrelevant text for ${currentContext}:`, cleanText);
      return;
    }
    
    // console.log(`[BatchTranslation] Registering text for ${currentContext}:`, cleanText);
    
    // Store text for this page
    if (!this.pageTexts.has(pageId)) {
      this.pageTexts.set(pageId, new Set());
    }
    this.pageTexts.get(pageId).add(cleanText);
    
    // Also add to current page texts if we're on this page
    if (currentPage === pageId) {
      currentPageTexts.add(cleanText);
    }
  }

  // Set current page
  setCurrentPage(pageId) {
    currentPage = pageId;
    currentPageTexts.clear();
    
    // Load texts for this page
    if (this.pageTexts.has(pageId)) {
      this.pageTexts.get(pageId).forEach(text => {
        currentPageTexts.add(text);
      });
    }
  }

  // Process batch translation for current page
  async processPageBatch() {
    if (isProcessingBatch) return;

    // If no texts are registered yet, try to harvest visible texts quickly
    if (currentPageTexts.size === 0) {
      try {
        // Pull any text nodes present to avoid needing a manual language toggle
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const txt = (node.textContent || '').trim();
          if (txt) {
            currentPageTexts.add(txt);
          }
        }
      } catch (e) {
        // ignore DOM access issues (SSR or restricted)
      }
      if (currentPageTexts.size === 0) return;
    }

    isProcessingBatch = true;
    this.isLoading = true;
    this.notifyListeners();

    try {
      // Get all texts for current page that need translation
      const textsToTranslate = Array.from(currentPageTexts).filter(text => {
        const cacheKey = `${text}_${this.currentLanguage}`;
        return !globalTranslationCache.has(cacheKey) && !pendingTranslations.has(cacheKey);
      });

      if (textsToTranslate.length === 0) {
        return;
      }

      // Mark texts as pending
      textsToTranslate.forEach(text => {
        const cacheKey = `${text}_${this.currentLanguage}`;
        pendingTranslations.set(cacheKey, true);
      });

      // Translation API disabled; use identity mapping to avoid network calls
      const translatedTexts = textsToTranslate.map(t => t);

      // Cache the results
      textsToTranslate.forEach((originalText, index) => {
        const translatedText = translatedTexts[index];
        const cacheKey = `${originalText}_${this.currentLanguage}`;
        
        globalTranslationCache.set(cacheKey, translatedText);
        pendingTranslations.delete(cacheKey);
      });

      // Persist per-language cache snapshot to localStorage to reduce repeat loads
      try {
        const entries = [];
        globalTranslationCache.forEach((value, key) => {
          if (key.endsWith(`_${this.currentLanguage}`)) {
            entries.push([key, value]);
          }
        });
        localStorage.setItem(`youCalendy_translationCache_${this.currentLanguage}`, JSON.stringify(entries));
      } catch (e) {
        // Ignore quota or serialization errors
      }
      
    } catch (error) {
      console.error('Page batch translation failed:', error);
      
      // Clear pending translations on error
      Array.from(currentPageTexts).forEach(text => {
        const cacheKey = `${text}_${this.currentLanguage}`;
        pendingTranslations.delete(cacheKey);
      });
    } finally {
      isProcessingBatch = false;
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Change language with context-aware batch processing
  async changeLanguage(newLanguage) {
    if (newLanguage === this.currentLanguage) return;

    this.currentLanguage = newLanguage;
    this.isLoading = true;
    this.notifyListeners();

    // Check if we're in barber profile context
    const isBarberProfile = this.isBarberProfileContext();
    
    // Backend language save disabled; apply local change only

    // Always save to localStorage regardless of context
    this.saveLanguage(newLanguage);

    if (newLanguage === 'en') {
      this.isLoading = false;
      this.notifyListeners();
      return;
    }

    // Check if translation should be enabled for current context
    if (!contextDetectionService.shouldEnableTranslation()) {
      // console.log('[BatchTranslation] Skipping translation for public page');
      this.isLoading = false;
      this.notifyListeners();
      return;
    }

    try {
      // Get current context and filter texts accordingly
      const currentContext = contextDetectionService.getCurrentContext();
      const allTexts = this.getAllRegisteredTexts();
      
      // Filter texts based on current context
      const contextRelevantTexts = allTexts.filter(text => 
        contextDetectionService.isTextRelevantToContext(text, currentContext)
      );
      
      // console.log(`[BatchTranslation] Context: ${currentContext}`);
    // console.log(`[BatchTranslation] Total registered texts: ${allTexts.length}`);
    // console.log(`[BatchTranslation] Context-relevant texts: ${contextRelevantTexts.length}`);
    // console.log('[BatchTranslation] Texts to translate:', contextRelevantTexts);
      
      // Clear current page texts and add only relevant ones
      currentPageTexts.clear();
      contextRelevantTexts.forEach(text => {
        currentPageTexts.add(text);
      });
      
      // If no texts are registered for this context, register some common texts for fallback
      if (currentPageTexts.size === 0) {
        const commonTexts = contextDetectionService.getContextSpecificTexts(currentContext);
        commonTexts.forEach(text => {
          this.registerPageText(text, currentPage || 'default');
          currentPageTexts.add(text);
        });
      }
      
      // console.log('[BatchTranslation] Final texts for translation:', Array.from(currentPageTexts));
      
      // Process batch for current page
      await this.processPageBatch();
      
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Ensure translations are hydrated for the current language without changing it
  async ensureTranslationsForCurrentLanguage() {
    try {
      if (this.currentLanguage === 'en') return;
      if (!contextDetectionService.shouldEnableTranslation()) return;
      if (isProcessingBatch) return;

      this.isLoading = true;
      this.notifyListeners();

      const currentContext = contextDetectionService.getCurrentContext();
      const allTexts = this.getAllRegisteredTexts();
      const contextRelevantTexts = allTexts.filter(text =>
        contextDetectionService.isTextRelevantToContext(text, currentContext)
      );

      currentPageTexts.clear();
      contextRelevantTexts.forEach(text => {
        currentPageTexts.add(text);
      });

      if (currentPageTexts.size === 0) {
        const commonTexts = contextDetectionService.getContextSpecificTexts(currentContext);
        commonTexts.forEach(text => {
          this.registerPageText(text, currentPage || 'default');
          currentPageTexts.add(text);
        });
      }

      await this.processPageBatch();
    } catch (error) {
      console.error('ensureTranslationsForCurrentLanguage failed:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Translate text (only from cache, no immediate API calls)
  translateText(text, targetLang) {
    if (!text || !targetLang || targetLang === 'en') return text;

    const cacheKey = `${text}_${targetLang}`;
    
    // Check if already cached
    const cached = globalTranslationCache.get(cacheKey);
    if (cached) return cached;

    // Check if pending
    if (pendingTranslations.has(cacheKey)) {
      // Return original text while pending
      return text;
    }

    // Register text for current page and return original text
    this.registerPageText(text, currentPage);
    return text;
  }

  // Get current state
  getState() {
    return {
      isLoading: this.isLoading,
      isProcessingBatch,
      currentLanguage: this.currentLanguage,
      currentPage,
      currentPageTextsSize: currentPageTexts.size
    };
  }

  // Clear cache
  clearCache() {
    globalTranslationCache.clear();
    pendingTranslations.clear();
    currentPageTexts.clear();
  }

  // Get all registered texts for debugging
  getAllRegisteredTexts() {
    const allTexts = new Set();
    this.pageTexts.forEach(pageTexts => {
      pageTexts.forEach(text => allTexts.add(text));
    });
    return Array.from(allTexts);
  }
}

// Create singleton instance
const batchTranslationService = new BatchTranslationService();

export default batchTranslationService;
