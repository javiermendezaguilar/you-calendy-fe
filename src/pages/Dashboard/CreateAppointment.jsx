import { Button, Select, TextInput, ActionIcon, Chip, Group, Loader, Skeleton, Alert, Text } from "@mantine/core";
import { IoWarningOutline } from "react-icons/io5";
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { TimeInput, DatePickerInput } from "@mantine/dates";
import { LuClock } from "react-icons/lu";
import {
  IoArrowBackCircleOutline,
  IoChevronDownOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { AddClientIcon, EmptyClientIcon } from "../../components/icons";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import ClientForm from "../../components/barber/appointment/ClientForm";
import CommonModal from "../../components/common/CommonModal";
import { useCreateAppointment, useGetAvailableSlots } from "../../hooks/useAppointments";
import { useGetClients, useAddClient, useCreateUnregisteredClient } from "../../hooks/useClients";
import { useGetServices } from "../../hooks/useServices";
import { useGetStaff } from "../../hooks/useStaff";
import { useGetBusiness } from "../../hooks/useBusiness";
import { useGetFlashSales, useGetPromotions } from "../../hooks/useMarketing";
import { toast } from "sonner";
import moment from "moment";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const normalizeTimeFormatPreference = (format) => {
  const normalized = String(format || "").trim().toLowerCase();
  if (normalized.startsWith("24") || normalized.includes("military")) {
    return "24h";
  }
  return "12h";
};

const formatTimeString = (time, normalizedPreference = "24h") => {
  if (!time) return "";
  const [hoursPart, minutesPart = "00"] = String(time).split(":");
  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(time);
  }

  const minuteStr = minutes.toString().padStart(2, "0");

  if (normalizedPreference === "24h") {
    return `${hours.toString().padStart(2, "0")}:${minuteStr}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour.toString().padStart(2, "0")}:${minuteStr} ${period}`;
};

const CreateAppointment = () => {
  const { tc } = useBatchTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [successModalOpened, { open: openSuccessModal, close: closeSuccessModal }] = useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientWarning, setClientWarning] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [endTime, setEndTime] = useState("");
  
  // Use server-side search, increased limit, and sort by newest first
  const { data: clientsResponse, isLoading: clientsLoading } = useGetClients({
    search: debouncedSearchQuery,
    limit: 50,
    sort: 'createdAt:desc'
  });
  
  // useGetClients returns a normalized object { clients, pagination }
  const clients = clientsResponse?.clients || [];
  const { data: services, isLoading: servicesLoading } = useGetServices();
  const { data: staffResponse, isLoading: staffLoading } = useGetStaff();
  const staff = staffResponse?.data?.data?.staff;
  const { mutate: createAppointment, isLoading: isCreatingAppointment } = useCreateAppointment();
  const { mutate: addClient, isLoading: isAddingClient } = useAddClient();
  const { mutate: createUnregisteredClient, isLoading: isCreatingUnregistered } = useCreateUnregisteredClient();
  const { data: businessData } = useGetBusiness();
  const businessId = businessData?.data?._id;
  const preferredTimeFormat = useMemo(
    () => normalizeTimeFormatPreference(businessData?.data?.timeFormatPreference),
    [businessData?.data?.timeFormatPreference]
  );
  const { data: flashSales = [] } = useGetFlashSales();
  const { data: promotions = [] } = useGetPromotions();
  const formatSlotForDisplay = useCallback(
    (slot) => formatTimeString(slot, preferredTimeFormat),
    [preferredTimeFormat]
  );
  const navigate = useNavigate();

  const ref = useRef(null);
  const endRef = useRef(null);

  const form = useForm({
    initialValues: {
      serviceId: '',
      staffId: '',
      date: null,
      startTime: '',
    },
    validate: {
      serviceId: (value) => (value ? null : tc('serviceIsRequired')),
      staffId: (value) => (value ? null : tc('staffIsRequired')),
      date: (value) => (value ? null : tc('dateIsRequired')),
      startTime: (value) => (value ? null : tc('startTimeMustBeSelected')),
    },
  });

  const {
    data: availableSlots,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useGetAvailableSlots({
    businessId,
    serviceId: form.values.serviceId,
    date: form.values.date,
    staffId: form.values.staffId
  });

  const selectedService = services?.find(s => s._id === form.values.serviceId);
  const selectedStaff = staff?.find(s => s._id === form.values.staffId);
  const filteredAvailableSlots = useMemo(() => {
    if (!availableSlots || !form.values.date) return availableSlots || [];

    const formatLocalYmd = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const toMinutes = (hm) => {
      const [h, m] = hm.split(':').map(Number);
      return h * 60 + m;
    };

    const bufferMinutes = Number(selectedStaff?.bookingBuffer) || 0;

    const today = new Date();
    const selectedDateYmd = formatLocalYmd(form.values.date);
    const todayYmd = formatLocalYmd(today);

    if (selectedDateYmd < todayYmd) return [];
    if (selectedDateYmd === todayYmd) {
      const thresholdMinutes = today.getHours() * 60 + today.getMinutes() + bufferMinutes;
      return (availableSlots || []).filter((slot) => toMinutes(slot) >= thresholdMinutes);
    }
    return availableSlots || [];
  }, [availableSlots, form.values.date, selectedStaff]);

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    if (!form.values.serviceId) return staff;
    // Filter staff who offer the selected service (check if service object has the serviceId)
    return staff.filter(s => {
      if (!Array.isArray(s?.services)) return false;
      // services can be array of service IDs or array of {service, timeInterval} objects
      return s.services.some(service => {
        if (typeof service === 'string') return service === form.values.serviceId;
        if (typeof service === 'object') return service.service === form.values.serviceId;
        return false;
      });
    });
  }, [staff, form.values.serviceId]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!form.values.staffId) return services;
    // Get service IDs that the selected staff offers
    const serviceIds = selectedStaff?.services?.map(s => {
      if (typeof s === 'string') return s;
      if (typeof s === 'object') return s.service;
      return null;
    }).filter(Boolean) || [];
    return services.filter(s => serviceIds.includes(s._id));
  }, [services, selectedStaff, form.values.staffId]);

  // Calculate discount based on flash sale or happy hour
  const discountInfo = useMemo(() => {
    if (!selectedService || !form.values.date || !form.values.startTime) {
      return null;
    }

    const originalPrice = selectedService.price || 0;
    let appliedFlashSale = null;
    let appliedPromotion = null;

    // Check for happy hour (promotion) first
    if (promotions && Array.isArray(promotions)) {
      const dayOfWeek = form.values.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const [hours, minutes] = form.values.startTime.split(':').map(Number);
      const appointmentTimeMinutes = hours * 60 + minutes;

      appliedPromotion = promotions.find((promo) => {
        if (!promo.isActive) return false;
        if (promo.dayOfWeek?.toLowerCase() !== dayOfWeek) return false;

        // Check if selected service is in promotion's services
        const serviceIds = promo.services?.map(s => {
          if (typeof s === 'string') return s;
          if (typeof s === 'object' && s._id) return s._id;
          return null;
        }).filter(Boolean) || [];
        if (!serviceIds.includes(selectedService._id)) return false;

        // Check if appointment time is within promotion time range
        const [startHour, startMin] = promo.startTime.split(':').map(Number);
        const [endHour, endMin] = promo.endTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMin;
        const endTimeMinutes = endHour * 60 + endMin;

        return appointmentTimeMinutes >= startTimeMinutes && appointmentTimeMinutes <= endTimeMinutes;
      });
    }

    // Check for flash sale
    if (flashSales && Array.isArray(flashSales)) {
      const appointmentDateTime = new Date(form.values.date);
      const [hours, minutes] = form.values.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      appliedFlashSale = flashSales.find((sale) => {
        if (!sale.isActive) return false;
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        return appointmentDateTime >= startDate && appointmentDateTime <= endDate;
      });
    }

    // Calculate discount based on applyBothDiscounts flag
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

    return null;
  }, [selectedService, form.values.date, form.values.startTime, flashSales, promotions]);

  // Remove duration calculation since backend handles it
  useEffect(() => {
    // No longer calculating endTime based on service duration
    // Backend will calculate duration from staff-service timeInterval
    setEndTime("");
  }, [form.values.startTime, selectedService]);

  useEffect(() => {
    if (!form.values.serviceId || !form.values.staffId) return;
    const staffMember = staff?.find(s => s._id === form.values.staffId);
    // Check if staff offers the service (handle both old and new format)
    const offersService = staffMember?.services?.some(s => {
      if (typeof s === 'string') return s === form.values.serviceId;
      if (typeof s === 'object') return s.service === form.values.serviceId;
      return false;
    });
    if (!offersService) {
      form.setFieldValue('staffId', '');
      form.setFieldValue('startTime', '');
      setEndTime("");
      toast.warning?.(tc('selectedStaffDoesNotOfferService') || 'Selected staff does not offer the chosen service');
    }
  }, [form.values.serviceId]);

  useEffect(() => {
    if (!form.values.staffId || !form.values.serviceId) return;
    const staffMember = staff?.find(s => s._id === form.values.staffId);
    // Check if staff offers the service (handle both old and new format)
    const offersService = staffMember?.services?.some(s => {
      if (typeof s === 'string') return s === form.values.serviceId;
      if (typeof s === 'object') return s.service === form.values.serviceId;
      return false;
    });
    if (!offersService) {
      form.setFieldValue('serviceId', '');
      form.setFieldValue('startTime', '');
      setEndTime("");
      toast.warning?.(tc('selectedServiceNotOfferedByStaff') || 'Selected service is not offered by the chosen staff');
    }
  }, [form.values.staffId]);

  // Reset selected time slot when date changes
  useEffect(() => {
    // Only reset if we have a previous date and it's different from current date
    const currentDateString = form.values.date ? form.values.date.toDateString() : null;

    // Use a ref to store the previous date string
    if (!window.previousDateString) {
      window.previousDateString = currentDateString;
      return;
    }

    if (window.previousDateString !== currentDateString) {
      form.setFieldValue('startTime', '');
      setEndTime("");
      window.previousDateString = currentDateString;
    }
  }, [form.values.date]);

  // Note: Removed the useEffect that resets startTime when service/staff changes
  // as it was interfering with slot selection. The available slots will update
  // automatically when service/staff changes, and users can select from the new slots.

  // Clear selected startTime if it's no longer available after filtering
  useEffect(() => {
    if (form.values.startTime && Array.isArray(filteredAvailableSlots)) {
      if (!filteredAvailableSlots.includes(form.values.startTime)) {
        form.setFieldValue('startTime', '');
        setEndTime("");
      }
    }
  }, [filteredAvailableSlots]);

  const handleClientSelect = (client) => {
    setSelectedClient(client);

    // Check for incident notes
    if (client.incidentNotes && client.incidentNotes.length > 0) {
      const noShows = client.incidentNotes.filter(n => n.type === 'no-show');
      if (noShows.length > 0) {
        setClientWarning({
          title: tc('clientHasNoShowHistory'),
          message: (
            <div className="max-h-40 overflow-y-auto pr-2 mt-2">
              <Text size="sm" weight={600} mb={4}>
                {tc('thisClientHas')} {noShows.length} {tc('noShowIncidents')}.
              </Text>
              <div className="space-y-3">
                {[...noShows].reverse().map((incident, idx) => (
                  <div key={idx} className="bg-white/50 p-2 rounded-md border border-red-100">
                    <div className="flex justify-between items-center mb-1">
                      <Text size="xs" weight={700} color="red.8">
                        {moment(incident.date).format('MMM D, YYYY')}
                      </Text>
                    </div>
                    <Text size="xs" color="gray.8">
                      {incident.note || tc('noDetailsProvided')}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )
        });
      } else {
        setClientWarning(null);
      }
    } else {
      setClientWarning(null);
    }
  };

  const handleAddNewClient = (clientData) => {
    addClient(
      clientData,
      {
        onSuccess: (data) => {
          close();
          // Backend returns { client, invitationLink, smsStatus } in data.data.data
          const newClient = data?.data?.data?.client || data?.data?.user;
          if (newClient) {
            setSelectedClient(newClient);
          }
        },
      }
    );
  };

  const handleAddUnregisteredClient = (clientData) => {
    createUnregisteredClient(
      clientData,
      {
        onSuccess: (data) => {
          close();
          const newClient = data?.data?.data?.client;
          if (newClient) {
            setSelectedClient(newClient);
          }
        },
      }
    );
  };

  const handleBookAppointment = (values) => {
    if (!selectedClient) {
      toast.error(tc('pleaseSelectClient'));
      return;
    }

    if (!selectedService) {
      toast.error(tc('couldNotFindServiceDetails'));
      return;
    }

    const formatLocalYmd = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Backend will calculate duration and endTime from staff-service timeInterval
    const appointmentData = {
      clientId: selectedClient._id,
      serviceId: values.serviceId,
      staffId: values.staffId,
      date: formatLocalYmd(values.date),
      startTime: values.startTime,
      price: selectedService?.price,
    };

    createAppointment(appointmentData, {
      onSuccess: () => {
        openSuccessModal();
        form.reset();
        setSelectedClient(null);
      }
    });
  };

  const SuccessModalContent = () => (
    <div className="p-6 flex flex-col items-center">
      <IoCheckmarkCircleOutline size={80} className="text-green-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">{tc('appointmentCreated')}</h2>
      <p className="text-center text-slate-600 mb-6">{tc('appointmentSuccessfullyScheduled')}</p>
      <Button onClick={() => { closeSuccessModal(); navigate('/dashboard'); }} className="!bg-[#323334] hover:!bg-[#3a3b3c]">
        {tc('close')}
      </Button>
    </div>
  );

  const filteredClients = clients?.filter(client => {
    const firstName = client.firstName || '';
    const lastName = client.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    const displayName = fullName || tc('notFilledYet').toLowerCase();
    const phone = String(client.phone || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return displayName.includes(q) || phone.includes(q);
  });

  return (
    <BatchTranslationLoader>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 h-[83vh] overflow-auto">
        <div className="xl:col-span-2">
          <div className="bg-slate-50 p-5 flex flex-col gap-10">
            <Link to={"/dashboard"} className="flex w-auto">
              <Button
                size="lg"
                className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
              >
                <IoArrowBackCircleOutline
                  size={24}
                  className="me-2 hidden sm:block"
                />{" "}
                {tc('goBack')}
              </Button>
            </Link>
            <div>
              <p className="text-2xl text-semibold text-slate-900">
                {tc('newAppointment')}
              </p>
              <p className="text-slate-400 xl:w-1/2">
                {tc('easilyScheduleClientForNextCut')}
              </p>
            </div>

            {clientWarning && (
              <Alert
                icon={<IoWarningOutline size={24} />}
                title={clientWarning.title}
                color="red"
                variant="filled"
                radius="md"
                withCloseButton
                onClose={() => setClientWarning(null)}
                styles={{
                  root: { backgroundColor: '#FFF5F5', borderColor: '#ffc9c9', color: '#c92a2a' },
                  title: { color: '#c92a2a', fontWeight: 700 },
                  message: { color: '#c92a2a' },
                  closeButton: { color: '#c92a2a', '&:hover': { backgroundColor: '#ffe3e3' } }
                }}
              >
                {clientWarning.message}
              </Alert>
            )}

          </div>
          <form className="bg-white px-5 py-6 flex flex-col gap-6" onSubmit={form.onSubmit(handleBookAppointment)}>
            <div className="flex flex-col gap-6 xl:w-2/3">
              <label>
                <p className="text-[#7184B4] font-light">{tc('selectService')}</p>
                <Select
                  variant="filled"
                  radius={10}
                  placeholder={tc('selectService')}
                  size="md"
                  data={filteredServices?.map(s => ({ value: s._id, label: `${s.name} - $${s.price}` })) || []}
                  rightSection={<IoChevronDownOutline />}
                  error={form.errors.serviceId}
                  {...form.getInputProps('serviceId')}
                  disabled={servicesLoading}
                />
              </label>
              <label>
                <p className="text-[#7184B4] font-light">{tc('selectStaff')}</p>
                <Select
                  variant="filled"
                  radius={10}
                  placeholder={tc('selectStaff')}
                  size="md"
                  data={filteredStaff?.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName}` })) || []}
                  rightSection={<IoChevronDownOutline />}
                  error={form.errors.staffId}
                  {...form.getInputProps('staffId')}
                  disabled={staffLoading}
                />
              </label>
              <label>
                <p className="text-[#7184B4] font-light">{tc('date')}</p>
                <DatePickerInput
                  variant="filled"
                  radius={10}
                  size="md"
                  placeholder={tc('selectDate')}
                  error={form.errors.date}
                  {...form.getInputProps('date')}
                />
              </label>
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
                    ) : filteredAvailableSlots?.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">{tc('noAvailableSlots')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {filteredAvailableSlots?.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              form.setFieldValue('startTime', slot);
                            }}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${form.values.startTime === slot
                                ? 'bg-[#7d9a4b] text-white shadow-md'
                                : 'bg-white border-2 border-[#E6E8EC] text-gray-700 hover:border-[#7d9a4b] hover:bg-[#7d9a4b]/5'
                              }`}
                          >
                            {formatSlotForDisplay(slot)}
                          </button>
                        ))}
                      </div>
                    )}

                    {form.errors.startTime && (
                      <p className="text-red-500 text-sm mt-1 text-center">{form.errors.startTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[#7184B4] font-light mb-2">{tc('total')}</p>
              {discountInfo ? (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">{tc('originalPrice')}</p>
                      <p className="text-sm text-slate-600 line-through">${discountInfo.originalPrice.toFixed(2)}</p>
                    </div>
                    {discountInfo.type === 'both' ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-green-600 font-medium">
                            {tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')}
                          </p>
                          <p className="text-sm text-green-600 font-medium">-${discountInfo.discountAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-green-600 font-medium">
                            {tc('flashSale')} {discountInfo.flashSaleDiscountPercentage}% {tc('off')}
                          </p>
                          <p className="text-sm text-green-600 font-medium">-${discountInfo.flashSaleDiscountAmount.toFixed(2)}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-600 font-medium">
                          {discountInfo.type === 'flashSale' ? tc('flashSale') : tc('happyHours')} {discountInfo.discountPercentage}% {tc('off')}
                        </p>
                        <p className="text-sm text-green-600 font-medium">-${discountInfo.discountAmount.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-green-200">
                      <p className="font-semibold text-lg">{tc('total')}</p>
                      <p className="font-semibold text-xl text-green-600">${discountInfo.finalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 italic">
                    {discountInfo.type === 'both'
                      ? tc('bothDiscountsApplied') || 'Both discounts applied'
                      : discountInfo.type === 'flashSale'
                        ? tc('flashSaleDiscountApplied')
                        : tc('happyHourDiscountApplied')}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-200 w-32 rounded-lg">
                  <p className="font-semibold text-xl">${selectedService?.price || '0.00'}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="md"
                radius="md"
                color="#323334"
                className="!w-full md:w-auto"
                loading={isCreatingAppointment}
              >
                {tc('bookAppointment')}
              </Button>
            </div>
          </form>
        </div>
        <div className="px-4 mt-10 sm:mt-0">
        <div
          onClick={open}
          className="mb-2 bg-blue-50 hover:bg-blue-100 hover:duration-700 rounded-xl py-6 cursor-pointer border-2 border-dashed border-slate-300 flex items-center justify-center gap-4"
        >
          <AddClientIcon />
          <p className="text-lg font-medium text-slate-600">
            {tc('addClientDirect')}
          </p>
          <FaPlus size={30} color="#4367B4" />
        </div>
          <TextInput
            leftSection={<IoSearchOutline />}
            radius={10}
            className="!bg-slate-50"
            size="md"
            placeholder={tc('searchByNameOrPhoneNumber')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />

          <div className="mt-4 max-h-[70vh] overflow-y-auto">
            <p className="text-lg font-medium mb-2">{tc('selectClient')}</p>
            {clientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <Skeleton height={20} width="60%" mb="xs" />
                        <Skeleton height={16} width="40%" />
                      </div>
                      <Skeleton height={16} width="30%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredClients?.map((client) => (
                <div
                  key={client._id}
                  className={`p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 mb-2 ${selectedClient?._id === client._id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : tc('notFilledYet')}</p>
                      <p className="text-sm text-slate-500">{client.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {/* Registration Status Badge */}
                      {client.registrationStatus === 'registered' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          📱 {tc('appUser')}
                        </span>
                      ) : client.registrationStatus === 'pending' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          ⏳ {tc('invitationPending')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          📞 {tc('walkInOrPhone')}
                        </span>
                      )}
                      {/* No-show warning indicator */}
                      {client.incidentNotes && client.incidentNotes.length > 0 && client.incidentNotes.some(n => n.type === 'no-show') && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                          ⚠️ {tc('hasNoShowHistory')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )))}
          </div>

          {!clientsLoading && filteredClients?.length === 0 && (
            <div className="relative mt-28 flex justify-center">
              <div className="absolute top-16">
                <p className="text-xl text-blue-900 text-center">
                  {tc('noClientsFound')}
                </p>
                <p className="text-center font-light">
                  {tc('noMatchingClientsTryAgain')}
                </p>
              </div>
              <EmptyClientIcon />
            </div>
          )}
        </div>

        <CommonModal
          opened={opened}
          onClose={close}
          content={
            <ClientForm
              onClientAdd={handleAddNewClient}
              onUnregisteredClientAdd={handleAddUnregisteredClient}
            />
          }
        />
        <CommonModal opened={successModalOpened} onClose={closeSuccessModal} content={<SuccessModalContent />} />
      </div>
    </BatchTranslationLoader>
  );
};

export default CreateAppointment;
