import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BatchTranslationContext } from '../../contexts/BatchTranslationContext';

const LanguageSelectionModal = ({ isOpen, onClose }) => {
  const context = useContext(BatchTranslationContext);
  const currentLanguage = context?.currentLanguage || 'en';
  const changeLanguage = context?.changeLanguage || (() => {});
  const tc = context?.tc || ((key) => key);
  
  // Get the effective current language (from localStorage or context, default to 'en')
  const getCurrentLanguage = useCallback(() => {
    const savedLanguage = localStorage.getItem('youCalendy_selectedLanguage');
    return savedLanguage || currentLanguage || 'en';
  }, [currentLanguage]);

  // Initialize selectedLanguage with current language, default to 'en' if none
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('youCalendy_selectedLanguage');
    return savedLanguage || currentLanguage || 'en';
  });

  // Update selectedLanguage when modal opens or currentLanguage changes
  useEffect(() => {
    if (isOpen) {
      const lang = getCurrentLanguage();
      setSelectedLanguage(lang);
    }
  }, [isOpen, getCurrentLanguage]);

  // Get the language to use for translations (should match the current/selected language)
  const displayLanguage = getCurrentLanguage();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const languages = [
    { 
      value: 'en', 
      label: displayLanguage === 'es' ? 'Inglés' : 'English', 
      flag: '🇺🇸', 
      nativeLabel: 'English' 
    },
    { 
      value: 'es', 
      label: displayLanguage === 'es' ? 'Español' : 'Spanish', 
      flag: '🇪🇸', 
      nativeLabel: 'Español' 
    }
  ];

  // Translation texts based on current language
  const translations = {
    en: {
      title: 'Select Your Language',
      subtitle: 'Choose your preferred language',
      helperText: 'You can change this later using the language selector at the top'
    },
    es: {
      title: 'Selecciona tu idioma',
      subtitle: 'Elige tu idioma preferido',
      helperText: 'Puedes cambiar esto más tarde usando el selector de idioma en la parte superior'
    }
  };

  const t = translations[displayLanguage] || translations.en;

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    
    // Save language preference permanently
    if (changeLanguage && typeof changeLanguage === 'function') {
      changeLanguage(language);
    }
    
    // Also save directly to localStorage as backup
    try {
      localStorage.setItem('youCalendy_selectedLanguage', language);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
    
    // Close modal after a brief delay to show selection
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-[90%] mx-auto border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#93B45A] to-[#7a9a4a] mb-3 shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              {t.title}
            </h2>
            <p className="text-gray-500 text-sm">
              {t.subtitle}
            </p>
          </div>

          {/* Language Options */}
          <div className="space-y-3 mb-6">
            {languages.map((lang) => (
              <motion.button
                key={lang.value}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleLanguageSelect(lang.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  selectedLanguage === lang.value
                    ? 'border-[#93B45A] bg-gradient-to-r from-[#93B45A]/10 to-[#93B45A]/5 shadow-md'
                    : 'border-gray-200 hover:border-[#93B45A]/50 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                {/* Background gradient effect for selected */}
                {selectedLanguage === lang.value && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#93B45A]/5 to-transparent"
                  />
                )}
                
                {/* Flag */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 ${
                  selectedLanguage === lang.value ? 'scale-105' : ''
                }`} data-i18n-skip="true">
                  {lang.flag}
                </div>
                
                {/* Language Info */}
                <div className="flex-1 text-left relative z-10">
                  <div className={`font-bold text-gray-900 text-lg mb-0.5 transition-colors ${
                    selectedLanguage === lang.value ? 'text-[#93B45A]' : ''
                  }`}>
                    {lang.nativeLabel}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {lang.label}
                  </div>
                </div>
                
                {/* Checkmark Icon */}
                {selectedLanguage === lang.value && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-[#93B45A] flex items-center justify-center shadow-md relative z-10"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </motion.div>
                )}
                
                {/* Unselected indicator */}
                {selectedLanguage !== lang.value && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 relative z-10" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Helper Text */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {t.helperText}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LanguageSelectionModal;

