import { useBatchTranslation } from '../contexts/BatchTranslationContext';

/**
 * useBatchTranslation Hook
 * 
 * Provides access to the batch translation system with the following features:
 * - Batch translation of all text when language changes
 * - Caching for performance
 * - Loading states
 * - Common text access
 * - Individual text translation
 */
export const useBatchTranslationHook = () => {
  const {
    currentLanguage,
    commonTexts,
    isLoading,
    isProcessingBatch,
    changeLanguage,
    translateText,
    getCachedTranslation,
    addToBatchQueue,
    tc,
    t,
    getCached,
    isTranslated
  } = useBatchTranslation();

  return {
    // State
    currentLanguage,
    commonTexts,
    isLoading,
    isProcessingBatch,
    isTranslated,
    
    // Actions
    changeLanguage,
    translateText,
    getCachedTranslation,
    addToBatchQueue,
    
    // Convenience functions
    tc, // Get common text
    t,  // Translate text
    getCached, // Get cached translation
    
    // Utility functions
    isEnglish: currentLanguage === 'en',
    isTranslating: isLoading || isProcessingBatch
  };
};

// Export the hook as default for backward compatibility
export default useBatchTranslationHook;
