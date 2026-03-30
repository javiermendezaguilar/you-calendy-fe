import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Radio, Switch, Textarea } from "@mantine/core";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useBulkUpdateReminderSettings, useGetReminderSettings } from "../../hooks/useAppointments";

const AutomatedReminders = () => {
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("1 hour");
  const [smsMessage, setSmsMessage] = useState("Reminder: You have an appointment at the barbershop in 1 hour.");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const bulkUpdateReminderSettings = useBulkUpdateReminderSettings();
  const { data: reminderSettingsData, isLoading: isLoadingSettings } = useGetReminderSettings();

  // Load existing settings when component mounts
  useEffect(() => {
    if (reminderSettingsData?.data && isInitialLoad) {
      const settings = reminderSettingsData.data;
      
      // Set reminder enabled status
      const isEnabled = settings.appointmentReminder || false;
      setRemindersEnabled(isEnabled);
      
      // Convert reminderTime from "1_hour_before" to "1 hour" format
      let timeDisplay = "1 hour";
      if (settings.reminderTime) {
        const timeMatch = settings.reminderTime.match(/(\d+)_(hour|hours)_before/);
        if (timeMatch) {
          const hourValue = timeMatch[1];
          timeDisplay = `${hourValue} hour`;
          setReminderTime(timeDisplay);
        }
      } else {
        setReminderTime(timeDisplay);
      }
      
      // Set message if it exists, otherwise use default
      if (settings.messageReminder) {
        setSmsMessage(settings.messageReminder);
      }
      
      setIsInitialLoad(false);
    }
  }, [reminderSettingsData, isInitialLoad]);

  // Update message when reminder time changes (only after initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      // Replace any existing reminder time in the message with the new one
      // Match patterns like "in 1 hour", "1 hour before", "in 2 hours", etc.
      const timePattern = /(in\s+)?\d+\s*(hour|hours)(\s+before)?/gi;
      setSmsMessage(prev => {
        if (prev.match(timePattern)) {
          // Replace the entire matched pattern with the new reminder time
          return prev.replace(timePattern, `in ${reminderTime}`);
        } else {
          // If no reminder time found, add it at the end
          const trimmed = prev.trim().replace(/\.$/, '');
          return `${trimmed} in ${reminderTime}.`;
        }
      });
    }
  }, [reminderTime, isInitialLoad]);


  const handleSave = async () => {
    try {
      // Prepare update data
      const updateData = {
        appointmentReminder: remindersEnabled,
      };

      // Only include reminderTime and messageReminder if reminders are enabled
      if (remindersEnabled) {
        // Convert reminder time from "1 hour" to "1_hour_before" format
        // Note: API expects "1_hour_before" but "2_hours_before" (plural for 2+)
        const hourValue = reminderTime.split(' ')[0];
        const isPlural = parseInt(hourValue) > 1;
        const reminderTimeFormatted = `${hourValue}_${isPlural ? 'hours' : 'hour'}_before`;
        
        updateData.reminderTime = reminderTimeFormatted;
        updateData.messageReminder = smsMessage;
      } else {
        // When disabling, clear reminder time
        updateData.reminderTime = null;
        updateData.messageReminder = "";
      }
      
      // Bulk update all future appointments with reminder settings
      await bulkUpdateReminderSettings.mutateAsync(updateData);

      // Navigate back after successful save
      navigate(-1);
    } catch (error) {
      // Error is already handled by the hook's onError callback
      console.error('Error updating reminder settings:', error);
    }
  };

  return (
    <BatchTranslationLoader>
      <main className="h-[83vh] overflow-auto bg-white mx-auto p-6 rounded-[18px] max-md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 sm:gap-0 max-md:mb-6">
          <Link to={-1} className="flex w-auto">
            <Button
              size="lg"
              className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:size-md max-md:!text-sm max-md:!py-2 max-md:!px-4"
            >
              <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
            </Button>
          </Link>

          <Button 
            color="#323334" 
            size="md" 
            px={50} 
            radius={10}
            className="max-md:w-full max-md:px-4"
            onClick={handleSave}
            loading={bulkUpdateReminderSettings.isPending}
            disabled={bulkUpdateReminderSettings.isPending}
          >
            {tc('save')}
          </Button>
        </div>

        <h2 className="text-2xl font-medium text-[#323334] mb-8 max-md:text-xl max-md:mb-4">
          {tc('automatedAppointmentReminders')}
        </h2>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0px_14px_32.2px_0px_#E9EEF059] mb-6 w-1/3 max-md:p-4 max-md:mb-4 max-lg:w-1/2 max-md:w-2/3 max-sm:w-full">
        <div className="flex justify-between items-center">
          <p className="text-[#323334] font-medium text-lg max-md:text-base">
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

      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-[0px_14px_32.2px_0px_#E9EEF059] w-full max-w-3xl mb-6 max-md:p-4">
        <p className="text-[#323334] font-medium mb-6 text-lg max-md:text-base max-md:mb-4">
          {tc('remindersTime')}
        </p>

        <div className="flex flex-wrap gap-4 max-md:grid max-md:grid-cols-2 max-md:gap-3">
          {["1 hour", "2 hour", "3 hour", "4 hour"].map((time, i) => (
            <label
              key={i}
              className="flex items-center gap-2 cursor-pointer mb-0 max-md:mb-2"
            >
              <Radio
                name="reminder"
                label={time + " before"}
                color="#556B2F"
                size="md"
                variant="outline"
                checked={reminderTime === time}
                onChange={() => setReminderTime(time)}
              />
            </label>
          ))}
        </div>
      </div>

       {remindersEnabled && (
         <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-[0px_14px_32.2px_0px_#E9EEF059] w-full max-w-3xl max-md:p-4">
           <p className="text-[#323334] font-medium mb-6 text-lg max-md:text-base max-md:mb-4">
             {tc('smsMessageTemplate')}
           </p>
           <p className="text-gray-500 text-sm mb-3">
             {tc('smsMessageTemplateDescription')} The reminder time will be automatically included in the message.
           </p>
           <Textarea
             value={smsMessage}
             onChange={(e) => setSmsMessage(e.currentTarget.value)}
             placeholder={tc('smsMessagePlaceholder')}
             minRows={3}
             maxRows={5}
             className="w-full"
           />
         </div>
       )}
    </main>
    </BatchTranslationLoader>
  );
};

export default AutomatedReminders;
