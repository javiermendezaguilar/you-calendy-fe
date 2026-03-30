import api from '../configs/axios.config';

/**
 * Translate text using the backend translation API
 * @param {string | string[]} text - The text to translate (string) or array of texts
 * @param {string} targetLang - The target language code (e.g., 'es', 'fr')
 * @returns {Promise<string>} - The translated text (returns first element when array passed)
 */
export const translateText = async (text, targetLang) => {
  try {
    const response = await api.post('/translate', {
      // Ensure the API always receives an array as required
      text: Array.isArray(text) ? text : [text],
      targetLang
    });
    
    const translated = response?.data?.data?.translated;

    // If API returns an array (expected), return the first translated text
    if (Array.isArray(translated)) {
      return translated[0] ?? (Array.isArray(text) ? text[0] : text);
    }

    // Fallbacks for backward compatibility
    if (typeof translated === 'string') {
      return translated;
    }
    
    return Array.isArray(text) ? text[0] : text;
  } catch (error) {
    console.error('Translation API error:', error);
    return Array.isArray(text) ? text[0] : text;
  }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - The target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (texts, targetLang) => {
  try {
    // Use a single API call with array payload to comply with API requirement
    const response = await api.post('/translate', {
      text: Array.isArray(texts) ? texts : [texts],
      targetLang
    });

    const translated = response?.data?.data?.translated;
    if (Array.isArray(translated)) return translated;

    // Fallback if server unexpectedly returns a single string
    if (typeof translated === 'string') return [translated];

    // Return original texts on unexpected response
    return Array.isArray(texts) ? texts : [texts];
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts on error
    return Array.isArray(texts) ? texts : [texts];
  }
};
