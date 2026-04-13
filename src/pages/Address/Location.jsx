import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Navigation, Search, CheckCircle, AlertCircle, MapPin as MapPinIcon } from 'lucide-react';
import { Button, TextInput, Loader, Paper, Text, Transition } from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import LazyFooter from '../../components/home/landing/LazyFooter';
import { HeaderLogo } from "../../components/common/Svgs";
import { setLocation, nextStep, prevStep } from '../../store/registrationSlice';
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { FaGoogle } from "react-icons/fa";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const LogoSection = ({ onBackClick }) => (
  <div className="w-full flex justify-start items-start mb-5 px-4 sm:px-0">
    <div className="flex flex-col">
      <div className="mb-3">
        <Link to="/" className="cursor-pointer">
          <HeaderLogo />
        </Link>
      </div>
      <Button
        onClick={onBackClick}
        variant="subtle"
        p={0}
        top={{ base: 20, sm: 40 }}
        styles={{ 
          root: { color: '#323334' },
          label: { fontSize: '1rem', fontWeight: 500 }
        }}
        classNames={{
          root: '!bg-transparent'
        }}
        leftSection={<ArrowLeft className="mr-1 h-4 w-4" />}
        aria-label="Go back"
      >
        Back
      </Button>
    </div>
  </div>
);

const ProgressBar = () => (
  <div className="w-full max-w-[450px] h-2 bg-[#E0E7FF] mb-6 rounded-full relative">
    <div className="w-[calc(100%/5*4)] h-2 bg-[#2F70EF] absolute left-0 top-0 rounded-full transition-all duration-300"></div>
  </div>
);

const FormHeader = () => (
  <div className="flex flex-col items-center w-full mb-4 mt-10 max-sm:mt-5">
    <h1 className="text-[#323334] text-center text-2xl sm:text-3xl font-bold leading-tight">
      Adjust Your Location Pin
    </h1>
    <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
      Where can customers find you?
    </p>
  </div>
);

