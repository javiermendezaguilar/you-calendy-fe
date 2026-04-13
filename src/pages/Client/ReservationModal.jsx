import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button, Textarea } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { UploadIcon } from '../../components/common/Svgs';
import { toast } from 'sonner';
import { DatePicker } from '@mantine/dates';
import { getClientByInvitationToken, clientLogin, clientAPI } from '../../services/clientAPI';
import { getBusinessById } from '../../services/businessPublicAPI';
import { createClientAppointment } from '../../services/appointmentAPI';
import { useGetAvailableSlots } from '../../hooks/useAppointments';
import { getInvitationToken, getCurrentBusinessId, getClientData, storeBusinessId } from '../../utils/invitationUtils';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { useGetActiveFlashSales, useGetActivePromotions } from '../../hooks/useMarketing';

// Day names will be translated using tc() function in the component
// daysOfWeekData removed as it's not used in the component

const normalizeTimeFormatPreference = (format) => {
  const normalized = String(format || '').trim().toLowerCase();
  if (normalized.startsWith('24') || normalized.includes('military')) {
    return '24h';
  }
  return '12h';
};

const formatTimeString = (time, normalizedPreference = '24h') => {
  if (!time) return '';
  const [hoursPart, minutesPart = '00'] = String(time).split(':');
  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(time);
  }

  const minuteStr = minutes.toString().padStart(2, '0');

  if (normalizedPreference === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minuteStr}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minuteStr} ${period}`;
};

const formatDateObject = (date, normalizedPreference = '24h') => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const minuteStr = minutes.toString().padStart(2, '0');

  if (normalizedPreference === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minuteStr}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minuteStr} ${period}`;
};

// timeSlots will be replaced by dynamic availableSlots from API

const PersonalizeView = ({ onSkip, onConfirm, isBooking }) => {
  const { tc } = useBatchTranslation();
  const [photos, setPhotos] = useState([]);
  const [instructions, setInstructions] = useState('');
  const fileInputRef = React.useRef(null);
  
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const newPhotos = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        url: URL.createObjectURL(file),
        file: file // Store the actual file object for backend upload
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };
  
  const handleSkip = () => {
    onSkip('', photos, instructions);
  };
  
  const handleConfirm = () => {
    onConfirm('', photos, instructions);
  };
  

  
  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-start mb-4 relative">
          <h2 className="text-xl md:text-2xl font-semibold text-start text-gray-800 flex-grow">
            {tc('personalizeYourHaircutExperience')}
          </h2>
        </div>
        
        <p className="text-[#939799] mb-6 text-xs">
          {tc('uploadReferencePhotos')}
        </p>
        
        <h1 className="text-sm font-normal text-gray-800 mb-2">{tc('uploadReferencePhotos')}</h1>
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 mb-6 bg-gray-50 h-[150px] md:h-[200px] w-full max-w-[400px] cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept=".jpg,.jpeg,.png" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 w-full h-full overflow-auto">
              {photos.map(photo => (
                <div key={photo.id} className="relative rounded overflow-hidden h-20">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                </div>
              ))}
              <div 
                className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg h-20 bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Plus size={20} className="text-gray-400" />
                <p className="text-center text-[#7F86A0] text-xs">{tc('addPhotos')}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <UploadIcon className="w-8 h-8 md:w-12 md:h-12 mb-2 opacity-50" />
              <p className="text-center text-[#7F86A0] text-xs">
                {tc('addPhotos')}
              </p>
              <p className="text-center text-[#7F86A09E] text-xs">
                .jpg, .png, .jpeg
              </p>
            </div>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
            {tc('addSpecificHaircutInstructions')}
          </label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="w-full md:w-[70%]"
            classNames={{
              input: "!w-full !px-3 !py-2 !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-gray-400"
            }}
            // Translation key corrected to match BatchTranslationContext.jsx
            placeholder={tc('enterDetailedInstructionsForYourHaircut')}
          />
        </div>
      </div>
      
      <div className="mt-auto pt-4 grid grid-cols-1 gap-3">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSkip();
          }}
          disabled={isBooking}
          type="button"
          className="!w-full !py-2 !rounded-lg !font-medium !bg-[#7B7E82] !text-white hover:!bg-[#707277] !transition-colors"
        >
          {tc('skip')}
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleConfirm();
          }}
          disabled={isBooking}
          type="button"
          className="!w-full !py-2 !rounded-lg !font-medium !bg-[#343a40] !text-white hover:!bg-black !transition-colors"
        >
          {isBooking ? tc('booking') : tc('bookAppointment')}
        </Button>
      </div>
    </div>
  );
};



