import { Button, Textarea, Checkbox, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState, useMemo } from "react";
import { DateInput } from "@mantine/dates";
import { FaCalendarAlt } from "react-icons/fa";
import { useGetAppointments } from "../../../hooks/useAppointments";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";
import dayjs from "dayjs";

const PRESET_MESSAGES = {
  runningLate: {
    key: 'runningLate',
    label: 'runningLate',
  },
  aheadOfSchedule: {
    key: 'aheadOfSchedule',
    label: 'aheadOfSchedule',
  },
  cancelDay: {
    key: 'cancelDay',
    label: 'cancelDay',
  }
};

const NotifyClient = ({ close, onSubmit }) => {
  const { tc, currentLanguage } = useBatchTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  
  // Fetch appointments for the selected date
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointments({
    date: dayjs(selectedDate).format('YYYY-MM-DD'),
    page: 1,
    limit: 100
  });
  
  // Extract clients who have appointments on the selected date
  const clientsWithAppointments = useMemo(() => {
    if (!appointmentsData?.data?.appointments) return [];
    
    const appointments = appointmentsData.data.appointments;
    const uniqueClients = new Map();
    
    appointments.forEach(appointment => {
      if (appointment.client && appointment.client._id) {
        const clientId = appointment.client._id;
        // Include appointment ID so we can send notification directly
        const clientData = {
          id: clientId,
          name: `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() || tc('unnamedClient'),
          email: appointment.client.email,
          phone: appointment.client.phone,
          appointmentId: appointment._id,
          appointmentTime: appointment.startTime,
          appointmentService: appointment.service?.name || tc('appointmentService'),
          selected: false
        };
        
        // If client has multiple appointments, prefer the one with matching selected date
        if (!uniqueClients.has(clientId)) {
          uniqueClients.set(clientId, clientData);
        }
      }
    });
    
    return Array.from(uniqueClients.values());
  }, [appointmentsData]);
  
  const [clients, setClients] = useState([]);
  
  // Update clients when appointments data changes
  React.useEffect(() => {
    setClients(clientsWithAppointments);
    setSelectAll(false);
  }, [clientsWithAppointments]);

  const form = useForm({
    initialValues: { 
      message: "",
    },
    validate: {
      message: (value) =>
        value.length < 3 ? tc('messageMinLength') : null,
    },
  });
  
  // Update message when preset is selected
  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    const preset = PRESET_MESSAGES[presetKey];
    if (preset) {
      form.setFieldValue('message', tc(preset.label + 'PresetMessage'));
    }
  };

  // Update message when language changes if a preset is selected
  React.useEffect(() => {
    if (selectedPreset) {
      const preset = PRESET_MESSAGES[selectedPreset];
      if (preset) {
        form.setFieldValue('message', tc(preset.label + 'PresetMessage'));
      }
    }
  }, [currentLanguage, selectedPreset]); // tc is already stable and depends on currentLanguage/translationsUpdated

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setClients(clients.map(client => ({ ...client, selected: newSelectAll })));
  };

  const toggleClient = (clientId) => {
    const updatedClients = clients.map(client => 
      client.id === clientId ? { ...client, selected: !client.selected } : client
    );
    setClients(updatedClients);
    
    setSelectAll(updatedClients.every(client => client.selected));
  };

  const handleSubmit = (values) => {
    const selectedClients = clients.filter(client => client.selected);
    
    if (selectedClients.length === 0) {
      form.setFieldError('message', tc('selectAtLeastOneClient'));
      return;
    }
    
    // Validate that all selected clients have appointment IDs
    const clientsWithMissingAppointments = selectedClients.filter(c => !c.appointmentId);
    if (clientsWithMissingAppointments.length > 0) {
      form.setFieldError('message', tc('someClientsMissingAppointments'));
      return;
    }
    
    if (onSubmit) {
      onSubmit(selectedClients, values.message, selectedDate);
    } else {
      close();
    }
  };

  const hasAppointments = clients.length > 0;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-[#323334] mb-2 font-['Outfit',Helvetica]">{tc('notifyClients')}</h2>
      <p className="text-gray-700 mb-6 font-['Outfit',Helvetica]">
        {tc('notifyClientsDescription')}
      </p>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-[#323334] mb-3 font-['Outfit',Helvetica]">{tc('selectDate')}</h3>
          <DateInput
            placeholder={tc('selectDate')}
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date || new Date());
              setSelectedPreset(null);
            }}
            leftSection={<FaCalendarAlt color="#323334" />}
            size="md"
            radius="md"
            className="w-full md:w-[300px]"
            classNames={{
              input: '!h-[50px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9]'
            }}
            popoverProps={{
              position: 'left-start',
              withinPortal: true,
              zIndex: 1000
            }}
          />
        </div>

        {/* Preset Messages */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-[#323334] mb-3 font-['Outfit',Helvetica]">{tc('quickMessageTemplates')}</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.values(PRESET_MESSAGES).map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePresetSelect(preset.key)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedPreset === preset.key
                    ? 'border-[#323334] bg-gray-100'
                    : 'border-[#EBEBEB] bg-white hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-[#323334] font-['Outfit',Helvetica]">
                  {preset.key === 'runningLate' && tc('runningLateTitle')}
                  {preset.key === 'aheadOfSchedule' && tc('aheadOfScheduleTitle')}
                  {preset.key === 'cancelDay' && tc('cancelDayTitle')}
                </p>
                <p className="text-sm text-gray-600 mt-1 font-['Outfit',Helvetica]">
                  {preset.key === 'runningLate' && tc('runningLateDescription')}
                  {preset.key === 'aheadOfSchedule' && tc('aheadOfScheduleDescription')}
                  {preset.key === 'cancelDay' && tc('cancelDayDescription')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Clients List */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-[#323334] mb-3 font-['Outfit',Helvetica]">
            {tc('clientsWithAppointments')} ({clients.length})
          </h3>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center bg-[#323334] text-white p-4">
              <div className="w-8">
                <Checkbox
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  color="#556B2F"
                  radius="sm"
                  disabled={!hasAppointments}
                />
              </div>
              <div className="flex-1">
                <span className="font-medium font-['Outfit',Helvetica]">{tc('clientName')}</span>
              </div>
              <div className="w-1/3 text-right hidden md:block">
                <span className="font-medium font-['Outfit',Helvetica]">{tc('appointmentTime')}</span>
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-[250px] overflow-y-auto">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <span className="text-gray-500 font-['Outfit',Helvetica]">{tc('loadingAppointments')}</span>
                </div>
              ) : !hasAppointments ? (
                <div className="flex items-center justify-center p-8">
                  <span className="text-gray-500 font-['Outfit',Helvetica] text-center">
                    {tc('noAppointmentsForDate')}
                  </span>
                </div>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                    <div className="w-8">
                      <Checkbox
                        checked={client.selected}
                        onChange={() => toggleClient(client.id)}
                        color="#556B2F"
                        radius="sm"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <span className="text-gray-800 font-medium font-['Outfit',Helvetica]">{client.name}</span>
                      <br />
                      <span className="text-gray-500 text-sm font-['Outfit',Helvetica]">{client.appointmentService}</span>
                    </div>
                    <div className="w-1/3 text-right hidden md:block">
                      <span className="text-gray-800 font-['Outfit',Helvetica]">{client.appointmentTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-[#323334] mb-3 font-['Outfit',Helvetica]">{tc('writeYourMessage')}</h3>
          <Textarea
            placeholder={tc('writeYourMessageHere')}
            maxRows={10}
            minRows={6}
            autosize
            radius="md"
            className="!w-full"
            style={{ minHeight: "150px", color: "#f0f0f0" }}
            {...form.getInputProps("message")}
          />
          <p className="text-xs text-gray-500 mt-2 font-['Outfit',Helvetica]">
            {tc('messagePersonalizationHint')}
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <Button
            variant="default"
            size="md"
            onClick={close}
            className="!bg-[#e0e0e0] !text-gray-600 !border-0 !hover:!bg-[#d5d5d5]"
            radius="md"
          >
            {tc('cancel')}
          </Button>
          <Button
            type="submit"
            size="md"
            className="!bg-[#323334] !text-white !hover:!bg-[#212121]"
            radius="md"
            disabled={!hasAppointments}
          >
            {tc('sendMessage')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NotifyClient;
