import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, X, CheckCircle, AlertCircle, Search, Navigation } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { Button, Select, TextInput, Loader, Tooltip, Paper, Text, Transition } from "@mantine/core";
import { useForm } from '@mantine/form';
import {
  IoArrowBackCircleOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import { FaGoogle } from "react-icons/fa";

import {
  useGetBusiness,
  useUpdateBusinessLocation,
} from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const LocationPage = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Google Place ID state
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [placeIdStatus, setPlaceIdStatus] = useState(null); // 'success', 'error', 'not_found'
  const [placeName, setPlaceName] = useState("");
  
  const autocompleteRef = useRef(null);

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY || "",
    libraries,
  });

  const { data: businessData, isLoading: isFetchingBusiness } = useGetBusiness();
  const { mutate: updateLocation, isPending: isSaving } =
    useUpdateBusinessLocation();

  const form = useForm({
    initialValues: {
      workType: "At my place only",
      address: "",
    },
    validate: {
      workType: (value) => (!value ? tc('pleaseSelectWorkType') : null),
      address: (value) => {
        if (!value) return tc('addressRequired');
        if (value.length < 5) return tc('addressTooShort');
        return null;
      },
    }
  });

  // Load initial data
  useEffect(() => {
    if (businessData?.data) {
      const { location, googlePlaceId: existingPlaceId, workType } = businessData.data;
      
      if (workType) form.setFieldValue("workType", workType);
      if (location?.address) form.setFieldValue("address", location.address);
      
      if (existingPlaceId) {
        setGooglePlaceId(existingPlaceId);
        setPlaceIdStatus('success');
      }
      
      if (Array.isArray(location?.coordinates) && location.coordinates.length === 2) {
        const [lng, lat] = location.coordinates;
        if (lat && lng) {
          const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
          setMarkerPosition(newPos);
          if (map) map.panTo(newPos);
        }
      }
    }
  }, [businessData, map]);

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
        map.panTo(newPos);
        map.setZoom(17);
        
        if (place.formatted_address) {
          form.setFieldValue("address", place.formatted_address);
          setPlaceName(place.name || place.formatted_address);
        }
        
        if (place.place_id) {
          setGooglePlaceId(place.place_id);
          setPlaceIdStatus('success');
        }
      } else {
        console.log("Autocomplete returned place with no geometry");
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
          map.panTo(newPos);
          map.setZoom(15);
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

  const handleSave = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      const payload = {
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
        address: form.values.address,
        googlePlaceId: googlePlaceId || undefined,
        workType: form.values.workType,
      };
      
      updateLocation(payload, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    }
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
          {tc('checkApiKey') || 'Please check your Google Maps API Key in configuration.'}
        </Text>
        <Button mt="xl" variant="outline" onClick={() => navigate(-1)}>{tc('goBack')}</Button>
      </Paper>
    );
  }

  return (
    <BatchTranslationLoader>
      <main className="max-w-none h-[83vh] overflow-auto bg-white mx-auto p-6 rounded-[18px] max-md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 sm:gap-0 max-md:mb-6">
          <Link to={-1} className="flex w-auto">
            <Button
              size="lg"
              variant="subtle"
              color="gray"
              className="!text-black !bg-gray-50 hover:!bg-gray-100 max-md:size-md max-md:!text-sm"
            >
              <IoArrowBackCircleOutline size={24} className="me-2" /> {tc('goBack')}
            </Button>
          </Link>

          <Button 
            color="#323334" 
            size="md" 
            px={50} 
            radius={10}
            className="max-md:w-full"
            onClick={handleSave}
            loading={isFetchingBusiness || isSaving}
          >
            {tc('save')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[#323334] mb-2">
                {tc('officeLocation')}
              </h2>
              <p className="text-gray-500 text-sm">
                {tc('officeLocationDescription')}
              </p>
            </div>

            <Select
              label={tc('iWork')}
              placeholder={tc('selectWorkType')}
              size="md"
              radius="md"
              {...form.getInputProps('workType')}
              data={[
                { value: "At my place only", label: tc('atMyPlaceOnly') },
                { value: "Both my place and mobile", label: tc('bothMyPlaceAndAndMobile') },
                { value: "Only mobile", label: tc('onlyMobile') },
              ]}
              styles={{ label: { marginBottom: 6, fontWeight: 500 } }}
            />

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
                    styles={{ label: { marginBottom: 6, fontWeight: 500 } }}
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
                      <Text size="sm" weight={600} color="gray.8">
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

            {locationError && (
              <Paper p="xs" bg="red.0" withBorder borderColor="red.2">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {locationError}
                </div>
              </Paper>
            )}

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
          </div>

          {/* Map Side */}
          <div className="lg:col-span-7 h-[500px] min-h-[400px] relative rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
            {!isLoaded ? (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4">
                <Loader color="blue" />
                <Text color="dimmed" size="sm">{tc('loadingMaps') || "Initializing Map Infrastructure..."}</Text>
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

            {/* Instruction Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 pointer-events-none">
              <Text size="xs" weight={500} className="flex items-center gap-2">
                <span className="text-blue-500">📍</span>
                {tc('clickToSetLocation') || 'Click anywhere on map to set your precise location'}
              </Text>
            </div>
          </div>
        </div>
      </main>
    </BatchTranslationLoader>
  );
};

export default LocationPage;