const WelcomeBackView = ({ onContinue }) => {
  const { tc } = useBatchTranslation();
  return (
    <div className="flex flex-col p-5 md:p-8 items-center">
      <div className="flex flex-col items-center text-center mb-12 mt-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0D3B66] mb-8">
          {tc('welcomeBack')}
        </h2>
        
        <p className="text-gray-600 text-base md:text-lg px-4">
          {tc('welcomeBackMessage')}
        </p>
      </div>

      <div className="w-full max-w-md mx-auto mt-auto">
        <Button
          onClick={onContinue}
          className="!w-full !py-3 !rounded-md !font-medium !bg-[#323334] !text-white hover:!bg-black !transition-colors"
        >
          {tc('continue')}
        </Button>
      </div>
    </div>
  );
};

const ConfirmationView = ({ onConfirm, onCancel, service, day, time, total, duration, isBooking, discountInfo }) => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className="flex flex-col h-full p-6 md:p-8 items-center">
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[#7d9a4b] rounded-full flex items-center justify-center mb-6">
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-[#343a40] mb-4">
            {tc('confirmYourAppointment')}
          </h2>
          
          <p className="text-gray-600 text-base md:text-lg px-4 mb-6">
            {tc('readyToBookYourAppointment')}
          </p>
        </div>

        {service && (
          <div className="bg-[#F7F7F8] border border-[#E6E8EC] rounded-2xl shadow-sm p-6 mb-8 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#343a40] mb-2">{service.name || tc('service')}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{day} at {time}</p>
              <div className="border-t border-[#E6E8EC] pt-4">
                {discountInfo ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#343a40] font-medium text-sm">{tc('originalPrice')}:</span>
                      <span className="text-sm text-[#A0A0A0] line-through">${discountInfo.originalPrice.toFixed(2)}</span>
                    </div>
                    {discountInfo.type === 'both' ? (
                      <>
                        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-2">
                          <span className="text-green-700 font-medium text-sm">
                            {tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')}:
                          </span>
                          <span className="text-green-700 font-medium text-sm">-${discountInfo.discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-2">
                          <span className="text-green-700 font-medium text-sm">
                            {tc('flashSale')} {discountInfo.flashSaleDiscountPercentage}% {tc('off')}:
                          </span>
                          <span className="text-green-700 font-medium text-sm">-${discountInfo.flashSaleDiscountAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-2">
                        <span className="text-green-700 font-medium text-sm">
                          {discountInfo.type === 'flashSale' ? tc('flashSale') : tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')}:
                        </span>
                        <span className="text-green-700 font-medium text-sm">-${discountInfo.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-[#E6E8EC]">
                      <span className="text-[#343a40] font-medium">{tc('total')}:</span>
                      <span className="text-xl font-bold text-green-600">${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-green-600 italic mt-2">
                      {discountInfo.type === 'both' 
                        ? tc('bothDiscountsApplied') || 'Both discounts applied'
                        : discountInfo.type === 'flashSale' 
                        ? tc('flashSaleDiscountApplied') 
                        : tc('happyHourDiscountApplied')}
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[#343a40] font-medium">{tc('total')}:</span>
                    <span className="text-xl font-bold text-[#343a40]">${total.toFixed(2)}</span>
                  </div>
                )}
                <p className="text-xs text-[#A0A0A0] mt-1">{duration}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-auto pt-4 space-y-3">
        <button
          onClick={onConfirm}
          disabled={isBooking}
          className="w-full py-4 px-6 rounded-lg font-semibold text-lg bg-[#343a40] text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
        >
          {isBooking ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {tc('booking')}
            </>
          ) : (
            tc('bookAppointment')
          )}
        </button>
        
        <button
          onClick={onCancel}
          disabled={isBooking}
          className="w-full py-3 px-6 rounded-lg font-medium text-base bg-transparent text-[#666] hover:text-[#343a40] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
        >
          {tc('cancel')}
        </button>
      </div>
    </div>
  );
};

const SuccessMessageView = ({ businessName }) => {
  return (
    <div className="flex flex-col h-full p-6 md:p-8 items-center">
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#343a40] mb-6 text-center">Appointment confirmed</h2>
        <p className="text-gray-600 text-base md:text-lg px-4 text-center max-w-2xl">
          {`Thank you for choosing '${businessName || 'our barbershop'}.' You now have a profile with new functionalities. You can find it in the same window you used to book your appointment, just above, under the name 'My Profile.'`}
        </p>
      </div>
    </div>
  );
};

const ReservationModal = ({ show, onClose, service, selectedStaffInfo, timeFormatPreference }) => {
  const { tc } = useBatchTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("12:00");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  const [currentView, setCurrentView] = useState("booking");
  const [personalizationData, setPersonalizationData] = useState({
    pastHaircut: '',
    photos: [],
    instructions: ''
  });

  const [staffInfo, setStaffInfo] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [businessName, setBusinessName] = useState('');

  const normalizedTimeFormat = normalizeTimeFormatPreference(timeFormatPreference);
  const formatSlotForDisplay = useCallback(
    (timeValue) => formatTimeString(timeValue, normalizedTimeFormat),
    [normalizedTimeFormat]
  );
  const formatDateForDisplay = useCallback(
    (dateValue) => formatDateObject(dateValue, normalizedTimeFormat),
    [normalizedTimeFormat]
  );
  
  // Get business and staff IDs for availability checking
  // Try multiple sources: clientData.business, localStorage, URL params
  const getBusinessIdFromMultipleSources = () => {
    // First try from clientData if available
    if (clientData?.business?._id) {
      return clientData.business._id;
    }
    if (clientData?.business) {
      return typeof clientData.business === 'string' ? clientData.business : clientData.business._id;
    }
    // Then try from localStorage/URL
    return getCurrentBusinessId();
  };
  
  const businessId = getBusinessIdFromMultipleSources();
  const staffId = selectedStaffInfo?._id || staffInfo?._id || localStorage.getItem('clientStaffId');
  
  // Fetch available time slots using the API
  const { data: availableSlots = [], isLoading: slotsLoading, error: slotsError } = useGetAvailableSlots({
    businessId: businessId,
    serviceId: service?._id || service?.id,
    date: selectedDate,
    staffId: staffId
  });

  // Fetch active flash sales and promotions for discount calculation
  const { data: activeFlashSales = [] } = useGetActiveFlashSales(businessId);
  const { data: activePromotions = [] } = useGetActivePromotions(businessId, selectedDate);

  useEffect(() => {
    const nameFromClient = clientData?.business?.businessName || clientData?.business?.name;
    if (nameFromClient) {
      setBusinessName(nameFromClient);
      return;
    }
    if (businessId) {
      getBusinessById(businessId)
        .then((b) => {
          const n = b?.businessName || b?.name;
          if (n) setBusinessName(n);
        })
        .catch(() => {});
    }
  }, [clientData, businessId]);

  const formatServiceDuration = (duration) => {
    if (!duration) return '';
    if (typeof duration === 'object') {
        const parts = [];
        if (duration.hours > 0) parts.push(`${duration.hours}h`);
        if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
        return parts.join(' ');
    }
    if (typeof duration === 'number') return `${duration}m`;
    return duration;
  };

  const calculateTimeRange = (startTime, serviceDuration) => {
    if (!startTime || !serviceDuration || typeof serviceDuration !== 'object') {
      return '';
    }

    let [hours, minutes] = String(startTime)
      .split(':')
      .map((value) => Number.parseInt(value, 10));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return '';
    }

    if (hours >= 1 && hours <= 7) {
      hours += 12;
    }

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const durationHours = serviceDuration.hours || 0;
    const durationMinutes = serviceDuration.minutes || 0;

    const endDate = new Date(
      startDate.getTime() + (durationHours * 60 + durationMinutes) * 60 * 1000
    );

    return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
  };

  const getFormattedDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    let formattedDate = date.toLocaleDateString('en-US', options);
    // The format is "Month Day, Weekday". We need to reorder it to "Weekday, Day Month".
    // Example: "July 23, Tuesday" -> "Tuesday, 23 July"
    const parts = formattedDate.split(', ');
    if (parts.length === 2) {
      const monthDay = parts[0].split(' ');
      if (monthDay.length === 2) {
        return `${parts[1]}, ${monthDay[1]} ${monthDay[0]}`;
      }
    }
    // Fallback for unexpected formats
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!show) {
      setCurrentView("booking");
      setSelectedDate(new Date());
    } else {
      // Load client data from localStorage if available (includes business info)
      const storedClientData = getClientData();
      if (storedClientData) {
        setClientData(storedClientData);
        if (storedClientData.staff) {
          setStaffInfo(storedClientData.staff);
        }
      }
      
      // Load staff info from localStorage if not already loaded
      const storedStaffId = localStorage.getItem('clientStaffId');
      if (storedStaffId && !staffInfo) {
        // Staff ID is stored, but we'll try to get full info from clientData
      }
      
      // Check if client is already authenticated and load their profile
      const clientId = localStorage.getItem('clientId');
      const token = localStorage.getItem('token');
      if (clientId && token) {
        loadClientProfile(clientId);
      } else if (getInvitationToken()) {
        // If there's an invitation token but no authenticated client, check profile
        checkClientProfile();
      }
    }
  }, [show]);
  
  // Auto-select first available time slot when slots are loaded
  useEffect(() => {
    if (availableSlots && availableSlots.length > 0 && !selectedTimeSlot) {
      setSelectedTimeSlot(availableSlots[0]);
    }
  }, [availableSlots]);

  // Reset selected time slot when date changes
  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [selectedDate]);

  // Calculate discount based on flash sale or happy hour
  const originalPrice = service ? (typeof service.price === 'string' ? parseFloat(service.price.replace(/\$/g, '')) : parseFloat(service.price)) : 15.00;
  
  const discountInfo = useMemo(() => {
    // Early return if required data is missing
    if (!service || !selectedDate || !selectedTimeSlot || !businessId) {
      return null;
    }

    let appliedFlashSale = null;
    let appliedPromotion = null;

    // Check for happy hour (promotion) first
    if (activePromotions && Array.isArray(activePromotions) && activePromotions.length > 0) {
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      const appointmentTimeMinutes = hours * 60 + minutes;

      appliedPromotion = activePromotions.find((promo) => {
        if (!promo.isActive) {
          console.log('Promotion not active:', promo.name);
          return false;
        }
        if (promo.dayOfWeek?.toLowerCase() !== dayOfWeek) {
          console.log('Day mismatch:', promo.dayOfWeek, 'vs', dayOfWeek);
          return false;
        }
        
        // Check if selected service is in promotion's services
        const serviceId = service._id || service.id;
        const serviceIds = promo.services?.map(s => {
          if (typeof s === 'string') return s;
          if (typeof s === 'object' && s._id) return s._id;
          return null;
        }).filter(Boolean) || [];
        if (!serviceIds.includes(serviceId)) {
          console.log('Service not in promotion:', serviceId, 'not in', serviceIds);
          return false;
        }
        
        // Check if appointment time is within promotion time range
        const [startHour, startMin] = promo.startTime.split(':').map(Number);
        const [endHour, endMin] = promo.endTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMin;
        const endTimeMinutes = endHour * 60 + endMin;
        
        const isInTimeRange = appointmentTimeMinutes >= startTimeMinutes && appointmentTimeMinutes <= endTimeMinutes;
        if (!isInTimeRange) {
          console.log('Time not in range:', appointmentTimeMinutes, 'not between', startTimeMinutes, 'and', endTimeMinutes);
        }
        
        return isInTimeRange;
      });
      
      if (appliedPromotion) {
        console.log('✅ Promotion found:', appliedPromotion.name, 'applyBothDiscounts:', appliedPromotion.applyBothDiscounts);
      } else {
        console.log('❌ No promotion found. Active promotions:', activePromotions.length);
      }
    }

    // Check for flash sale
    if (activeFlashSales && Array.isArray(activeFlashSales) && activeFlashSales.length > 0) {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      appliedFlashSale = activeFlashSales.find((sale) => {
        if (!sale.isActive) return false;
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        return appointmentDateTime >= startDate && appointmentDateTime <= endDate;
      });
    }

    // Calculate discount based on applyBothDiscounts flag
    // Priority: Promotion first, then flash sale
    if (appliedPromotion) {
      const discountPercentage = appliedPromotion.discountPercentage || 0;
      const discountAmount = (originalPrice * discountPercentage) / 100;
      let finalPrice = originalPrice - discountAmount;

      // If applyBothDiscounts is true and flash sale exists, apply both
      if (appliedPromotion.applyBothDiscounts === true && appliedFlashSale) {
        const flashSaleDiscountPercentage = appliedFlashSale.discountPercentage || 0;
        const flashSaleDiscountAmount = (finalPrice * flashSaleDiscountPercentage) / 100;
        finalPrice = finalPrice - flashSaleDiscountAmount;
        return {
          type: 'both',
          name: `${appliedPromotion.name} + ${appliedFlashSale.name}`,
          originalPrice,
          discountPercentage: appliedPromotion.discountPercentage,
          discountAmount,
          flashSaleDiscountPercentage,
          flashSaleDiscountAmount,
          finalPrice,
        };
      } else if (appliedPromotion.applyBothDiscounts === false) {
        // applyBothDiscounts is false, skip flash sale - only show promotion
        console.log('✅ Returning happy hour only (applyBothDiscounts: false)');
        return {
          type: 'happyHour',
          name: appliedPromotion.name,
          originalPrice,
          discountPercentage,
          discountAmount,
          finalPrice,
        };
      } else {
        // No applyBothDiscounts flag or undefined - default to promotion only
        console.log('✅ Returning happy hour only (applyBothDiscounts undefined)');
        return {
          type: 'happyHour',
          name: appliedPromotion.name,
          originalPrice,
          discountPercentage,
          discountAmount,
          finalPrice,
        };
      }
    } else if (appliedFlashSale) {
      // No promotion, apply flash sale
      console.log('⚠️ No promotion found, applying flash sale only');
      const discountPercentage = appliedFlashSale.discountPercentage || 0;
      const discountAmount = (originalPrice * discountPercentage) / 100;
      const finalPrice = originalPrice - discountAmount;
      return {
        type: 'flashSale',
        name: appliedFlashSale.name,
        originalPrice,
        discountPercentage,
        discountAmount,
        finalPrice,
      };
    }

    console.log('❌ No discount applied - no promotion or flash sale found');
    return null;
  }, [service, selectedDate, selectedTimeSlot, activeFlashSales, activePromotions, businessId, originalPrice]);

  const total = discountInfo ? discountInfo.finalPrice : originalPrice;
  const duration = service?.duration 
    ? (typeof service.duration === 'object' && service.duration.hours !== undefined && service.duration.minutes !== undefined
        ? `${service.duration.hours}h ${service.duration.minutes}m`
        : service.duration)
    : "30 min";

  if (!show) return null;



  const loadClientProfile = async (clientId) => {
    try {
      setIsLoadingProfile(true);
      const response = await clientAPI.getPublicProfile(clientId);
      const client = response.data?.data || response.data;
      
      if (client) {
        // Extract and store staff information if available
        if (client.staff) {
          setStaffInfo(client.staff);
          localStorage.setItem('clientStaffId', client.staff._id);
        }
      }
    } catch {
      console.error(tc('errorLoadingClientProfile'));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkClientProfile = async () => {
    const invitationToken = getInvitationToken();
    
    if (!invitationToken) {
      return false;
    }
    
    try {
      setIsLoadingProfile(true);
      const fetchedClientData = await getClientByInvitationToken(invitationToken);
      
      // Check multiple possible structures
      let client = null;
      let business = null;
      
      if (fetchedClientData.client) {
        client = fetchedClientData.client;
        business = fetchedClientData.business || client.business;
        
        // Extract and store staff information
        if (client.staff) {
          setStaffInfo(client.staff);
          // Store staff ID in localStorage for future use
          localStorage.setItem('clientStaffId', client.staff._id);
        }
      } else if (fetchedClientData.data && fetchedClientData.data.client) {
        client = fetchedClientData.data.client;
        business = fetchedClientData.data.business || client.business;
        // Extract staff info from alternative structure
        if (client.staff) {
          setStaffInfo(client.staff);
          localStorage.setItem('clientStaffId', client.staff._id);
        }
      } else if (fetchedClientData.data) {
        client = fetchedClientData.data;
        business = client.business;
        // Extract staff info from alternative structure
        if (client.staff) {
          setStaffInfo(client.staff);
          localStorage.setItem('clientStaffId', client.staff._id);
        }
      } else if (fetchedClientData._id) {
        // Client data is directly in the response
        client = fetchedClientData;
        business = client.business;
        // Extract staff info from alternative structure
        if (client.staff) {
          setStaffInfo(client.staff);
          localStorage.setItem('clientStaffId', client.staff._id);
        }
      }
      
      // Store client data with business info
      if (client) {
        const fullClientData = { ...client, business };
        setClientData(fullClientData);
        
        // Store business ID if available for later use
        if (business) {
          const businessIdValue = business._id || business;
          if (businessIdValue) {
            storeBusinessId(businessIdValue);
          }
        }
      }
      
      if (client) {
        const profileComplete = client.isProfileComplete || false;
        
        // If profile is complete, authenticate the client
        if (profileComplete && client._id) {
          try {
            await clientLogin(client._id);
          } catch {
            console.error(tc('errorAuthenticatingClient'));
            // Continue without authentication, user can still browse
          }
        }
        return profileComplete;
      }
      
      return false;
    } catch (error) {
      console.error(tc('errorCheckingClientProfile'), error);
      return false;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleContinue = async () => {
    // Go directly to personalize view
    setCurrentView("personalize");
  };

  const handleBackToBooking = () => {
    setCurrentView("booking");
  };

  const handlePersonalizeContinue = async (selectedPastHaircut, photos, instructions) => {
    try {
      setIsBooking(true);
      
      // Validate required data
      if (!service) {
        toast.error(tc('serviceInformationMissing'));
        return;
      }
      
      if (!selectedDate) {
        toast.error(tc('dateMissing'));
        return;
      }
      
      if (!selectedTimeSlot) {
        toast.error(tc('timeSlotMissing'));
        return;
      }
      
      const businessId = getCurrentBusinessId();
      if (!businessId) {
        toast.error(tc('businessInformationMissing'));
        return;
      }
      
      // Get client ID from localStorage (set during profile completion)
      const clientId = localStorage.getItem('clientId');
      if (!clientId) {
        toast.error(tc('clientAuthenticationRequired'));
        return;
      }
      
      // Get staff ID
      const staffId = staffInfo?._id || localStorage.getItem('clientStaffId');
      if (!staffId) {
        toast.error(tc('staffInformationMissing'));
        return;
      }
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('businessId', businessId);
      formData.append('clientId', clientId); // Ensure clientId is included
      formData.append('serviceId', service._id || service.id);
      formData.append('staffId', staffId);
      // Format date in local timezone to avoid UTC conversion issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      formData.append('date', localDateString);
      formData.append('startTime', selectedTimeSlot);
      formData.append('notes', instructions || '');
      formData.append('clientNotes', selectedPastHaircut || '');
      
      // Append reference photos
      photos.forEach((photo) => {
        if (photo.file) {
          formData.append('referencePhotos', photo.file);
        }
      });
      

      
      // Create appointment with file uploads
      const response = await createClientAppointment(formData);
      
      if (response.success) {
        setCurrentView("success");
      } else {
        console.error(tc('bookingFailed'), response.error);
        toast.error(response.error || tc('failedToBookAppointment'));
      }
    } catch (error) {
      console.error(tc('errorBookingAppointment'), error);
      toast.error(tc('errorOccurredBookingAppointment'));
    } finally {
      setIsBooking(false);
    }
  };

  const handlePersonalizeSkip = () => {
    // Clear personalization data when skipping
    setPersonalizationData({
      pastHaircut: '',
      photos: [],
      instructions: ''
    });
    setCurrentView("confirmation");
  };

  const handlePersonalizeComplete = (pastHaircut, photos, instructions) => {
    // Store personalization data and show confirmation
    setPersonalizationData({
      pastHaircut,
      photos,
      instructions
    });
    setCurrentView("confirmation");
  };

  const handleWelcomeBackContinue = () => {
    onClose();
  };

  const handleConfirmationBook = async () => {
    // Book appointment with stored personalization data
    await handlePersonalizeContinue(
      personalizationData.pastHaircut,
      personalizationData.photos,
      personalizationData.instructions
    );
  };

  const handleConfirmationCancel = () => {
    // Reset everything and close modal
    setCurrentView("booking");
    setPersonalizationData({
      pastHaircut: '',
      photos: [],
      instructions: ''
    });
    onClose();
  };

  // Manual time input allows any time selection

  // No availability check needed with manual time input

  const renderView = () => {
    switch (currentView) {
      case "personalize":
        return (
          <PersonalizeView
            onBack={handleBackToBooking}
            onSkip={handlePersonalizeSkip}
            onConfirm={handlePersonalizeComplete}
            service={service}
            day={getFormattedDate(selectedDate)}
            time={formatSlotForDisplay(selectedTimeSlot)}
            total={total}
            duration={duration}
            selectedDate={selectedDate}
            isBooking={false}
          />
        );
      case "success":
        return (
          <SuccessMessageView businessName={businessName} />
        );
      case "welcomeBack":
        return (
          <WelcomeBackView
            onContinue={handleWelcomeBackContinue}
          />
        );
      case "confirmation":
        return (
          <ConfirmationView
            onConfirm={handleConfirmationBook}
            onCancel={handleConfirmationCancel}
            service={service}
            day={getFormattedDate(selectedDate)}
            time={formatSlotForDisplay(selectedTimeSlot)}
            total={total}
            duration={duration}
            isBooking={isBooking}
            discountInfo={discountInfo}
          />
        );
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-4">
              <div className="flex flex-col items-start mb-4 pt-1">
                <button className="flex items-start gap-2 px-4 py-2 rounded-lg bg-black text-white font-medium mb-4 text-base shadow-md">
                  <CalendarIcon size={18} />
                  <span className="text-sm">{tc('selectDate')}</span>
                </button>
                {/* Calendar container: optimal size with proper fit */}
                <div className="flex justify-center w-full md:w-auto md:inline-block md:align-top md:max-w-[360px]">
                <div
                    className="rounded-2xl border border-[#E6E8EC] bg-white p-3 md:p-4 w-fit"
                  style={{ boxShadow: '0 2px 12px 0 #E6E8EC80' }}
                >
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    size="md"
                    weekdayFormat="ddd"
                    classNames={{
                      calendar: '!rounded-xl',
                      day: '!rounded-full',
                    }}
                    styles={{
                      calendarHeader: { background: '#fff', borderRadius: '12px', fontSize: '15px' },
                      day: { fontWeight: 500, fontSize: '14px', width: '32px', height: '32px' },
                      daySelected: {
                        backgroundColor: '#7d9a4b',
                        color: '#fff',
                        borderRadius: '9999px',
                        outline: 'none',
                      },
                      weekday: { fontSize: '13px' },
                    }}
                    renderDay={(date) => {
                      const isSelected =
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear();
                      return (
                        <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isSelected ? 'bg-[#7d9a4b] text-white' : ''}`}
                        >
                          {date.getDate()}
                        </div>
                      );
                    }}
                  />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-start mb-6">
                <button
                  className="px-6 py-2 rounded-lg cursor-pointer font-medium text-sm bg-black text-white shadow"
                >
                  {getFormattedDate(selectedDate)}
                </button>
              </div>
              
                  <div className="mb-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      {tc('selectTime')}
                    </label>
                    
                    {slotsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-[#7d9a4b] border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">{tc('loadingAvailableSlots')}</span>
                      </div>
                    ) : slotsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500 text-sm">{tc('errorLoadingSlots')}</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">{tc('noAvailableSlots')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedTimeSlot === slot
                                ? 'bg-[#7d9a4b] text-white shadow-md'
                                : 'bg-white border-2 border-[#E6E8EC] text-gray-700 hover:border-[#7d9a4b] hover:bg-[#7d9a4b]/5'
                            }`}
                          >
                            {formatSlotForDisplay(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
                  
                  {service && (
                    <div className="bg-[#F7F7F8] border border-[#E6E8EC] rounded-2xl shadow-sm p-6 mb-6 flex flex-col gap-2 w-full max-w-2xl mx-auto">
                      <div className="flex justify-between items-start mb-1">
                          <div className="min-w-0 pr-3">
                          <h3 className="text-lg font-semibold text-[#343a40] mb-1">{service.name || tc('serviceName')}</h3>
                          <p className="text-xs text-[#A0A0A0]">{service.description || tc('serviceDescription')}</p>
                          </div>
                          <div className="text-right shrink-0">
                          <span className="block font-semibold text-lg text-[#343a40]">${originalPrice.toFixed(2)}</span>
                          <span className="text-xs text-[#A0A0A0]">{calculateTimeRange(selectedTimeSlot, service.duration)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-[#E6E8EC] pt-2">
                        <span className="text-[#343a40]">
                          {(() => { const label = tc('employee').trim(); return label.endsWith(':') ? label : label + ':'; })()} <span className="font-semibold">
                            {selectedStaffInfo ? `${selectedStaffInfo.firstName || ''} ${selectedStaffInfo.lastName || ''}`.trim() : tc('any')}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center max-w-2xl mx-auto mb-4">
                    <div></div>
                    <div className="text-right">
                      {discountInfo ? (
                        <div className="space-y-1">
                          <div className="text-[#343a40] text-lg font-bold">
                            {tc('total')}: <span className="line-through text-[#A0A0A0] text-sm font-normal">${discountInfo.originalPrice.toFixed(2)}</span>
                            <span className="ml-2 text-green-600 font-bold text-lg">${total.toFixed(2)}</span>
                            <span className="text-xs font-normal text-[#A0A0A0] ml-1">{tc('usd')}</span>
                          </div>
                          {discountInfo.type === 'both' ? (
                            <>
                              <div className="text-xs text-green-600">
                                {tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')} + {tc('flashSale')} {discountInfo.flashSaleDiscountPercentage}% {tc('off')}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-green-600">
                              {discountInfo.type === 'flashSale' ? tc('flashSale') : tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')}
                            </div>
                          )}
                          <span className="block text-xs text-[#A0A0A0]">{formatServiceDuration(service.duration)}</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-[#343a40] text-lg font-bold">{tc('total')}: <span className="text-[#1B1D21]">${total.toFixed(2)} <span className="text-xs font-normal text-[#A0A0A0]">{tc('usd')}</span></span></div>
                          <span className="block text-xs text-[#A0A0A0]">{formatServiceDuration(service.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
            </div>
            
            <div className="pt-3 pb-3 px-2 sm:px-3 md:px-4 mt-auto border-t border-gray-100 bg-white">
              <button
                onClick={handleContinue}
                disabled={isLoadingProfile}
                className="w-full max-w-2xl mx-auto block bg-[#343a40] text-white py-3 rounded-lg font-semibold text-base hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoadingProfile && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isLoadingProfile ? tc('checkingProfile') : tc('continue')}
              </button>
            </div>
          </div>
        );
    }
  };

  const modalContent = (
    <div className="relative z-10 max-w-full h-full flex flex-col p-2 sm:p-3 md:p-4">
      {renderView()}
    </div>
  );

  return (
    <CommonModal
      opened={show}
      onClose={onClose}
      content={modalContent}
      size="xl"
      styles={{
        root: {
          width: "95%",
          maxWidth: "95%",
        },
        content: {
          maxWidth: "750px",
        },
        body: {
          minHeight: "300px",
          maxHeight: isMobile ? "80vh" : "90vh",
          overflowY: "auto",
          padding: "0",
          display: "flex",
          flexDirection: "column",
        }
      }}
    />
  );
};

export default ReservationModal;
