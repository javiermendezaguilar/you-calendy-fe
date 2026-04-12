import React, { lazy, Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import barber from "../../assets/barber.webp"
import customer from "../../assets/customer.webp"
import { FooterInstagramIcon, FooterFacebookIcon, FooterTwitterIcon, ShareIcon } from '../../components/common/Svgs';
import Checky from "../../assets/checky.png"
import { SendIcon } from '../../components/common/Svgs';
import { Button, TextInput, ActionIcon, Skeleton } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import background from "../../assets/background.webp"
import { motion, AnimatePresence } from 'framer-motion';
import { getBusinessById, getBusinessServices, getBusinessHours, getBusinessStaff, getBusinessGallery, getClientByInvitationToken, getStaffWorkingHoursClientSide } from '../../services/businessPublicAPI';
import { getCurrentBusinessId, getInvitationToken, processInvitationFromUrl, storeStaffId, storeClientData, getCurrentStaffId, getClientData } from '../../utils/invitationUtils';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const ReservationModal = lazy(() => import('./ReservationModal'));
const BusinessMap = lazy(() => import('../../components/client/BusinessMap'));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const leftSlideVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const rightSlideVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const dropdownVariants = {
  hidden: { opacity: 0, height: 0, y: -10 },
  visible: { 
    opacity: 1, 
    height: 'auto', 
    y: 0, 
    transition: { duration: 0.4, ease: "easeInOut" } 
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    y: -10, 
    transition: { duration: 0.3, ease: "easeInOut" } 
  }
};

const normalizeTimeFormatPreference = (format) => {
  const normalized = String(format || '').trim().toLowerCase();
  if (normalized.startsWith('24') || normalized.includes('military')) {
    return '24h';
  }
  return '12h';
};

const toServiceIdentifier = (serviceLike) => {
  if (!serviceLike) return undefined;
  if (typeof serviceLike === 'string') return serviceLike;
  if (typeof serviceLike === 'object') {
    return (
      serviceLike._id ||
      serviceLike.id ||
      serviceLike.serviceId ||
      (typeof serviceLike.service === 'string' ? serviceLike.service : toServiceIdentifier(serviceLike.service))
    );
  }
  return undefined;
};

const parseMinutes = (value) => {
  if (value === undefined || value === null) return undefined;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.round(numeric);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const buildServiceDurationLookup = (staffMembers = []) => {
  const lookup = new Map();
  staffMembers.forEach((staffMember) => {
    const services = staffMember?.services;
    if (!Array.isArray(services)) return;
    services.forEach((entry) => {
      const serviceId = toServiceIdentifier(entry?.service ?? entry);
      if (!serviceId) return;
      const minutes = parseMinutes(entry?.timeInterval ?? entry?.duration ?? entry?.minutes);
      if (minutes) {
        lookup.set(String(serviceId), minutes);
      }
    });
  });
  return lookup;
};

const formatMinutesLabel = (minutes) => {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) {
    return undefined;
  }
  const wholeMinutes = Math.round(minutes);
  const hours = Math.floor(wholeMinutes / 60);
  const remaining = wholeMinutes % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (remaining > 0) parts.push(`${remaining} min`);
  if (parts.length === 0) parts.push('1 min');
  return parts.join(' ').trim();
};

const convertDurationObjectToMinutes = (duration) => {
  if (!duration || typeof duration !== 'object') return undefined;
  const hours = parseMinutes(duration.hours);
  const minutes = parseMinutes(duration.minutes);
  const total = (hours ? hours * 60 : 0) + (minutes || 0);
  return total > 0 ? total : undefined;
};

export const Home = () => {
  const { tc } = useBatchTranslation();
  
  const footerLinks = {
    company: [tc('aboutUs'), tc('howItWorks'), tc('careers'), tc('contact')],
    explore: [tc('services'), tc('pricing'), tc('testimonials')],
    support: [tc('helpCenter'), tc('faqs'), tc('privacyPolicy')],
    resources: [tc('blog'), tc('community'), tc('newsUpdates')],
  };
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showFullWeek, setShowFullWeek] = useState(false);
  
  // API Data State
  const [businessData, setBusinessData] = useState(null);
  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState(null);
  const [businessStaff, setBusinessStaff] = useState([]);
  const [workplacePhotos, setWorkplacePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Client and Staff Data State
  const [clientData, setClientData] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const preferredTimeFormat = normalizeTimeFormatPreference(businessData?.timeFormatPreference);
  const serviceDurationLookup = useMemo(() => {
    if (assignedStaff) {
      return buildServiceDurationLookup([assignedStaff]);
    }
    return buildServiceDurationLookup(businessStaff);
  }, [assignedStaff, businessStaff]);

  const isServiceAssignedToAnyStaff = useCallback((service) => {
    const serviceId = toServiceIdentifier(service);
    if (!serviceId) return false;
    
    // If there's a specific assigned staff member, check if the service is assigned to that staff member
    if (assignedStaff && assignedStaff.services && Array.isArray(assignedStaff.services)) {
      const assignedStaffServices = assignedStaff.services;
      const isAssignedToStaff = assignedStaffServices.some((entry) => {
        const entryServiceId = toServiceIdentifier(entry?.service ?? entry);
        return String(entryServiceId) === String(serviceId);
      });
      if (isAssignedToStaff) return true;
    }
    
    // Otherwise, check if the service is assigned to any staff member
    return businessStaff.some((staff) => {
      const list = Array.isArray(staff?.services) ? staff.services : [];
      return list.some((entry) => String(toServiceIdentifier(entry?.service ?? entry)) === String(serviceId));
    });
  }, [assignedStaff, businessStaff]);

  const notAssignedLabel = useMemo(() => {
    const m = tc('serviceNotAssignedToAnyStaff');
    return m && m !== 'serviceNotAssignedToAnyStaff' ? m : 'This service is not assigned to any staff member till now';
  }, [tc]);

  const getServiceDurationLabel = useCallback((service) => {
    const serviceId = toServiceIdentifier(service);
    if (serviceId) {
      const staffMinutes = serviceDurationLookup.get(String(serviceId));
      const staffLabel = staffMinutes ? formatMinutesLabel(staffMinutes) : undefined;
      if (staffLabel) {
        return staffLabel;
      }
    }

    const minutesFromTimeInterval = parseMinutes(service?.timeInterval);
    const minutesFromNumericDuration = typeof service?.duration === 'number' ? parseMinutes(service.duration) : undefined;
    const minutesFromStringDuration = typeof service?.duration === 'string' ? parseMinutes(service.duration) : undefined;
    const minutesFromObjectDuration = convertDurationObjectToMinutes(service?.duration);
    const fallbackMinutes = minutesFromTimeInterval ?? minutesFromNumericDuration ?? minutesFromStringDuration ?? minutesFromObjectDuration;
    const fallbackLabel = fallbackMinutes ? formatMinutesLabel(fallbackMinutes) : undefined;

    return fallbackLabel || null;
  }, [serviceDurationLookup]);
  

  // Helper function to get coordinates from business data
  const getBusinessCoordinates = () => {
    if (!businessData) {
      return [37.7749, -122.4194]; // Default to San Francisco
    }
    
    // Check if location coordinates exist in business data
    if (businessData.location && businessData.location.coordinates) {
      const coords = businessData.location.coordinates;
      // MongoDB stores coordinates as [longitude, latitude], but Leaflet expects [latitude, longitude]
      if (Array.isArray(coords) && coords.length === 2) {
        const swapped = [coords[1], coords[0]]; // Swap to [lat, lng]
        return swapped;
      }
    }
    
    // Check if coordinates exist directly in businessData
    if (businessData.coordinates && Array.isArray(businessData.coordinates) && businessData.coordinates.length === 2) {
      return businessData.coordinates;
    }
    
    // Check if latitude and longitude exist as separate properties
    if (businessData.latitude && businessData.longitude) {
      const coords = [businessData.latitude, businessData.longitude];
      return coords;
    }
    
    // Check if address has coordinates
    if (businessData.address && typeof businessData.address === 'object') {
      if (businessData.address.coordinates && Array.isArray(businessData.address.coordinates) && businessData.address.coordinates.length === 2) {
        const swapped = [businessData.address.coordinates[1], businessData.address.coordinates[0]]; // Swap to [lat, lng]
        return swapped;
      }
      if (businessData.address.latitude && businessData.address.longitude) {
        const coords = [businessData.address.latitude, businessData.address.longitude];
        return coords;
      }
    }
    
    // Default fallback coordinates (San Francisco)
    return [37.7749, -122.4194];
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (preferredTimeFormat === '24h') {
      return time;
    }

    const [hours, minutes = '00'] = time.split(':');
    const hourInt = parseInt(hours, 10);

    if (Number.isNaN(hourInt)) {
      return time;
    }

    const period = hourInt >= 12 ? 'PM' : 'AM';
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')} ${period}`;
  };

  // Helper function to get today's business hours
  const getTodaysHours = () => {
    if (!businessHours) {
      return { isOpen: false, hours: [] };
    }
    
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    
    const todayHours = businessHours[todayName];
    
    if (!todayHours || !todayHours.enabled) {
      return { isOpen: false, hours: [] };
    }
    
    // Convert shifts to hours format
    const hours = todayHours.shifts?.map(shift => ({
      open: shift.start,
      close: shift.end
    })) || [];
    
    return {
      isOpen: true,
      hours: hours
    };
  };

  // Helper function to get full week hours
  const getFullWeekHours = () => {
    if (!businessHours) return [];
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayLabels = [tc('sunday'), tc('monday'), tc('tuesday'), tc('wednesday'), tc('thursday'), tc('friday'), tc('saturday')];
    
    return dayNames.map((dayName, index) => {
      const dayHours = businessHours[dayName];
      
      if (!dayHours || !dayHours.enabled) {
        return {
          day: dayLabels[index],
          isOpen: false,
          hours: []
        };
      }
      
      // Convert shifts to hours format
      const hours = dayHours.shifts?.map(shift => ({
        open: shift.start,
        close: shift.end
      })) || [];
      
      return {
        day: dayLabels[index],
        isOpen: true,
        hours: hours
      };
    });
  };

  // Helper function to check if today
  const isToday = (dayName) => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    return dayName.toLowerCase() === todayName;
  };

  // Fetch business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        
        // Process invitation from URL first
        processInvitationFromUrl();
        
        // Get business ID from invitation link or URL
        const businessId = getCurrentBusinessId();
        
        if (!businessId) {
          throw new Error('No business ID found. Please use a valid invitation link.');
        }

        // Check if there's an invitation token to get client and staff data
        const invitationToken = getInvitationToken();
        let clientInfo = null;
        let staffInfo = null;
        
        if (invitationToken) {
          try {
            // Fetch client data which includes staff assignment
            clientInfo = await getClientByInvitationToken(invitationToken);
            setClientData(clientInfo);
            storeClientData(clientInfo);
            
            // Extract staff information if available
            if (clientInfo && clientInfo.staff) {
              staffInfo = clientInfo.staff;
              setAssignedStaff(staffInfo);
              storeStaffId(staffInfo._id || staffInfo);
            }
          } catch (clientErr) {
            console.warn('Could not fetch client data:', clientErr.message);
            // Continue with normal flow if client data fetch fails
          }
        } else {
          // Try to get client data from localStorage if no token in URL
          const storedClientData = getClientData();
          if (storedClientData) {
            setClientData(storedClientData);
            if (storedClientData.staff) {
              setAssignedStaff(storedClientData.staff);
              staffInfo = storedClientData.staff;
            }
          }
        }

        // Fetch business data and services in parallel
        const [businessInfo, businessServices, staff] = await Promise.all([
          getBusinessById(businessId),
          getBusinessServices(businessId),
          getBusinessStaff(businessId)
        ]);

        setBusinessData(businessInfo);
        setAllServices(businessServices || []);
        setBusinessStaff(staff || []);

        const storedStaffId = getCurrentStaffId();
        const staffId =
          staffInfo?._id ||
          (typeof staffInfo === 'string' ? staffInfo : null) ||
          storedStaffId ||
          (Array.isArray(staff) && staff.length > 0 ? staff[0]._id : null);

        let workingHours = null;

        if (staffId) {
          try {
            workingHours = await getStaffWorkingHoursClientSide(staffId);
          } catch (hoursError) {
            console.error('Failed to fetch staff working hours:', hoursError);
          }
        }

        if (!workingHours) {
          // Fallback to business-level hours when staff-specific hours are unavailable
          const fallbackHours = businessInfo?.businessHours || businessInfo?.hours || null;
          workingHours = fallbackHours || (await getBusinessHours(businessId));
        }

        setBusinessHours(workingHours);
        
        // Get workplace photos from business profileImages
        const workplacePhotosUrls = businessInfo?.profileImages?.workspacePhotos || [];
        const transformedWorkplacePhotos = workplacePhotosUrls.map((url, index) => ({
          id: index + 1,
          src: url,
          alt: `Workplace photo ${index + 1}`
        }));
        setWorkplacePhotos(transformedWorkplacePhotos);
        
        // Filter services based on assigned staff
        if (staffInfo && staffInfo.services && Array.isArray(staffInfo.services)) {
          // Extract service IDs from staff services array (which contains objects with {service: id, timeInterval: number})
          const staffServiceIds = staffInfo.services.map(serviceEntry => {
            // Handle both object format {service: id} and direct ID format
            if (typeof serviceEntry === 'object' && serviceEntry !== null) {
              return toServiceIdentifier(serviceEntry.service || serviceEntry);
            }
            return toServiceIdentifier(serviceEntry);
          }).filter(Boolean);
          
          // Filter services to only show those assigned to the staff member
          const staffServices = (businessServices || []).filter(service => {
            const serviceId = toServiceIdentifier(service);
            if (!serviceId) return false;
            return staffServiceIds.some(staffServiceId => String(staffServiceId) === String(serviceId));
          });
          
          setServices(staffServices);
        } else {
          // If no staff assignment or no staff services, show all services
          setServices(businessServices || []);
        }
        
      } catch (err) {
  console.error('Error fetching business data:', err);
  setError(err.message);
  toast.error(tc('failedToLoadBusinessInformation') + ': ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Filter services based on search term and staff assignment
  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper function to get available services (staff-filtered or all)
  const getAvailableServices = () => {
    return services; // services is already filtered by staff assignment in useEffect
  };
  
  // Get display services for search
  const displayServices = searchTerm ? filteredServices : getAvailableServices();

  // Get images for carousel - use workplace photos if available, otherwise return empty array
  const getCarouselImages = () => {
    if (workplacePhotos && workplacePhotos.length > 0) {
      return workplacePhotos.map(photo => ({
        src: photo.src,
        alt: photo.alt || 'Workplace photo'
      }));
    }
    return [];
  };

  const handleReserveClick = (service) => {
    if (!isServiceAssignedToAnyStaff(service)) {
      toast.error(notAssignedLabel);
      return;
    }
    setSelectedService(service);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    document.body.style.overflow = "auto";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton height={60} width="60%" mb="md" />
            <Skeleton height={24} width="40%" mb="xl" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <Skeleton height={400} radius="lg" />
            </div>
            <div className="space-y-6">
              <Skeleton height={32} width="80%" />
              <Skeleton height={20} width="100%" />
              <Skeleton height={20} width="90%" />
              <Skeleton height={20} width="95%" />
              <Skeleton height={48} width="60%" mt="lg" />
            </div>
          </div>
          
          <div className="mb-8">
            <Skeleton height={40} width="30%" mb="md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton height={24} width="70%" mb="sm" />
                  <Skeleton height={20} width="50%" mb="sm" />
                  <Skeleton height={16} width="40%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Business</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="!bg-blue-600 !text-white hover:!bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-transparent flex flex-row justify-center w-full" 
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-[80%] max-w-full relative">
        <div className="relative w-full">
          
          <div className="px-3 md:px-6 lg:px-8 xl:px-12 relative">
            
            <motion.div 
              className="w-full lg:w-[60%] xl:w-[55%] h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] mt-[100px] rounded-[16px] overflow-hidden relative float-none lg:float-left"
              variants={leftSlideVariant}
            >
              {getCarouselImages().length > 0 ? (
                <Carousel
                  withIndicators
                  loop
                  height="100%"
                  nextControlIcon={<ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-[#556b2f]" />}
                  previousControlIcon={<ArrowLeft className="w-6 h-6 md:w-8 md:h-8 text-[#556b2f]" />}
                  controlssize={60}
                  styles={{
                    root: { height: '100%' },
                    controls: { padding: 0 },
                    control: {
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '@media (minWidth: 768px)': {
                        width: '60px',
                        height: '60px',
                      },
                      '@media (minWidth: 1024px)': {
                        width: '80px',
                        height: '80px',
                      }
                    },
                    next: { right: { base: -15, md: -20, lg: -30 } },
                    previous: { left: { base: -15, md: -20, lg: -30 } },
                    viewport: { height: '100%' },
                    slide: { height: '100%' },
                  }}
                  classNames={{
                    indicators: 'bottom-[16px] z-10',
                    indicator: '!rounded-full !border-[0.5px] !border-solid !transition-all !duration-300 !p-0 !min-w-0 !min-h-0 !w-[4px] !h-[4px] sm:!w-[5px] sm:!h-[5px] md:!w-[6px] md:!h-[6px] !border-[#dbdbdb] !bg-white !z-10',
                    indicatorActive: '!w-[8px] !h-[8px] sm:!w-[10px] sm:!h-[10px] md:!w-[12px] md:!h-[12px] !border-[#556b2f]'
                  }}
                >
                  {getCarouselImages().map((image, index) => (
                    <Carousel.Slide key={index} className="h-full">
                      <img
                        className="w-full h-full object-cover"
                        alt={image.alt}
                        src={image.src}
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg font-medium">{tc('noImagesFound')}</p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div 
              className="w-full lg:w-[38%] xl:w-[40%] float-none lg:float-right mt-6 lg:mt-[100px]"
              variants={rightSlideVariant}
            >
              <div className="w-full h-auto rounded-lg overflow-hidden mb-3">
                <div className="relative h-[300px] sm:h-[320px] md:h-[340px] lg:h-[360px]">
                  <div className="absolute w-full h-[180px] sm:h-[190px] md:h-[200px] lg:h-[220px] top-0 left-0 z-0">
                    <div className="w-full h-full relative">
                      <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />}>
                        <BusinessMap coordinates={getBusinessCoordinates()} />
                      </Suspense>
                    </div>
                    
                    <div className="absolute w-[95%] h-[70px] sm:h-[75px] md:h-[80px] lg:h-20 top-[110px] sm:top-[115px] md:top-[120px] lg:top-[124px] left-[2.5%] bg-white rounded-xl border border-solid border-[#cccccc] shadow-[0px_28px_12px_-24px_#0000001f] z-10">
                      <div className="p-0 flex items-center">
                        <div className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[50px] md:h-[50px] ml-2 sm:ml-3 my-2 rounded-full overflow-hidden">
                          <img
                            src={businessData?.profileImages?.logo || barber}
                            alt={`${businessData?.name || 'Business'} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col ml-2 sm:ml-3 gap-0.5">
                          <h3 className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-sm sm:text-base md:text-lg tracking-[0.4px]">
                            {businessData?.name || 'Business Name'}
                          </h3>
                          <p className="font-['Outfit',Helvetica] font-light text-[#333333] text-[10px] sm:text-xs tracking-[0.25px] leading-[16px] sm:leading-[18px]">
                            {businessData?.location?.address 
                              ? businessData.location.address
                              : businessData?.address 
                                ? (typeof businessData.address === 'object' 
                                  ? `${businessData.address.houseNumber || ''} ${businessData.address.streetName || ''}, ${businessData.address.city || ''} ${businessData.address.postalCode || ''}`.trim()
                                  : businessData.address
                                )
                                : '123 Main St, New York, NY 10001'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute w-full h-auto min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] top-[180px] sm:top-[190px] md:top-[200px] lg:top-[220px] left-0 bg-[#f9f9f9] rounded-b-lg shadow-md p-3 sm:p-4">
                    <div className="flex flex-col w-full items-start gap-1 sm:gap-2">
                      <h3 className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-base sm:text-lg leading-[20px] sm:leading-[22px]">
{tc('whoWeAre')}
                      </h3>
                      <p className="font-['Outfit',Helvetica] font-light text-[#323334] text-xs sm:text-sm leading-[18px] sm:leading-[20px]">
                        {businessData?.contactInfo?.description || tc('noDescriptionAdded')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-[#f9f9f9] rounded-xl p-3 mb-3">
                <h3 className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-base sm:text-lg leading-[20px] sm:leading-[22px] mb-3">
{tc('openingHours')}
                </h3>

                {!showFullWeek ? (
                  <div className="flex justify-between mb-3">
                    <span className="font-['Outfit',Helvetica] font-light text-[#323334] text-xs sm:text-sm leading-[20px] sm:leading-[22px]">
                      {tc('today')}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      {(() => {
                        const todaysHours = getTodaysHours();
                        
                        if (!todaysHours.isOpen) {
                          return (
                            <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-xs sm:text-sm leading-[20px] sm:leading-[22px]">
                              {tc('closed')}
                            </span>
                          );
                        }
                        
                        return todaysHours.hours.map((timeSlot, index) => (
                          <span key={index} className="font-['Outfit',Helvetica] font-medium text-[#323334] text-xs sm:text-sm leading-[20px] sm:leading-[22px]">
                            {formatTime(timeSlot.open)}&nbsp;&nbsp; -&nbsp;&nbsp; {formatTime(timeSlot.close)}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {getFullWeekHours().map((dayInfo, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className={`font-['Outfit',Helvetica] font-light text-xs sm:text-sm leading-[20px] sm:leading-[22px] ${
                          isToday(dayInfo.day) ? 'text-[#7d9a4b] font-medium' : 'text-[#323334]'
                        }`}>
                          {dayInfo.day}
                          {isToday(dayInfo.day) && (
                            <span className="ml-1 text-[10px] text-[#7d9a4b]">({tc('today')})</span>
                          )}
                        </span>
                        <div className="flex flex-col items-end gap-0.5">
                          {!dayInfo.isOpen ? (
                            <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-xs sm:text-sm leading-[20px] sm:leading-[22px]">
                              {tc('closed')}
                            </span>
                          ) : (
                            dayInfo.hours.map((timeSlot, timeIndex) => (
                              <span key={timeIndex} className="font-['Outfit',Helvetica] font-medium text-[#323334] text-xs sm:text-sm leading-[20px] sm:leading-[22px]">
                                {formatTime(timeSlot.open)}&nbsp;&nbsp; -&nbsp;&nbsp; {formatTime(timeSlot.close)}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => setShowFullWeek(!showFullWeek)}
                  variant="subtle"
                  color="#7d9a4b"
                  rightSection={<ChevronDown className={`w-[8px] sm:w-[10px] mt-1 transition-transform ${showFullWeek ? 'rotate-180' : ''}`} />}
                  className="!p-0 !h-auto !font-light !text-xs !sm:text-sm !leading-[20px] !sm:leading-[22px] !bg-transparent !font-['Outfit',Helvetica]"
                >
                  {showFullWeek ? tc('showTodayOnly') : tc('showFullWeek')}
                </Button>
              </div>

              <div className="w-full bg-[#f9f9f9] rounded-xl p-3 sm:p-4">
                <h3 className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-base sm:text-lg leading-[20px] sm:leading-[22px] mb-3">
                  {tc('socialNetworks')}
                </h3>

                <div className="flex flex-col gap-3">
                  {businessData?.socialMedia?.instagram && (
                    <a 
                      href={businessData.socialMedia.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <FooterInstagramIcon className="w-6 h-6 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm">
                          {tc('instagram')}
                        </span>
                        <span className="font-['Outfit',Helvetica] font-light text-[#7b7b7b] text-xs truncate">
                          {businessData.socialMedia.instagram}
                        </span>
                      </div>
                    </a>
                  )}
                  
                  {businessData?.socialMedia?.facebook && (
                    <a 
                      href={businessData.socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <FooterFacebookIcon className="w-6 h-6 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm">
                          {tc('facebook')}
                        </span>
                        <span className="font-['Outfit',Helvetica] font-light text-[#7b7b7b] text-xs truncate">
                          {businessData.socialMedia.facebook}
                        </span>
                      </div>
                    </a>
                  )}
                  
                  {businessData?.socialMedia?.twitter && (
                    <a 
                      href={businessData.socialMedia.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <FooterTwitterIcon className="w-6 h-6 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm">
                          {tc('twitter')}
                        </span>
                        <span className="font-['Outfit',Helvetica] font-light text-[#7b7b7b] text-xs truncate">
                          {businessData.socialMedia.twitter}
                        </span>
                      </div>
                    </a>
                  )}
                  
                  {businessData?.socialMedia?.website && (
                    <a 
                      href={businessData.socialMedia.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="#556B2F"/>
                      </svg>
                      <div className="flex flex-col">
                        <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm">
                          {tc('website')}
                        </span>
                        <span className="font-['Outfit',Helvetica] font-light text-[#7b7b7b] text-xs truncate">
                          {businessData.socialMedia.website}
                        </span>
                      </div>
                    </a>
                  )}
                  
                  {businessData?.socialMedia?.onlineShop && (
                    <a 
                      href={businessData.socialMedia.onlineShop} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="#556B2F"/>
                      </svg>
                      <div className="flex flex-col">
                        <span className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm">
                          {tc('onlineShop')}
                        </span>
                        <span className="font-['Outfit',Helvetica] font-light text-[#7b7b7b] text-xs truncate">
                          {businessData.socialMedia.onlineShop}
                        </span>
                      </div>
                    </a>
                  )}
                  
                  {!businessData?.socialMedia?.instagram && 
                   !businessData?.socialMedia?.facebook && 
                   !businessData?.socialMedia?.twitter && 
                   !businessData?.socialMedia?.website && 
                   !businessData?.socialMedia?.onlineShop && (
                    <p className="text-center text-gray-500 text-sm py-2">
                      {tc('noSocialMediaLinksAdded') || 'No social media links added yet.'}
                    </p>
                  )}
                </div>
              
              </div>
              
            </motion.div>         

            <motion.div 
              className="flex flex-col w-full lg:w-[56%] items-start gap-[4px] clear-both lg:clear-none pt-6 lg:pt-0"
              variants={fadeInUpVariant}
            >
              <div className="flex justify-between w-full">
                <h1 className="font-['Outfit',Helvetica] font-medium text-[#323334] text-xl sm:text-2xl md:text-3xl tracking-[0.8px] mt-6">
                  {businessData?.businessName || businessData?.name || 'Business Name'}
                </h1>
                <div className="mt-6 mr-3">
                  <ShareIcon />
                </div>
              </div>
              <div className="flex justify-between w-full items-center">
                <p className="text-[#333333] text-sm sm:text-base md:text-lg tracking-[0.4px] leading-[18px] sm:leading-[20px] font-['Outfit',Helvetica] font-light">
                  {businessData?.location?.address 
                    ? businessData.location.address
                    : businessData?.address 
                      ? (typeof businessData.address === 'object' 
                        ? `${businessData.address.houseNumber || ''} ${businessData.address.streetName || ''}, ${businessData.address.city || ''} ${businessData.address.postalCode || ''}`.trim()
                        : businessData.address
                      )
                      : '519 m • 123 Washington St, Miami, FL 33130'
                  }
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="w-full sm:w-[280px] md:w-[300px] lg:w-[320px] mt-4 sm:mt-6 h-[36px] sm:h-[40px] bg-[#1b1d21] rounded-[40px] flex items-center px-2 sm:px-3 py-1.5 sm:py-2"
              variants={fadeInUpVariant}
            >
              <img
                className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] mr-[6px] sm:mr-[8px]"
                alt="Mask group"
                src={Checky}
              />
              <span className="font-['Outfit',Helvetica] text-white text-xs sm:text-sm leading-[9px] sm:leading-[10px] whitespace-nowrap">
                <span className="font-light">{tc('recommendedBy')}&nbsp;&nbsp;</span>
                <span className="font-['Montserrat_Alternates',Helvetica] font-bold">
                  YOU CALENDY
                </span>
              </span>
            </motion.div>

            <motion.div 
              className="flex flex-col w-full lg:w-[55%] items-start mt-6 sm:mt-8"
              variants={fadeInUpVariant}
            >
              <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between mb-3 sm:mb-0">
                <h2 className="font-['Outfit',Helvetica] font-medium text-[#003366] text-lg sm:text-xl md:text-2xl leading-7 sm:leading-8 mb-3 sm:mb-0">
{tc('services')}
                </h2>

                <div className="relative w-full sm:w-[60%] lg:w-[50%]">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#556b2f]" />
                  </div>
                  <input
                    type="text"
                    placeholder={tc('searchForService')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[40px] sm:h-[45px] rounded-[8px] bg-[#eaeaea] border border-solid border-[#e2e2e2] pl-10 pr-3 text-sm font-['Outfit',Helvetica] font-normal text-[#8e8e8e] focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>

            <div className="w-full lg:w-[55%] h-px mt-4 bg-gray-200" />

            <motion.div 
              className="w-full lg:w-[55%] mt-4 mb-6 sm:mb-8"
              variants={fadeInUpVariant}
            >
              <Button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                variant="default"
                className="!w-full !h-10 sm:!h-12 !px-3 !bg-[#f8f8f8] !rounded-[12px] !border !border-solid !border-[#dce8f8] !font-normal !text-[#323334] !text-sm sm:!text-md !flex !justify-between"
              >
{tc('servicesWeProvide')}
                <ChevronDown className={`w-55 h-3.5 sm:w-220 sm:h-4 transition-transform ${isAccordionOpen ? 'transform rotate-180' : ''} mr-2`} />
              </Button>
              
              <AnimatePresence>
                {isAccordionOpen && (
                  <motion.div 
                    className="w-full mt-4 overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                  >
                    {displayServices.length > 0 ? (
                      displayServices.map((service, index) => (
                        <div key={service._id || index} className="mb-4">
                          <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between">
                            <div className="flex flex-col items-start gap-[2px] mb-2 sm:mb-0">
                              <h3 className="font-['Outfit',Helvetica] font-medium text-[#323334] text-sm sm:text-base md:text-lg leading-[20px] sm:leading-[22px]">
                                {service.name || service.title}
                              </h3>
                              <p className="font-['Outfit',Helvetica] font-light text-[#93afd6] text-[10px] xs:text-xs md:text-sm leading-[20px] sm:leading-[22px]">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto justify-between">
                              {(() => {
                                const assigned = isServiceAssignedToAnyStaff(service);
                                const durationLabel = getServiceDurationLabel(service);
                                const btnClass = assigned
                                  ? "!w-[90px] sm:!w-[100px] !bg-[#556b2f] !rounded-lg !font-['Outfit',Helvetica] !font-normal !text-white !text-xs sm:!text-sm md:!text-base !tracking-[0.35px] !leading-[24px] sm:!leading-[28px] !py-0.5"
                                  : "!w-[90px] sm:!w-[100px] !bg-gray-300 !rounded-lg !font-['Outfit',Helvetica] !font-normal !text-gray-600 !text-xs sm:!text-sm md:!text-base !tracking-[0.35px] !leading-[24px] sm:!leading-[28px] !py-0.5 !cursor-not-allowed";
                                
                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      {assigned && durationLabel ? (
                                        <span className="font-['Outfit',Helvetica] font-light text-[#848d9b] text-xs sm:text-sm tracking-[-0.15px] leading-[20px] sm:leading-[22px]">
                                          {durationLabel}
                                        </span>
                                      ) : null}
                                      <span className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-sm sm:text-base md:text-lg leading-[20px] sm:leading-[22px]">
                                        ${service.price || '10.00'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Button
                                        disabled={!assigned}
                                        onClick={() => handleReserveClick(service)}
                                        className={btnClass}
                                      >
                                        {tc('reserve')}
                                      </Button>
                                      {!assigned && (
                                        <span className="text-[10px] sm:text-xs text-red-600">
                                          {notAssignedLabel}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          {index < displayServices.length - 1 && (
                            <div className="my-4 h-px bg-gray-200" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {searchTerm 
                            ? 'No services found matching your search.' 
                            : assignedStaff 
                              ? `No services available for ${assignedStaff.firstName || 'assigned staff'}.`
                              : 'No services available.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      
      {showModal ? (
        <Suspense fallback={null}>
          <ReservationModal 
            show={showModal} 
            onClose={closeModal} 
            service={selectedService} 
            selectedStaffInfo={assignedStaff}
            timeFormatPreference={preferredTimeFormat}
          />
        </Suspense>
      ) : null}
      
    </motion.div>
  );
};

export default Home;