const Location = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const initialLocation = useSelector((state) => state.registration.location);
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(() => {
    if (initialLocation.coordinates && initialLocation.coordinates[0] !== 0) {
      return { lat: initialLocation.coordinates[0], lng: initialLocation.coordinates[1] };
    }
    return defaultCenter;
  });
  
  const [googlePlaceId, setGooglePlaceId] = useState(initialLocation.googlePlaceId || "");
  const [placeName, setPlaceName] = useState("");
  const [placeIdStatus, setPlaceIdStatus] = useState(googlePlaceId ? 'success' : null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY || "",
    libraries,
  });

  const form = useForm({
    initialValues: {
      address: initialLocation.address || ''
    },
    validate: {
      address: (value) => (!value ? tc('addressRequired') : null)
    }
  });

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        setMarkerPosition(newPos);
        if (map) {
          map.panTo(newPos);
          map.setZoom(17);
        }
        
        if (place.formatted_address) {
          form.setFieldValue("address", place.formatted_address);
          setPlaceName(place.name || place.formatted_address);
        }
        
        if (place.place_id) {
          setGooglePlaceId(place.place_id);
          setPlaceIdStatus('success');
        }
      }
    }
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setMarkerPosition(newPos);
    
    // Reverse geocode to get place ID and address
    setIsFetchingInfo(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: newPos }, (results, status) => {
      setIsFetchingInfo(false);
      if (status === "OK") {
        if (results[0]) {
          const bestResult = results[0];
          setGooglePlaceId(bestResult.place_id);
          setPlaceIdStatus('success');
          setPlaceName(bestResult.formatted_address);
          
          if (!form.values.address) {
            form.setFieldValue("address", bestResult.formatted_address);
          }
        } else {
          setPlaceIdStatus('not_found');
        }
      } else {
        console.error("Geocoder failed due to: " + status);
        setPlaceIdStatus('error');
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(newPos);
          if (map) {
            map.panTo(newPos);
            map.setZoom(15);
          }
          setIsGettingLocation(false);
          
          // Trigger reverse geocoding for this point
          handleMapClick({ latLng: { lat: () => newPos.lat, lng: () => newPos.lng } });
        },
        () => {
          setIsGettingLocation(false);
          setLocationError(tc('locationPermissionDenied'));
        }
      );
    } else {
      setLocationError(tc('geolocationNotSupported'));
    }
  };

  const handleNext = (values) => {
    dispatch(setLocation({
      address: values.address,
      coordinates: [markerPosition.lat, markerPosition.lng],
      googlePlaceId: googlePlaceId || null,
    }));
    dispatch(nextStep());
    navigate('/business-hours');
  };

  const handleBack = () => {
    dispatch(prevStep());
    navigate('/address');
  };

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi.business",
        stylers: [{ visibility: "on" }],
      },
    ],
  }), []);

  if (loadError) {
    return (
      <Paper p="xl" withBorder className="text-center mt-10 mx-auto max-w-md">
        <AlertCircle size={40} color="red" className="mx-auto mb-4" />
        <Text weight={600} size="lg">{tc('errorLoadingMaps') || 'Error Loading Maps'}</Text>
        <Text size="sm" color="dimmed" mt="xs">
          {tc('checkApiKey') || 'Please check your Google Maps API Key.'}
        </Text>
        <Button mt="xl" onClick={handleBack}>{tc('goBack')}</Button>
      </Paper>
    );
  }

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto">
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-6 sm:p-10 border-t-[3px] border-[#FCFFFF] max-md:p-6 max-sm:p-4">
        <LogoSection onBackClick={handleBack} />
        <ProgressBar />

        <div className="flex flex-col items-center w-[90%] max-w-[1200px] max-md:w-full">
          <div className="flex flex-col items-center gap-6 w-full max-sm:gap-4">
            <FormHeader />
            
            <form onSubmit={form.onSubmit(handleNext)} className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                {/* Left Side: Inputs and Info */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="relative">
                    {!isLoaded ? (
                      <TextInput
                        label={tc('searchBusinessAddress')}
                        placeholder={tc('loadingMaps') || "Loading Maps..."}
                        disabled
                        size="md"
                        radius="md"
                      />
                    ) : (
                      <Autocomplete
                        onLoad={handleAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <TextInput
                          label={tc('searchBusinessAddress')}
                          placeholder={tc('enterYourAddress')}
                          size="md"
                          radius="md"
                          {...form.getInputProps('address')}
                          rightSection={isFetchingInfo ? <Loader size="xs" /> : <Search size={18} color="#9ea3a8" />}
                          styles={{ label: { marginBottom: 6, fontWeight: 500, color: '#323334' } }}
                        />
                      </Autocomplete>
                    )}
                  </div>

                  {/* Place ID Display Card */}
                  <Transition mounted={!!googlePlaceId || isFetchingInfo} transition="fade" duration={400}>
                    {(styles) => (
                      <Paper style={styles} withBorder p="md" radius="md" bg="gray.0">
                        <div className="flex items-start gap-3">
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <FaGoogle className="text-blue-500" size={20} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <Text size="sm" weight={600} color="gray.8" className="font-['Outfit']">
                              {isFetchingInfo ? tc('detectingPlaceId') : (placeName || tc('googlePlaceInfo'))}
                            </Text>
                            {googlePlaceId && (
                              <Text size="xs" color="dimmed" className="truncate font-mono mt-1">
                                ID: {googlePlaceId}
                              </Text>
                            )}
                            {placeIdStatus === 'success' && (
                              <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-medium">
                                <CheckCircle size={14} />
                                {tc('connectedToGoogleReviews')}
                              </div>
                            )}
                          </div>
                        </div>
                      </Paper>
                    )}
                  </Transition>

                  <Button
                    variant="light"
                    color="blue"
                    leftSection={<Navigation size={18} />}
                    onClick={getCurrentLocation}
                    loading={isGettingLocation}
                    className="self-start"
                  >
                    {tc('useCurrentLocation')}
                  </Button>

                  {locationError && (
                    <Paper p="xs" bg="red.0" withBorder borderColor="red.2">
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {locationError}
                      </div>
                    </Paper>
                  )}
                </div>

                {/* Right Side: Map */}
                <div className="lg:col-span-7 h-[450px] relative rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                  {!isLoaded ? (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4">
                      <Loader color="blue" />
                      <Text color="dimmed" size="sm">Initializing Map...</Text>
                    </div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={markerPosition}
                      zoom={15}
                      onLoad={onMapLoad}
                      onClick={handleMapClick}
                      options={mapOptions}
                    >
                      <Marker 
                        position={markerPosition} 
                        animation={window.google.maps.Animation.DROP}
                      />
                    </GoogleMap>
                  )}

                  {/* Map Instructions */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md z-[10]">
                    <Text size="xs" weight={500} className="flex items-center gap-2 whitespace-nowrap">
                      <MapPinIcon size={14} className="text-red-500" />
                      {tc('clickToSetLocation') || 'Click on map to set your precise location'}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="flex justify-end w-full mb-10 mt-10 max-sm:mb-5">
                <Button
                  size="md"
                  radius="md"
                  type="submit"
                  px={60}
                  className="max-sm:w-full"
                  styles={{
                    root: {
                      backgroundColor: '#323334',
                      height: '50px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '16px',
                      '&:hover': { backgroundColor: '#444' },
                    }
                  }}
                  aria-label="Next step"
                >
                  Next Step
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default Location;
