import React, { useEffect, useState, useContext } from 'react';
import { BatchTranslationContext } from '../../contexts/BatchTranslationContext';
import { useLocation } from 'react-router-dom';
import { IconLanguage, IconWorld } from '@tabler/icons-react';

const BatchTranslationLoader = ({ children, pageId = null }) => {
  // Safe context usage with debugging
  const context = useContext(BatchTranslationContext);
  
  const isLoading = context?.isLoading || false;
  const isProcessingBatch = context?.isProcessingBatch || false;
  const setCurrentPage = context?.setCurrentPage || (() => {});
  const currentLanguage = context?.currentLanguage || 'en';
  
  const location = useLocation();
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  // Determine page ID from location if not provided
  const currentPageId = pageId || location.pathname.replace(/\//g, '_').replace(/-/g, '_') || 'default';

  // Set current page when component mounts or page changes
  useEffect(() => {
    setCurrentPage(currentPageId);
  }, [currentPageId, setCurrentPage]);

  // Debounce loader display to avoid flicker on very fast translations
  useEffect(() => {
    let timeoutId;
    
    if (isLoading || isProcessingBatch) {
      // Track when loading started
      if (!loadingStartTime) {
        setLoadingStartTime(Date.now());
      }
      
      // Show loader after 100ms AND if still loading (reduced from 200ms)
      timeoutId = setTimeout(() => {
        const elapsed = Date.now() - (loadingStartTime || Date.now());
        if (elapsed >= 100 && (isLoading || isProcessingBatch)) {
          setShowLoader(true);
        }
      }, 100);
    } else {
      // Reset when loading completes
      setShowLoader(false);
      setLoadingStartTime(null);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isProcessingBatch, loadingStartTime]);

  // Animate dots for loading text
  useEffect(() => {
    if (isLoading || isProcessingBatch) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading, isProcessingBatch]);

  // Progress animation
  useEffect(() => {
    if (isLoading || isProcessingBatch) {
      setProgress(0);
      
      // Simulate progress over time
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90% until completion
          }
          return prev + Math.random() * 15 + 5; // Random increment between 5-20%
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      // Complete to 100% when done
      setProgress(100);
      
      // Reset after a short delay
      const resetTimeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      
      return () => clearTimeout(resetTimeout);
    }
  }, [isLoading, isProcessingBatch]);

  // Show loading overlay only when debounced loader should be shown
  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md">
        <div className="relative">
          {/* Main loader container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-sm mx-4">
            {/* Animated globe icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#93B45A] to-[#7A9B4A] rounded-full flex items-center justify-center shadow-lg">
                  <IconWorld size={32} className="text-white animate-pulse" />
                </div>
                {/* Rotating ring around globe */}
                <div className="absolute inset-0 w-16 h-16 border-2 border-[#93B45A]/30 border-t-[#93B45A] rounded-full animate-spin"></div>
                {/* Outer ring */}
                <div className="absolute -inset-2 w-20 h-20 border border-[#93B45A]/20 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Loading text */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Translating{dots}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We're translating all content to{' '}
                <span className="font-medium text-[#93B45A]">
                  {currentLanguage === 'en' ? 'English' : 
                   currentLanguage === 'es' ? 'Spanish' :
                   currentLanguage === 'fr' ? 'French' :
                   currentLanguage === 'de' ? 'German' :
                   currentLanguage === 'it' ? 'Italian' :
                   currentLanguage === 'pt' ? 'Portuguese' :
                   currentLanguage === 'ru' ? 'Russian' :
                   currentLanguage === 'zh' ? 'Chinese' :
                   currentLanguage === 'ja' ? 'Japanese' :
                   currentLanguage === 'ko' ? 'Korean' :
                   currentLanguage === 'ar' ? 'Arabic' :
                   currentLanguage === 'hi' ? 'Hindi' : 'your selected language'}
                </span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#93B45A] to-[#7A9B4A] rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Status text */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                This may take a few moments
              </p>
            </div>
          </div>

          {/* Floating elements for visual appeal */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#93B45A]/10 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#93B45A]/10 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -left-8 w-4 h-4 bg-[#93B45A]/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-8 w-4 h-4 bg-[#93B45A]/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BatchTranslationLoader;
