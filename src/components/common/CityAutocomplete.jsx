import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { searchCities, getCachedCitySuggestions } from '../../services/geocodingAPI';

/**
 * CityAutocomplete Component
 * A reusable autocomplete component for city selection with worldwide coverage
 */
const CityAutocomplete = ({
  value,
  onChange,
  onCitySelect,
  placeholder = "Enter city name",
  label,
  error,
  required = false,
  disabled = false,
  searchable = true,
  clearable = true,
  size = "sm",
  styles = {},
  countryCode = null,
  limit = 10,
  debounceDelay = 200, // Optimized debounce for better UX
  'aria-label': ariaLabel,
  ...otherProps
}) => {
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [isInstantSuggestions, setIsInstantSuggestions] = useState(false);
  const [debouncedValue] = useDebouncedValue(value, Math.min(debounceDelay, 200)); // Faster debounce, max 200ms

  // Search for cities based on input - optimized for speed
  const searchForCities = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCityOptions([]);
      setLastSearchQuery('');
      setIsInstantSuggestions(false);
      return;
    }

    // Don't search if we already searched for this query
    if (query === lastSearchQuery) {
      return;
    }

    setLastSearchQuery(query);
    setIsLoading(true);
    setIsInstantSuggestions(false);
    try {
      // Use enhanced search with context support
      const cities = await searchCities(query, limit, countryCode);
      
      // Format cities for Mantine Autocomplete - simplified for speed
      const formattedCities = cities.map(city => ({
        value: city.value,
        label: city.label, // Now shows only city name
        ...city // Include all city data for onCitySelect callback
      }));
      
      setCityOptions(formattedCities);
    } catch (error) {
      console.error('Error searching cities:', error);
      setCityOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit, countryCode, lastSearchQuery]);

  // Handle input changes
  const handleInputChange = (newValue) => {
    onChange?.(newValue);
    
    // If the value is cleared, clear the options
    if (!newValue) {
      setCityOptions([]);
      setLastSearchQuery('');
      setIsInstantSuggestions(false);
      return;
    }
    
    // Provide instant cached suggestions for immediate feedback
    if (newValue.length >= 2) {
      const instantSuggestions = getCachedCitySuggestions(newValue, limit);
      if (Array.isArray(instantSuggestions) && instantSuggestions.length > 0) {
        setCityOptions(instantSuggestions);
        setIsInstantSuggestions(true);
        // Don't update lastSearchQuery here to allow debounced search to run
        // This ensures instant suggestions stay visible while debounced search runs
      } else {
        // If no instant suggestions, clear options to show loading state
        setCityOptions([]);
        setIsInstantSuggestions(false);
      }
    } else {
      // Clear options for short queries
      setCityOptions([]);
      setIsInstantSuggestions(false);
    }
  };

  // Handle option selection
  const handleOptionSubmit = (selectedValue) => {
    const selectedCity = cityOptions.find(city => city.value === selectedValue);
    
    // Call the onChange handler
    onChange?.(selectedValue);
    
    // Call the onCitySelect handler with full city data if provided
    if (onCitySelect && selectedCity) {
      onCitySelect(selectedCity);
    }
    
    // Clear the search query to prevent re-searching
    setLastSearchQuery(selectedValue);
    setIsInstantSuggestions(false);
  };

  // Effect to search for cities when debounced value changes
  useEffect(() => {
    // Only search if debounced value is different from last search and has sufficient length
    // AND we don't already have instant suggestions showing
    if (debouncedValue && debouncedValue.length >= 2 && debouncedValue !== lastSearchQuery && !isInstantSuggestions) {
      searchForCities(debouncedValue);
    }
  }, [debouncedValue, searchForCities, lastSearchQuery, isInstantSuggestions]);

  // Default styles
  const defaultStyles = {
    input: {
      color: '#000000',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      paddingLeft: '16px',
      paddingRight: '16px',
      borderRadius: '0.5rem',
      borderColor: '#E0E0E0',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
      '&:focus': {
        borderColor: '#2F70EF',
        boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
      },
      '&::placeholder': {
        color: '#8E8E8E',
      },
    },
    rightSection: {
      color: '#8E8E8E',
    },
    dropdown: {
      borderRadius: '0.5rem',
      border: '1px solid #E0E0E0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backgroundColor: 'white',
      marginTop: '4px',
    },
    option: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      borderRadius: '4px',
      margin: '2px 4px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      color: '#495057',
      '&[data-selected]': {
        backgroundColor: '#2F70EF',
        color: 'white',
        fontWeight: 500,
      },
      '&:hover': {
        backgroundColor: '#f8f9fa',
        transform: 'translateY(-1px)',
      },
      '&[data-selected]:hover': {
        backgroundColor: '#1c5aa3',
      },
    },
    label: {
      fontSize: '14px',
      color: '#495057',
      fontWeight: 500,
      marginBottom: '6px',
    },
  };

  // Merge default styles with provided styles
  const mergedStyles = {
    ...defaultStyles,
    ...styles,
    input: { ...defaultStyles.input, ...styles.input },
    dropdown: { ...defaultStyles.dropdown, ...styles.dropdown },
    option: { ...defaultStyles.option, ...styles.option },
    label: { ...defaultStyles.label, ...styles.label },
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      value={value}
      data={Array.isArray(cityOptions) ? cityOptions : []}
      onChange={handleInputChange}
      onOptionSubmit={handleOptionSubmit}
      error={error}
      required={required}
      disabled={disabled}
      searchable={searchable}
      clearable={clearable}
      size={size}
      loading={isLoading}
      styles={mergedStyles}
      aria-label={ariaLabel || placeholder}
      rightSection={undefined} // Remove chevron icon for city autocomplete
      maxDropdownHeight={280}
      comboboxProps={{
        withinPortal: true,
        zIndex: 4000,
        transitionProps: { duration: 200, transition: 'fade' },
        shadow: 'md',
      }}
      // Disable client-side filtering (server-driven)
      filter={({ options }) => options}
      {...otherProps}
    />
  );
};

export default CityAutocomplete;