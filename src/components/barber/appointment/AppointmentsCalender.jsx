import { Button, Menu, Switch, Radio, Tooltip, Skeleton, Tabs } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import React, { useState, useMemo, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { toast } from "sonner";
import NotifyClient from "./NotifyClient";
import CommonModal from "../../common/CommonModal";
import NoShowPenalty from "./NoShowPenalty";
import ClientNoteIndicator from "./ClientNoteIndicator";
import haircut from "../../../assets/haircut.webp";
import { IoNotificationsOutline } from "react-icons/io5";
import CustomCalendar from "./CustomCalendar";
import { Copy, Check } from "tabler-icons-react";
import { Title, Text, Select, Textarea, CopyButton } from "@mantine/core";
import {
  useGetAppointments,
  useUpdateAppointmentStatus,
  useApplyPenalty,
  useNotifyDelay,
  useUpdateReminderSettings,
  useSendAutomatedReminder,
  useGenerateReviewLink
} from "../../../hooks/useAppointments";
import { useGetClients } from "../../../hooks/useClients";
import { useGetBusiness } from "../../../hooks/useBusiness";
import { useGetStaff } from "../../../hooks/useStaff";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";

const AskForFeedback = ({ onYes, onNo, onContinue, clientName }) => {
  const [choice, setChoice] = useState(null);
  const { tc } = useBatchTranslation();

  const handleYesClick = () => {
    setChoice("yes");
  };

  const handleNoClick = () => {
    setChoice("no");
  };

  const handleContinue = () => {
    if (choice === "yes") {
      onYes();
    } else if (choice === "no") {
      onNo();
    } else {
      onContinue();
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">{tc('askForFeedbackTrigger')}</h2>

      <p className="text-xs text-center mb-5">
        {tc('sendReviewRequestToClient', { clientName: clientName || tc('client') })}
      </p>

      <div className="flex justify-center gap-6 mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="feedback-choice"
            className="h-5 w-5"
            checked={choice === "yes"}
            onChange={handleYesClick}
          />
          <span className="ml-2 text-lg">{tc('yes')}</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="feedback-choice"
            className="h-5 w-5"
            checked={choice === "no"}
            onChange={handleNoClick}
          />
          <span className="ml-2 text-lg">{tc('no')}</span>
        </label>
      </div>

      <Button
        fullWidth
        size="md"
        color="dark"
        onClick={handleContinue}
        className="bg-gray-800"
        radius="md"
      >
        {tc('confirm')}
      </Button>
    </div>
  );
};

const AutomatedReminders = ({ onClose, onSave }) => {
  const { tc } = useBatchTranslation();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("1 hour");
  const [customMessage, setCustomMessage] = useState("");

  const handleSave = () => {
    onSave({ enabled: remindersEnabled, time: reminderTime, message: customMessage });
    onClose();
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-3xl font-bold text-[#323334] mb-2 md:mb-4">{tc('automatedAppointmentReminders')}</h2>
      <p className="text-sm md:text-md text-gray-700 mb-5">
        {tc('setupSmsReminders')}
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm mb-5 w-full md:w-[80%]">
        <div className="flex justify-between items-center">
          <p className="text-lg md:text-xl text-[#323334] font-medium">
            {tc('appointmentReminders')}
          </p>
          <Switch
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.currentTarget.checked)}
            size="md"
            color="#556B2F"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm mb-6">
        <p className="text-lg md:text-xl text-[#323334] font-medium mb-4 md:mb-6">
          {tc('remindersTime')}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-8">
          {["1 hour", "2 hour", "3 hour", "4 hour"].map((time, i) => (
            <label
              key={i}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Radio
                name="reminder"
                label={tc(time.replace(' ', '') + 'Before')}
                color="#556B2F"
                size="md"
                checked={reminderTime === time}
                onChange={() => setReminderTime(time)}
                styles={{
                  radio: { cursor: 'pointer' },
                  label: { fontSize: '16px', paddingLeft: '8px' }
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm mb-6">
        <p className="text-lg md:text-xl text-[#323334] font-medium mb-4">
          {tc('customComment')}
        </p>
        <Textarea
          placeholder={tc('addYourCustomCommentHere')}
          value={customMessage}
          onChange={(event) => setCustomMessage(event.currentTarget.value)}
          minRows={4}
          styles={{
            input: {
              border: '1px solid #E4E9F2',
              borderRadius: '10px',
              padding: '10px',
              height: '80px',
              backgroundColor: '#F8F8F8'
            },
          }}
        />
      </div>

      <div className="hidden md:flex justify-between gap-4 absolute bottom-2 right-10">
        <Button
          variant="default"
          size="md"
          w="120px"
          onClick={onClose}
          className=" !bg-[#e0e0e0] !text-gray-600 !border-0 !text-sm hover:!bg-[#d5d5d5]"
          radius="md"
        >
          {tc('cancel')}
        </Button>
        <Button
          size="md"
          w="120px"
          onClick={handleSave}
          className=" !bg-[#323334] !text-white !text-sm hover:!bg-[#212121]"
          radius="md"
        >
          {tc('save')}
        </Button>
      </div>

      <div className="flex md:hidden justify-end gap-4 pt-4">
        <Button
          variant="default"
          size="md"
          onClick={onClose}
          className=" !bg-[#e0e0e0] !text-gray-600 !border-0 !text-sm hover:!bg-[#d5d5d5]"
          radius="md"
        >
          {tc('cancel')}
        </Button>
        <Button
          size="md"
          onClick={handleSave}
          className=" !bg-[#323334] !text-white !text-sm hover:!bg-[#212121]"
          radius="md"
        >
          {tc('save')}
        </Button>
      </div>
    </div>
  );
};

const AppointmentsCalender = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [penaltyModalOpened, { open: openPenaltyModal, close: closePenaltyModal }] = useDisclosure(false);
  const [feedbackModalOpened, { open: openFeedbackModal, close: closeFeedbackModal }] = useDisclosure(false);
  const [remindersModalOpened, { open: openRemindersModal, close: closeRemindersModal }] = useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReviewLinkModal, setShowReviewLinkModal] = useState(false);

  // Staff tab selection: 'all' for General Agenda, or staffId for individual barber
  const [selectedStaffTab, setSelectedStaffTab] = useState('all');

  // API hooks
  const updateAppointmentStatus = useUpdateAppointmentStatus({ showToast: false });
  const applyPenalty = useApplyPenalty();
  const notifyDelay = useNotifyDelay();
  const updateReminderSettings = useUpdateReminderSettings();
  const sendAutomatedReminder = useSendAutomatedReminder();
  const generateReviewLink = useGenerateReviewLink();
  const { data: businessData } = useGetBusiness();
  const { data: staffData } = useGetStaff();
  const staff = staffData?.data?.data?.staff || [];

  // Compute effective staff filter based on selected tab
  const effectiveStaffFilter = useMemo(() => {
    return selectedStaffTab === 'all' ? 'all' : selectedStaffTab;
  }, [selectedStaffTab]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDateStr = formatDate(selectedDate);

  // Fetch appointments for the selected date with staff filter
  const { data: appointmentsData, isLoading, error } = useGetAppointments({
    date: currentDateStr,
    staffId: effectiveStaffFilter,
    page: 1,
    limit: 50
  });

  // Debug logging for received data
  useEffect(() => {
    // console.log('Received appointments data:', appointmentsData);
  }, [appointmentsData]);

  // Transform API data to calendar events format
  const calendarEvents = useMemo(() => {

    // Check multiple possible data structures
    let appointments = null;
    if (appointmentsData?.data?.appointments) {
      appointments = appointmentsData.data.appointments;
    } else if (appointmentsData?.appointments) {
      appointments = appointmentsData.appointments;
    } else if (Array.isArray(appointmentsData?.data)) {
      appointments = appointmentsData.data;
    }

    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return [];
    }

    return appointments.map((appointment) => {

      try {
        // Validate required fields
        if (!appointment._id || !appointment.date || !appointment.startTime) {
          return null;
        }

        // Build a local date for the intended appointment day to avoid timezone shifts
        const parseLocalDateFromValue = (val) => {
          if (!val) return null;
          if (typeof val === 'string') {
            const datePart = val.split('T')[0];
            const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(datePart);
            if (ymdMatch) {
              const [y, m, d] = datePart.split('-').map(Number);
              return new Date(y, m - 1, d);
            }
          }
          const d = new Date(val);
          if (isNaN(d)) return null;
          // Use UTC components to construct local date to neutralize Z offset
          return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        };

        const baseDate = parseLocalDateFromValue(appointment.date);
        const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
        if (!baseDate || Number.isNaN(startHour) || Number.isNaN(startMinute)) {
          return null;
        }
        const startTime = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          startHour,
          startMinute,
          0,
          0
        );

        // Handle duration - it can be a number (minutes) or an object with hours/minutes
        let durationMinutes = 60; // default
        if (appointment.duration && typeof appointment.duration === 'number') {
          durationMinutes = appointment.duration;
        } else if (appointment.service?.duration) {
          if (typeof appointment.service.duration === 'number') {
            durationMinutes = appointment.service.duration;
          } else if (typeof appointment.service.duration === 'object') {
            durationMinutes = (appointment.service.duration.hours || 0) * 60 + (appointment.service.duration.minutes || 0);
          }
        }

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + durationMinutes);



        // Handle client name safely
        let clientName = tc('unknownClient');
        if (appointment.client) {
          const firstName = appointment.client.firstName || '';
          const lastName = appointment.client.lastName || '';
          clientName = `${firstName} ${lastName}`.trim() || tc('unknownClient');
        }

        const event = {
          id: appointment._id,
          title: clientName,
          start: startTime,
          end: endTime,
          extendedProps: {
            status: appointment.status?.toLowerCase() || 'pending',
            type: appointment.serviceName || appointment.service?.name || tc('appointmentService'),
            serviceName: appointment.serviceName || appointment.service?.name || tc('appointmentService'),
            staffName: appointment.staff ? `${appointment.staff.firstName || ''} ${appointment.staff.lastName || ''}`.trim() : null,
            clientId: appointment.client?._id,
            appointmentId: appointment._id,
            hasNote: !!appointment.clientNotes,
            duration: durationMinutes,
            price: appointment.service?.price || appointment.price,
            notes: appointment.notes,
            clientNotes: appointment.clientNotes,
            // Client registration status for visual differentiation
            clientRegistrationStatus: appointment.client?.registrationStatus || 'unregistered',
            clientIncidentNotes: appointment.client?.incidentNotes || [],
            // Pass reference photos array so the calendar suggestion modal can show them
            referencePhotos: Array.isArray(appointment.referencePhotos) ? appointment.referencePhotos : [],
            // Discount information
            promotion: appointment.promotion || { applied: false, originalPrice: 0, discountAmount: 0, discountPercentage: 0 },
            flashSale: appointment.flashSale || { applied: false, originalPrice: 0, discountAmount: 0, discountPercentage: 0 },
            penalty: appointment.penalty || { applied: false, amount: 0, paid: false },
            delay: appointment.delay || { notified: false, message: '', newDate: null, newStartTime: null },
            paymentStatus: appointment.paymentStatus || 'Pending'
          },
        };

        return event;
      } catch (error) {
        return null;
      }
    }).filter(Boolean); // Remove null entries
  }, [appointmentsData]);

  const handleNotificationSent = async (selectedClients, message, notificationDate) => {
    try {
      let successCount = 0;
      let failureCount = 0;

      // Get appointments for the notification date
      const dateStr = formatDate(notificationDate);

      // Send notification for each selected client
      for (const client of selectedClients) {
        // Get appointment ID directly from client data (passed from NotifyClient)
        const appointmentId = client.appointmentId;

        // Validate appointment ID format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(appointmentId);

        if (!isValidObjectId) {
          console.error('Invalid appointment ID:', appointmentId, 'for client:', client.id);
          failureCount++;
          continue;
        }

        // Personalize message with client name
        const personalizedMessage = message.replace(/\{clientName\}/g, client.name);

        const delayData = {
          newDate: dateStr,
          newStartTime: client.appointmentTime || '',
          message: personalizedMessage
        };

        try {
          await notifyDelay.mutateAsync({
            id: appointmentId,
            delayData
          });
          successCount++;
        } catch (error) {
          console.error('Failed to send notification:', error);
          failureCount++;
        }
      }

      // Show appropriate success/error messages
      if (successCount > 0 && failureCount === 0) {
        toast.success(tc('notificationsSentSuccessfully').replace('{count}', successCount));
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(tc('notificationsPartiallySent').replace('{success}', successCount).replace('{failure}', failureCount));
      } else {
        toast.error(tc('failedToSendNotifications'));
      }
    } catch (error) {
      console.error('handleNotificationSent error:', error);
      toast.error(tc('failedToSendNotifications'));
    }

    close();
  };

  const handleMarkNoShow = (client) =>
  {
    setSelectedClient(client);
    openPenaltyModal();
  };

  const handlePenaltySubmitted = async (penaltyData) => {
    try {
      if (selectedClient?.appointmentId) {
        // First update the appointment status to Missed (required by backend)
        // Also pass incidentNote if provided - this will be saved to client's profile
        await updateAppointmentStatus.mutateAsync({
          id: selectedClient.appointmentId,
          status: 'No-Show',
          incidentNote: penaltyData.incidentNote,
          blockClient: penaltyData.blockClient
        });

        // Then apply penalty if provided
        // Note: Backend currently only supports money penalties (amount field)
        // Filter out time and type fields if penalty type is 'money'
        if (penaltyData.type === 'money' && penaltyData.amount > 0) {
          // Only send amount for money penalties
          await applyPenalty.mutateAsync({
            id: selectedClient.appointmentId,
            penaltyData: {
              amount: penaltyData.amount,
              comment: penaltyData.comment
            }
          });
        } else if (penaltyData.type === 'time') {
          // Time-based penalties not yet supported by backend
          // Show error or implement time-based penalty logic here
          toast.error(tc('timeBasedPenaltiesNotSupported'));
        }
      }
    } catch (error) {
      // Error handled silently
    }

    closePenaltyModal();
  };

  const handleMarkAsCompleted = (client) => {
    setSelectedClient(client);
    openFeedbackModal();
  };

  const handleFeedbackYes = async () => {
    try {
      if (selectedClient?.appointmentId) {
        // Create review message with business name and Google review link
        const businessName = businessData?.data?.businessName || businessData?.data?.name || tc('ourBusiness');
        const googlePlaceId = businessData?.data?.googlePlaceId;
        const googleReviewUrl = businessData?.data?.googleReviewUrl;
        
        if (googlePlaceId) {
          link = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
        } else if (googleReviewUrl) {
          link = googleReviewUrl;
        } else {
          link = `https://www.google.com/search?q=${encodeURIComponent(businessName + " " + tc('reviews'))}`;
        }

        const reviewMessage = tc('thankYouForVisiting').replace('{businessName}', businessName).replace('{link}', link);

        const response = await updateAppointmentStatus.mutateAsync({
          id: selectedClient.appointmentId,
          status: 'Completed',
          reviewRequest: true,
          reviewMessage: reviewMessage
        });

        // Check if the review request was actually sent
        // Note: response structure is { success: true, data: appointment }
        const appointment = response?.data || response;
        if (appointment?.reviewRequest?.sent) {
          toast.success(tc('appointmentCompletedAndReviewSent'));
        } else {
          toast.success(tc('appointmentCompletedSuccessfully'));

          // Display backend error message if available
          if (appointment?.reviewRequest?.errorMessage) {
            toast.error(`${tc('messageNotSentError')} ${appointment.reviewRequest.errorMessage}`);
          } else if (appointment?.reviewRequest?.error) {
            // Fallback to error code if no errorMessage
            toast.error(`${tc('messageNotSentError')} ${appointment.reviewRequest.error}`);
          } else {
            // Fallback to frontend check if no backend error info
            const currentSmsCredits = businessData?.data?.smsCredits ?? businessData?.smsCredits ?? 0;
            if (currentSmsCredits === 0) {
              toast.warning(tc('reviewRequestNoCredits'));
            } else {
              toast.warning(tc('reviewRequestFailed'));
            }
          }
        }
      }
    } catch (error) {
      toast.error(tc('failedToCompleteAppointment'));
    }

    closeFeedbackModal();
  };

  const handleFeedbackNo = async () => {
    try {
      if (selectedClient?.appointmentId) {
        await updateAppointmentStatus.mutateAsync({
          id: selectedClient.appointmentId,
          status: 'Completed'
          // No reviewRequest parameter - won't send review SMS
        });

        toast.success(tc('appointmentCompletedSuccessfully'));
      }
    } catch (error) {
      toast.error(tc('failedToCompleteAppointment'));
    }

    closeFeedbackModal();
  };

  const handleFeedbackContinue = () => {
    closeFeedbackModal();
  };

  const handleMarkNoteAsRead = (clientId) => {
    // TODO: Implement mark note as read functionality
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleRemindersSettingsSaved = async (settings) => {
    try {
      // Send automated reminder with the settings
      await sendAutomatedReminder.mutateAsync({
        appointmentReminder: settings.enabled,
        reminderTime: settings.time.replace(' ', '_') + '_before' // Convert "1 hour" to "1_hour_before"
      });

      // If there are specific appointments selected, update their reminder settings
      if (selectedClient?.appointmentId) {
        await updateReminderSettings.mutateAsync({
          id: selectedClient.appointmentId,
          reminderData: {
            reminderTime: settings.time.replace(' ', '_') + '_before',
            appointmentReminder: settings.enabled
          }
        });
      }
    } catch (error) {
      // Error handled silently
    }

    closeRemindersModal();
  };

  const ReviewLinkModalContent = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [message, setMessage] = useState(tc('defaultReviewMessage'));

    // Fetch all clients directly using the same hook as ClientManagement
    const { data: clientsData, isLoading: clientsLoading } = useGetClients();

    // Extract clients from API response
    const clients = useMemo(() => {
      if (!clientsData?.clients) return [];

      return clientsData.clients.map(client => {
        const firstName = client.firstName || '';
        const lastName = client.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          value: client._id,
          label: fullName || tc('notFilledYet')
        };
      });
    }, [clientsData]);

    // Update message when client is selected
    React.useEffect(() => {
      if (selectedClient && clients.length > 0) {
        const selectedClientData = clients.find(client => client.value === selectedClient);
        const clientName = selectedClientData?.label || tc('client');
        const defaultMessage = tc('defaultReviewMessage');
        setMessage(defaultMessage.replace('{clientName}', clientName));
      } else {
        setMessage(tc('defaultReviewMessage'));
      }
    }, [selectedClient, clients]);

    const [selectOpen, setSelectOpen] = useState(false);
    const [selectDisabled, setSelectDisabled] = useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setSelectDisabled(false);
      }, 300);
      return () => clearTimeout(timer);
    }, []);

    const handleGenerateLink = async () => {
      try {
        if (!selectedClient) {
          toast.error(tc('pleaseSelectClientFirst'));
          return;
        }

        // Validate ObjectId format (24 character hex string)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedClient);
        if (!isValidObjectId) {
          toast.error(tc('invalidClientIdFormat'));
          return;
        }

        const result = await generateReviewLink.mutateAsync({
          clientId: selectedClient,
          message: message
        });

        // Show success message - SMS was sent automatically
        if (result?.data?.smsSent) {
          toast.success(tc('reviewRequestSentSuccessfully'));
        } else {
          toast.success(tc('reviewLinkGeneratedButSmsNotSent'));
        }

        setShowReviewLinkModal(false);
      } catch (error) {
        // Show specific error message from backend
        const errorMessage = error?.response?.data?.message || tc('failedToGenerateReviewLink');
        toast.error(errorMessage);
      }
    };

    return (
      <div className="p-6 sm:p-8">
        <Title className="!text-left !text-2xl !font-semibold !mb-2 font-['Outfit',Helvetica]">{tc('sendAReviewRequest')}</Title>
        <Text className="!text-gray-600 !text-left !text-sm !mb-8 font-['Outfit',Helvetica]">
          {tc('sendReviewRequestViaSmsDescription')}
        </Text>

        <div className="mb-6">
          <Text className="!text-left !font-medium !mb-3 font-['Outfit',Helvetica]">{tc('selectClient')}</Text>
          <Select
            placeholder={clientsLoading ? tc('loadingClients') : tc('selectClient')}
            data={clients}
            value={selectedClient}
            onChange={setSelectedClient}
            searchable
            clearable
            disabled={selectDisabled || clientsLoading}
            initiallyOpened={false}
            opened={selectOpen}
            onDropdownOpen={() => setSelectOpen(true)}
            onDropdownClose={() => setSelectOpen(false)}
            closeDropdownOnScroll={true}
            withinPortal={true}
            dropdownPosition="bottom"
            clickOutsideEvents={['mouseup', 'touchend']}
            className="w-full"
            styles={{
              dropdown: { maxHeight: 200, zIndex: 1000 },
              root: { zIndex: 1 }
            }}
          />
        </div>

        <div className="mb-8">
          <Text className="!text-left !font-medium !mb-3 font-['Outfit',Helvetica]">{tc('writeMessage')}</Text>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minRows={6}
            className="w-full"
            styles={{
              input: {
                border: '1px solid #E4E9F2',
                borderRadius: '10px',
                padding: '10px',
                height: '100px',
              },
            }}
          />
        </div>

        <Button
          fullWidth
          onClick={handleGenerateLink}
          size="lg"
          loading={generateReviewLink.isPending}
          disabled={generateReviewLink.isPending}
          className="!bg-gray-800 !text-white !rounded-md !font-medium !mt-16 !h-[40px] !text-base"
        >
          {generateReviewLink.isPending ? tc('sending') : tc('sendReviewRequest')}
        </Button>
      </div>
    );
  };

  const isApiLoading = isLoading ||
    updateAppointmentStatus.isPending ||
    applyPenalty.isPending ||
    notifyDelay.isPending ||
    updateReminderSettings.isPending ||
    sendAutomatedReminder.isPending ||
    generateReviewLink.isPending;

  // Calendar skeleton component
  const CalendarSkeleton = () => (
    <div className="border border-gray-200 rounded">
      {/* Header skeleton */}
      <div className="grid grid-cols-9 border-b">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="py-3 bg-[#2A2A2A] border-r border-gray-700">
            <Skeleton height={20} width="60%" mx="auto" />
          </div>
        ))}
      </div>

      {/* Calendar body skeleton */}
      <div className="relative" style={{ height: '480px' }}>
        <div className="grid grid-cols-9 h-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-full border-r border-dashed border-gray-300 p-2">
              {/* Event skeletons */}
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
                <div key={j} className="mb-2">
                  <Skeleton height={100} radius="md" mb="xs" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="p-3">
        <p className="text-2xl font-medium" data-translated="true">{tc('makeAnAppointment')}</p>
        <p className="text-sm text-slate-500" data-translated="true">
          {tc('easilyManageClientsBookings')}
        </p>
        {isApiLoading ? (
          <div className="md:flex justify-between items-center my-2">
            <Skeleton height={40} width={200} radius="md" />
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <Skeleton height={40} width={150} radius="md" />
              <Skeleton height={40} width={130} radius="md" />
              <Skeleton height={40} width={120} radius="md" />
              <Skeleton height={40} width={140} radius="md" />
            </div>
          </div>
        ) : (
          <div className="my-2 gap-4">
            {/* Top row: Date picker and action buttons */}
            <div className="md:flex justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <DateInput
                  placeholder={tc('selectDate')}
                  size="md"
                  radius="md"
                  leftSection={<FaCalendarAlt color="#323334" />}
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Tooltip label={tc('generateReviewLinkTooltip')}>
                  <Button
                    onClick={() => setShowReviewLinkModal(true)}
                    variant="outline"
                    size="md"
                    radius="md"
                    color="#323334"
                    className="whitespace-nowrap mt-4"
                    data-translated="true"
                  >
                    {tc('generateReviewLink')}
                  </Button>
                </Tooltip>

                <Tooltip label={tc('notifyClientsTooltip')}>
                  <Button
                    onClick={open}
                    variant="outline"
                    size="md"
                    radius="md"
                    color="#323334"
                    className="whitespace-nowrap mt-4"
                    data-translated="true"
                  >
                    {tc('notifyClients')}
                  </Button>
                </Tooltip>

                <Link to={"/dashboard/create-appointment"}>
                  <Tooltip label={tc('newAppointmentTooltip')}>
                    <Button
                      size="md"
                      radius="md"
                      color="#323334"
                      className="whitespace-nowrap mt-4"
                      data-translated="true"
                    >
                      {tc('newAppointment')}
                    </Button>
                  </Tooltip>
                </Link>
              </div>
            </div>

            {/* Staff/Barber Tabs - Shows "General Agenda" + individual barber names */}
            <div className="mt-4">
              <Tabs
                value={selectedStaffTab}
                onChange={setSelectedStaffTab}
                variant="pills"
                radius="md"
                styles={{
                  root: {
                    overflowX: 'auto',
                  },
                  list: {
                    flexWrap: 'nowrap',
                    gap: '8px',
                    paddingBottom: '4px',
                  },
                  tab: {
                    fontWeight: 500,
                    fontSize: '14px',
                    padding: '8px 16px',
                    border: '1px solid #e4e4e4',
                    '&[dataActive]': {
                      backgroundColor: '#323334',
                      color: 'white',
                      borderColor: '#323334',
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="all">
                    {tc('generalAgenda') || 'General Agenda'}
                  </Tabs.Tab>
                  {staff.map((s) => (
                    <Tabs.Tab key={s._id} value={s._id}>
                      {`${s.firstName || ''} ${s.lastName || ''}`.trim() || tc('unnamed')}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            </div>
          </div>
        )}

        <CommonModal
          opened={showReviewLinkModal}
          onClose={() => setShowReviewLinkModal(false)}
          content={<ReviewLinkModalContent />}
          size="lg"
          styles={{
            content: {
              borderRadius: '30px',
              border: '1px solid rgba(228, 233, 242, 0.5)',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
              padding: 0,
              minHeight: '500px',
              width: '90%',
              maxWidth: '600px'
            }
          }}
        />

        <CommonModal
          opened={opened}
          onClose={close}
          content={<NotifyClient close={close} onSubmit={handleNotificationSent} />}
          size="xl"
          styles={{
            body: { padding: 0 },
            content: {
              borderRadius: '16px',
              minHeight: '650px'
            }
          }}
        />

        <CommonModal
          opened={penaltyModalOpened}
          onClose={closePenaltyModal}
          content={<NoShowPenalty close={closePenaltyModal} onSubmit={handlePenaltySubmitted} clientName={selectedClient?.title} incidentNotes={selectedClient?.incidentNotes} serviceName={selectedClient?.serviceName} registrationStatus={selectedClient?.registrationStatus} />}
        />

        <CommonModal
          opened={feedbackModalOpened}
          onClose={closeFeedbackModal}
          content={<AskForFeedback
            onYes={handleFeedbackYes}
            onNo={handleFeedbackNo}
            onContinue={handleFeedbackContinue}
            clientName={selectedClient?.title}
          />}
        />

        <CommonModal
          opened={remindersModalOpened}
          onClose={closeRemindersModal}
          content={<AutomatedReminders onClose={closeRemindersModal} onSave={handleRemindersSettingsSaved} />}
          size="xl"
          styles={{
            body: { padding: 0 },
            content: {
              borderRadius: '16px',
              minHeight: '650px',
              minWidth: '700px'
            }
          }}
        />
      </div>
      <div className="w-full">
        {isApiLoading ? (
          <CalendarSkeleton />
        ) : (
          <CustomCalendar
            selectedDate={selectedDate}
            events={calendarEvents}
            onMarkAsCompleted={handleMarkAsCompleted}
            onMarkAsNoShow={handleMarkNoShow}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentsCalender;
