import React, { useState, useEffect, useContext } from 'react';
import { Select, Menu, Button, Text } from '@mantine/core';
import { BatchTranslationContext } from '../../contexts/BatchTranslationContext';
import { IconChevronDown, IconWorld } from '@tabler/icons-react';

// Languages configuration - labels will be translated based on current language
const LANGUAGES = [
  { value: 'en', labelEn: 'English', labelEs: 'Inglés', flag: '🇺🇸', code: 'US' },
  { value: 'es', labelEn: 'Spanish', labelEs: 'Español', flag: '🇪🇸', code: 'ES' }
];

const BatchLanguageSelector = ({ 
  variant = 'dropdown', 
  size = 'sm', 
  showFlag = true, 
  showLabel = true,
  placement = 'bottom',
  className = '',
  compact = false,
  darkMode = false,
  mobileCompact = false
}) => {
  // Safe context usage with debugging
  const context = useContext(BatchTranslationContext);
  
  // Fallback values if context is not available
  const currentLanguage = context?.currentLanguage || 'en';
  const changeLanguage = context?.changeLanguage || (() => {});
  const isLoading = context?.isLoading || false;
  const isProcessingBatch = context?.isProcessingBatch || false;
  
  const [localLanguage, setLocalLanguage] = useState(currentLanguage);

  // Update local language when current language changes
  useEffect(() => {
    setLocalLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (newLanguage) => {
    if (!newLanguage || newLanguage === localLanguage) return;
    
    // Immediately update local state for instant UI feedback
    setLocalLanguage(newLanguage);
    
    // Call changeLanguage - instant, no blocking
    if (changeLanguage && typeof changeLanguage === 'function') {
      changeLanguage(newLanguage);
    }
  };

  // Get current language object
  const getCurrentLanguage = () => {
    const lang = LANGUAGES.find(l => l.value === localLanguage);
    return lang || LANGUAGES[0];
  };
  
  // Get translated label for a language
  const getLanguageLabel = (lang) => {
    if (currentLanguage === 'es') {
      return lang.labelEs;
    }
    return lang.labelEn;
  };

  if (variant === 'dropdown') {
    const currentLang = getCurrentLanguage();
    
    return (
      <div className="language-selector-wrapper relative isolate">
        <Select
        value={localLanguage}
        onChange={handleLanguageChange}
        data={LANGUAGES.map(lang => ({
          value: lang.value,
          label: compact ? `${lang.flag} ${lang.code}` : `${lang.flag} ${getLanguageLabel(lang)}`
        }))}
        data-i18n-skip="true"
        size={size}
        className={className}
        disabled={false}
        rightSection={
          <IconChevronDown 
            size={16} 
            className="transition-transform duration-200"
          />
        }
        styles={{
          input: {
            cursor: 'pointer',
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            border: compact ? 'none' : '1px solid #e5e7eb',
            borderRadius: compact ? '6px' : '8px',
            padding: compact ? '6px 8px' : '8px 12px',
            fontSize: compact ? '13px' : '14px',
            fontWeight: 500,
            color: darkMode ? '#f9fafb' : '#1f2937',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: compact ? 'transparent' : '#93B45A',
              backgroundColor: darkMode ? '#111827' : '#f8fafc',
              boxShadow: compact ? 'none' : '0 0 0 1px #93B45A'
            },
            '&:focus': {
              borderColor: compact ? 'transparent' : '#93B45A',
              boxShadow: compact ? 'none' : '0 0 0 2px rgba(147, 180, 90, 0.15)'
            }
          },
          rightSection: {
            color: darkMode ? '#f9fafb' : '#475569'
          },
          dropdown: {
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          },
          item: {
            padding: compact ? '8px 12px' : '12px 16px',
            fontSize: compact ? '13px' : '14px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            color: darkMode ? '#ffffff !important' : '#1f2937 !important',
            '&[data-selected]': {
              backgroundColor: '#93B45A !important',
              color: '#ffffff !important',
              fontWeight: 600
            },
            '&[data-selected] *': {
              color: '#ffffff !important'
            },
            '&:hover': {
              backgroundColor: darkMode ? '#4a5568' : '#f8f9fa',
              transform: 'translateX(2px)'
            }
          }
        }}
        />
      </div>
    );
  }

  if (variant === 'menu') {
    const currentLang = getCurrentLanguage();
    const triggerBackground = darkMode ? '#1f2937' : '#ffffff';
    const triggerHoverBackground = darkMode ? '#111827' : '#f8fafc';
    const triggerTextColor = darkMode ? '#f9fafb' : '#1f2937';
    const triggerBorderColor = darkMode ? 'rgba(148, 163, 184, 0.35)' : '#e5e7eb';
    
    return (
      <Menu shadow="lg" width={mobileCompact ? 120 : 220} position={placement} offset={4}>
        <Menu.Target>
          <Button
            variant="subtle"
            size={mobileCompact ? 'sm' : size}
            className={`${className} transition-all duration-200 ${mobileCompact ? 'px-3 py-2 min-h-[36px] h-9' : ''}`}
            disabled={false}
            rightSection={
              <IconChevronDown 
                size={mobileCompact ? 14 : 16} 
                className="transition-transform duration-200"
              />
            }
            styles={{
              root: {
                backgroundColor: triggerBackground,
                border: `1px solid ${triggerBorderColor}`,
                color: triggerTextColor,
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                paddingLeft: mobileCompact ? '12px' : undefined,
                paddingRight: mobileCompact ? '12px' : undefined,
                '&:hover': {
                  backgroundColor: triggerHoverBackground
                }
              },
              label: {
                color: triggerTextColor
              }
            }}
          >
            <div className={`flex items-center ${mobileCompact ? 'gap-1.5' : 'gap-2'}`} data-i18n-skip="true">
                {showFlag && (
                  <span 
                    className={`${mobileCompact ? 'text-base' : 'text-lg'}`} 
                    data-i18n-skip="true"
                  >
                    {currentLang.flag}
                  </span>
                )}
                {showLabel && !mobileCompact && (
                  <div className="flex flex-col items-start" data-i18n-skip="true">
                    <Text size="sm" weight={500} data-i18n-skip="true" style={{ color: triggerTextColor }}>
                      {getLanguageLabel(currentLang)}
                    </Text>
                    <Text size="xs" data-i18n-skip="true" style={{ color: darkMode ? 'rgba(226, 232, 240, 0.75)' : '#64748b' }}>
                      {currentLang.code}
                    </Text>
                  </div>
                )}
                {showLabel && mobileCompact && (
                  <Text size="sm" weight={500} data-i18n-skip="true" style={{ color: triggerTextColor }}>
                    {getLanguageLabel(currentLang)}
                  </Text>
                )}
              </div>
          </Button>
        </Menu.Target>

        <Menu.Dropdown 
          className={`border border-gray-200 rounded-xl overflow-hidden ${mobileCompact ? 'py-0' : ''}`}
          style={{
            backgroundColor: '#ffffff',
            ...(mobileCompact ? {
              maxHeight: '200px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            } : {})
          }}
        >
          <style>
            {`
              /* Scrollbar styles for mobile compact */
              ${mobileCompact ? `
                .mantine-Menu-dropdown::-webkit-scrollbar {
                  width: 4px;
                }
                .mantine-Menu-dropdown::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 2px;
                }
                .mantine-Menu-dropdown::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 2px;
                }
                .mantine-Menu-dropdown::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              ` : ''}
              
              /* AGGRESSIVE CSS overrides for language selector */
              .language-selected {
                background-color: #93B45A !important;
                color: #ffffff !important;
              }
              
              .language-selected * {
                color: #ffffff !important;
              }
              
              .language-selected .mantine-Text-root {
                color: #ffffff !important;
              }
              
              /* Target Mantine Select dropdown items */
              .mantine-Select-item[data-selected="true"] {
                background-color: #93B45A !important;
                color: #ffffff !important;
              }
              
              .mantine-Select-item[data-selected="true"] * {
                color: #ffffff !important;
              }
              
              /* Target all possible Mantine text elements in selected items */
              [data-selected="true"] .mantine-Text-root,
              [data-selected="true"] span,
              [data-selected="true"] div {
                color: #ffffff !important;
              }
              
              /* Even more aggressive - target by background color */
              [style*="background-color: rgb(147, 180, 90)"] *,
              [style*="background: rgb(147, 180, 90)"] * {
                color: #ffffff !important;
              }
            `}
          </style>
          {LANGUAGES.map((language) => (
            <Menu.Item
              key={language.value}
              onClick={() => handleLanguageChange(language.value)}
              className={`flex items-center transition-all duration-200 ${
                mobileCompact ? 'gap-1 px-1.5 py-0.5' : 'gap-3 p-3'
              } ${
                localLanguage === language.value 
                  ? 'bg-[#93B45A] text-white language-selected' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span 
                className={`${mobileCompact ? 'text-xs' : 'text-lg'} ${mobileCompact ? 'min-w-[16px]' : ''}`} 
                style={{
                  color: localLanguage === language.value
                    ? '#ffffff'
                    : (darkMode ? '#f9fafb' : '#1f2937')
                }}
                data-i18n-skip="true"
              >
                {language.flag}
              </span>
              <div className="flex flex-col flex-1 min-w-0" data-i18n-skip="true">
                {localLanguage === language.value ? (
                  // Use regular div for selected state to avoid Mantine styling conflicts
                  <div 
                    className={`font-medium ${mobileCompact ? 'text-xs leading-tight truncate' : 'text-sm'}`}
                    style={{ color: '#ffffff' }}
                    data-i18n-skip="true"
                  >
                    {getLanguageLabel(language)}
                  </div>
                ) : (
                  <Text 
                    size={mobileCompact ? 'xs' : 'sm'} 
                    weight={500} 
                    className={`${mobileCompact ? 'leading-tight truncate' : ''}`}
                    style={{
                      color: darkMode ? '#f8fafc' : '#1f2937'
                    }}
                    data-i18n-skip="true"
                  >
                    {getLanguageLabel(language)}
                  </Text>
                )}
                {/* For mobileCompact we suppress the separate country code line to avoid duplicated appearance */}
                {!mobileCompact && (
                  localLanguage === language.value ? (
                    // Use regular div for selected state to avoid Mantine styling conflicts
                    <div 
                      className="text-xs"
                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                      data-i18n-skip="true"
                    >
                      {language.code}
                    </div>
                  ) : (
                    <Text 
                      size="xs" 
                      className={`${mobileCompact ? 'text-[8px] leading-none' : ''}`}
                      style={{
                        color: darkMode ? 'rgba(226, 232, 240, 0.75)' : '#64748b'
                      }}
                      data-i18n-skip="true"
                    >
                      {language.code}
                    </Text>
                  )
                )}
              </div>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  // Default button variant
  const currentLang = getCurrentLanguage();
  
  return (
    <Button
      variant="subtle"
      size={size}
      className={`${className} hover:bg-gray-50 transition-all duration-200`}
      disabled={false}
      onClick={() => {
        // Cycle through languages
        const currentIndex = LANGUAGES.findIndex(l => l.value === localLanguage);
        const nextIndex = (currentIndex + 1) % LANGUAGES.length;
        handleLanguageChange(LANGUAGES[nextIndex].value);
      }}
    >
      <div className="flex items-center gap-2" data-i18n-skip="true">
          {showFlag && <span className="text-lg" data-i18n-skip="true">{currentLang.flag}</span>}
          {showLabel && (
            <div className="flex flex-col items-start" data-i18n-skip="true">
              <Text size="sm" weight={500} color="dark" data-i18n-skip="true">
                {getLanguageLabel(currentLang)}
              </Text>
              <Text size="xs" color="dimmed" data-i18n-skip="true">
                {currentLang.code}
              </Text>
            </div>
          )}
        </div>
    </Button>
  );
};

export default BatchLanguageSelector;
