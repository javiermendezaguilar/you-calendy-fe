import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  USFlagIcon,
  StafferArrowIcon,
  CheckmarkIcon,
} from "../../components/common/Svgs";
import {
  Button,
  TextInput,
  Checkbox,
  Group,
  Box,
  Title,
  Text,
  Container,
  MultiSelect,
  LoadingOverlay,
  SimpleGrid,
  Skeleton,
  Select,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useUpdateStaff, useGetStaffById } from "../../hooks/useStaff";
import { useGetBusiness } from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import TimeIntervalSelector from "../../components/common/TimeIntervalSelector";
import BookingBufferSelector from "../../components/common/BookingBufferSelector";

const EditStaffMember = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: staffId } = useParams();
  const staffMemberFromState = location.state?.staffData;
  

  const { mutate: updateStaff, isPending } = useUpdateStaff(staffId);
  const { data: businessData, isLoading: isBusinessLoading } = useGetBusiness();
  
  // Use useGetStaffById as fallback when location.state is not available
  const { data: staffApiData, isLoading: isStaffLoading } = useGetStaffById(staffId);
  const staffMemberFromApi = staffApiData?.data?.data?.staff;
  
  // Use staff data from state first, then from API
  const staffMember = staffMemberFromState || staffMemberFromApi;

  const servicesOptions = businessData?.data?.services?.map(service => ({
    value: service._id,
    label: service.name,
  })) || [];

  const allWeekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const getInitialWorkingHours = () => {
    if (!staffMember?.workingHours) return [];
    
    const staffDays = new Map(staffMember.workingHours.map(wh => [wh.day, wh]));

    return allWeekDays.map(day => {
      if (staffDays.has(day)) {
        const staffDay = staffDays.get(day);
        return {
          day,
          enabled: staffDay.enabled,
          shifts: staffDay.shifts.length > 0 ? staffDay.shifts.map(shift => ({
            start: shift.start,
            end: shift.end,
            breaks: shift.breaks || []
          })) : [{ start: '09:00', end: '17:00', breaks: [] }]
        };
      }
      return { day, enabled: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] };
    });
  };

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      position: '',
      services: [], // Array of { service: serviceId, timeInterval: number }
      bookingBuffer: 0,
      workingHours: [],
      showInCalendar: true,
      availableForBooking: true,
      replicateSource: '', // For replicate schedule functionality
      replicateTargets: [], // For replicate schedule functionality
    },
    validate: {
      firstName: (value) => (!value ? tc('firstNameRequired') : null),
      lastName: (value) => (!value ? tc('lastNameRequired') : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : tc('invalidEmailAddress')),
      phone: (value) => (!value ? tc('phoneNumberRequired') : null),
      role: (value) => (!value ? tc('roleRequired') : null),
      position: (value) => (!value ? tc('positionRequired') : null),
      services: (value) => {
        if (!value || value.length === 0) return null;
        // Validate each service has a valid time interval
        const invalidService = value.find(s => !s.timeInterval || s.timeInterval < 5 || s.timeInterval > 120);
        if (invalidService) {
          return tc('allServicesMustHaveValidTimeInterval') || 'All services must have a time interval between 5 and 120 minutes';
        }
        return null;
      },
      bookingBuffer: (value) => {
        const n = Number(value);
        if (Number.isNaN(n) || n < 0 || n > 1440) {
          return tc('bookingBufferMustBeBetween0And1440Minutes') || 'Booking buffer must be between 0 and 1440 minutes';
        }
        return null;
      }
    },
  });

  useEffect(() => {
    if (staffMember) {
      // Convert services to new format if needed
      let servicesValue = staffMember.services || [];
      
      // Check if services are in old format (array of service IDs) or new format (array of objects)
      if (servicesValue.length > 0 && typeof servicesValue[0] === 'string') {
        // Old format: convert to new format
        servicesValue = servicesValue.map(serviceId => ({
          service: serviceId,
          timeInterval: 30 // Default to 30 minutes if not set
        }));
      } else if (servicesValue.length > 0 && typeof servicesValue[0] === 'object' && !servicesValue[0].timeInterval) {
        // Partial object format without timeInterval
        servicesValue = servicesValue.map(s => ({
          service: s.service || s._id || s,
          timeInterval: s.timeInterval || 30 // Default to 30 minutes if not set
        }));
      }
      
      form.setValues({
        firstName: staffMember.firstName || "",
        lastName: staffMember.lastName || "",
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        role: staffMember.role || "",
        position: staffMember.position || "",
        services: servicesValue,
        bookingBuffer: staffMember.bookingBuffer ?? 0,
        workingHours: getInitialWorkingHours(),
        showInCalendar: staffMember.showInCalendar || true,
        availableForBooking: staffMember.availableForBooking || true,
      });
    } else {
      // Optional: Redirect if no staff data is passed
      // navigate("/dashboard/staff-management");
    }
  }, [staffMember]);
  
  const handleWorkingHoursChange = (day, field, value) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        if (field === 'enabled') {
          return { ...wh, enabled: value };
        }
        const newShifts = [...wh.shifts];
        newShifts[0][field] = value;
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  // Break management functions
  const addBreak = (day, shiftIndex) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[shiftIndex].breaks.push({ start: '12:00', end: '13:00' });
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  const removeBreak = (day, shiftIndex, breakIndex) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[shiftIndex].breaks.splice(breakIndex, 1);
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  const handleBreakChange = (day, shiftIndex, breakIndex, field, value) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[shiftIndex].breaks[breakIndex][field] = value;
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  // Replicate schedule functionality
  const handleReplicateSchedule = () => {
    const sourceDay = form.values.replicateSource;
    const targetDays = form.values.replicateTargets;
    
    if (!sourceDay || !targetDays || targetDays.length === 0) return;

    const sourceWorkingHour = form.values.workingHours.find(wh => wh.day === sourceDay);
    if (!sourceWorkingHour) return;

    const updatedHours = form.values.workingHours.map((wh) => {
      if (targetDays.includes(wh.day)) {
        return {
          ...wh,
          enabled: sourceWorkingHour.enabled,
          shifts: sourceWorkingHour.shifts.map(shift => ({
            start: shift.start,
            end: shift.end,
            breaks: shift.breaks.map(breakItem => ({ 
              start: breakItem.start, 
              end: breakItem.end 
            }))
          }))
        };
      }
      return wh;
    });

    form.setFieldValue('workingHours', updatedHours);
    form.setFieldValue('replicateSource', '');
    form.setFieldValue('replicateTargets', []);
  };

  // Helper function to add a service with default time interval
  const handleAddService = (serviceIds) => {
    // Convert simple service IDs to service objects with time intervals
    const newServices = serviceIds.map(serviceId => {
      // Check if this service already exists
      const existing = form.values.services.find(s => s.service === serviceId);
      if (existing) {
        return existing;
      }
      // Create new service object with default time interval
      return {
        service: serviceId,
        timeInterval: 30 // Default to 30 minutes when adding a new service
      };
    });
    form.setFieldValue('services', newServices);
  };

  // Helper function to update time interval for a specific service
  const handleServiceTimeIntervalChange = (serviceId, timeInterval) => {
    const updatedServices = form.values.services.map(s => 
      s.service === serviceId ? { ...s, timeInterval: parseInt(timeInterval) } : s
    );
    form.setFieldValue('services', updatedServices);
  };

  // Helper function to get time interval for a service
  const getServiceTimeInterval = (serviceId) => {
    const service = form.values.services.find(s => s.service === serviceId);
    return service?.timeInterval || 30; // Default to 30 minutes
  };

  const handleSubmit = (values) => {
    const enabledWorkingHours = values.workingHours.filter(wh => wh.enabled);
    
    if (enabledWorkingHours.length === 0) {
      form.setFieldError('workingHours', tc('atLeastOneWorkingDayRequired'));
      return;
    }

    const payload = {
      ...values,
      workingHours: enabledWorkingHours,
    };
    
    updateStaff(payload, {
      onSuccess: () => {
        navigate("/dashboard/staff-management");
      },
    });
  };

  const commonProps = {
    variant: "filled",
    radius: 10,
    size: "md",
    classNames: {
      input: "!bg-[#f0f3f5] !border-0",
    },
  };
  
  const commonSelectProps = {
    ...commonProps,
    rightSection: <IoIosArrowDown size={16} color="#7184B4" />,
    classNames: {
        ...commonProps.classNames,
        rightSection: "!pointer-events-none",
    }
  }

  return (
    <BatchTranslationLoader>
      <div className="h-[83vh] flex flex-col bg-white">
        <LoadingOverlay visible={isPending} />
        <Container size="xl" className="flex-grow w-full py-6 overflow-auto">
          {isStaffLoading ? (
            <Box className="max-w-[574px]">
              <Skeleton height={28} width={260} mb="md" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={44} radius={10} mb="sm" />
              <Skeleton height={180} radius={10} mb="lg" />
            </Box>
          ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group
              justify="space-between"
              className="mb-6 max-sm:flex-col max-sm:gap-5 max-sm:items-stretch"
            >
              <Button
                size="lg"
                className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
                onClick={() => navigate(-1)}
              >
                <IoArrowBackCircleOutline size={24} className="me-2 hidden sm:block" />
                {tc('goBack')}
              </Button>

              <Button
                type="submit"
                className="!w-40 !h-10 !text-white !font-medium !bg-[#323334] !rounded-xl max-sm:w-full"
                disabled={isPending}
              >
                {tc('updateStaff')}
              </Button>
            </Group>

          <Box>
            <Box className="mb-6 max-sm:mb-4">
              <p className="text-2xl text-slate-800 font-semibold">
                {tc('editStaffMember')}
              </p>
              <Text className="!text-[#939799] !text-base !font-normal !max-md:text-sm !max-sm:text-sm">
                {tc('updateStaffMemberDetails')}
              </Text>
            </Box>

            <Box className="max-w-[574px]">
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('firstName')}
                </Text>
                <TextInput
                  placeholder={tc('enterFirstName')}
                  {...form.getInputProps("firstName")}
                  {...commonProps}
                />
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('lastName')}
                </Text>
                <TextInput
                  placeholder={tc('enterLastName')}
                  {...form.getInputProps("lastName")}
                  {...commonProps}
                />
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('email')}
                </Text>
                <TextInput
                  placeholder={tc('enterEmailAddress')}
                  type="email"
                  {...form.getInputProps("email")}
                  {...commonProps}
                />
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('phoneNumber')}
                </Text>
                <PhoneInput
                  country={"us"}
                  value={form.values.phone}
                  onChange={(phone) => form.setFieldValue("phone", phone)}
                  inputStyle={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#f0f3f5",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  isValid={(value, country) => {
                    if (!value) {
                      form.setFieldError("phone", tc('phoneNumberRequired'));
                      return false;
                    }
                    return true;
                  }}
                />
                 {form.errors.phone && <Text c="red" size="sm" mt={2}>{form.errors.phone}</Text>}
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('role')}
                </Text>
                <TextInput
                  placeholder={tc('role')}
                  {...form.getInputProps("role")}
                  {...commonProps}
                />
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('position')}
                </Text>
                <TextInput
                  placeholder={tc('setPosition')}
                  {...form.getInputProps("position")}
                  {...commonProps}
                />
              </div>
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('assignServices')}
                </Text>
                {isBusinessLoading ? (
                    <Skeleton height={44} radius={10} />
                ) : (
                    <MultiSelect
                    placeholder={tc('selectServices')}
                    value={form.values.services.map(s => s.service)}
                    onChange={handleAddService}
                    data={servicesOptions}
                    {...commonSelectProps}
                    />
                )}
                {form.errors.services && (
                  <Text c="red" size="sm" mt={4}>
                    {form.errors.services}
                  </Text>
                )}
                {/* Service-specific time interval configuration */}
                {form.values.services && form.values.services.length > 0 && (
                  <Box mt="md" p="md" style={{ borderRadius: '10px', backgroundColor: '#f0f3f5' }}>
                    <Text size="sm" fw={500} mb="sm" c="#323334">
                      {tc('serviceSpecificTimeIntervals') || 'Service-Specific Time Intervals'}
                    </Text>
                    <Text size="xs" c="dimmed" mb="md">
                      {tc('setTimeIntervalForEachService') || 'Set the time interval for each service. This determines the appointment slot duration for that service.'}
                    </Text>
                    {form.values.services.map(serviceItem => {
                      const service = servicesOptions.find(s => s.value === serviceItem.service);
                      return (
                        <Box key={serviceItem.service} mb="sm" p="sm" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>{service?.label || 'Unknown Service'}</Text>
                          </Group>
                          <TimeIntervalSelector
                            value={serviceItem.timeInterval}
                            onChange={(value) => handleServiceTimeIntervalChange(serviceItem.service, value)}
                            {...commonProps}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </div>

              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('bookingBuffer') || 'Booking Buffer'}
                </Text>
                <BookingBufferSelector
                  value={form.values.bookingBuffer}
                  onChange={(value) => form.setFieldValue('bookingBuffer', value)}
                  minMinutes={0}
                  maxMinutes={1440}
                  error={form.errors.bookingBuffer}
                  {...commonProps}
                />
                <Text c="#939799" size="sm" mt={6}>
                  {tc('bookingBufferDescription') || 'Prevents last-minute bookings by blocking slots within the buffer from now.'}
                </Text>
              </div>

              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('workingHours')}
                </Text>
                <Box p="md" style={{ borderRadius: '10px', backgroundColor: '#f0f3f5' }}>
                  {form.values.workingHours.map((wh, index) => (
                    <Box key={wh.day} mb="md" p="sm" style={{ border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: 'white' }}>
                      <SimpleGrid cols={3} verticalSpacing="xs" mb="sm" style={{ alignItems: 'center' }}>
                        <Checkbox
                          label={tc(wh.day)}
                          {...form.getInputProps(`workingHours.${index}.enabled`, {
                            type: "checkbox",
                          })}
                        />
                        <TimeInput
                          disabled={!wh.enabled}
                          placeholder="Start time"
                          {...form.getInputProps(`workingHours.${index}.shifts.0.start`)}
                          styles={{ input: { height: '36px', ...(!wh.enabled && { backgroundColor: '#e9ecef'}) } }}
                        />
                        <TimeInput
                          disabled={!wh.enabled}
                          placeholder="End time"
                          {...form.getInputProps(`workingHours.${index}.shifts.0.end`)}
                          styles={{ input: { height: '36px', ...(!wh.enabled && { backgroundColor: '#e9ecef'}) } }}
                        />
                      </SimpleGrid>
                      
                      {/* Break Periods Section */}
                      {wh.enabled && (
                        <Box mt="sm">
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500} c="#7184B4">
                              {tc('breakPeriods') || 'Break Periods'}
                            </Text>
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => addBreak(wh.day, 0)}
                            >
                              {tc('addBreak') || 'Add Break'}
                            </Button>
                          </Group>
                          
                          {wh.shifts[0]?.breaks?.map((breakItem, breakIndex) => (
                             <Group key={breakIndex} mb="xs" align="center">
                               <TimeInput
                                 placeholder="Break start"
                                 value={breakItem.start}
                                 onChange={(e) => handleBreakChange(wh.day, 0, breakIndex, 'start', typeof e === 'string' ? e : e?.currentTarget?.value)}
                                 styles={{ input: { height: '32px', width: '100px' } }}
                               />
                               <TimeInput
                                 placeholder="Break end"
                                 value={breakItem.end}
                                 onChange={(e) => handleBreakChange(wh.day, 0, breakIndex, 'end', typeof e === 'string' ? e : e?.currentTarget?.value)}
                                 styles={{ input: { height: '32px', width: '100px' } }}
                               />
                               <Button
                                 size="xs"
                                 variant="light"
                                 color="red"
                                 onClick={() => removeBreak(wh.day, 0, breakIndex)}
                               >
                                 {tc('remove') || 'Remove'}
                               </Button>
                             </Group>
                           ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </div>

              {/* Replicate Schedule Section */}
              <div className="mb-4">
                <Text className="!text-[#7184B4] !text-sm !font-light !mb-1">
                  {tc('replicateSchedule') || 'Replicate Schedule'}
                </Text>
                <Box p="md" style={{ borderRadius: '10px', backgroundColor: '#f0f3f5' }}>
                  <Text size="sm" c="dimmed" mb="md">
                    {tc('replicateScheduleDescription') || 'Copy working hours from one day to multiple days'}
                  </Text>
                  <Group mb="md" grow>
                    <Select
                      placeholder={tc('selectSourceDay') || 'Select source day'}
                      data={form.values.workingHours
                        .filter(wh => wh.enabled)
                        .map(wh => ({
                          value: wh.day,
                          label: tc(wh.day)
                        }))}
                      value={form.values.replicateSource}
                      onChange={(value) => form.setFieldValue('replicateSource', value)}
                      style={{ flex: 1, minWidth: 260, width: '100%' }}
                    />
                    <MultiSelect
                      placeholder={tc('selectTargetDays') || 'Select target days'}
                      data={form.values.workingHours.map(wh => ({
                        value: wh.day,
                        label: tc(wh.day)
                      }))}
                      value={form.values.replicateTargets}
                      onChange={(value) => form.setFieldValue('replicateTargets', value)}
                      style={{ flex: 2, minWidth: 320, width: '100%' }}
                    />
                    <Button
                      onClick={handleReplicateSchedule}
                      disabled={!form.values.replicateSource || !form.values.replicateTargets?.length}
                    >
                      {tc('replicate') || 'Replicate'}
                    </Button>
                  </Group>
                </Box>
              </div>
              <Box className="mt-6">
                <div className="flex items-start mb-4">
                  <Checkbox
                    id="showInCalendar"
                    label={tc('showStaffMemberInCalendar')}
                    {...form.getInputProps("showInCalendar", { type: "checkbox" })}
                  />
                </div>
                <div className="flex items-start">
                  <Checkbox
                    id="availableForBooking"
                    label={tc('enableOnlineBooking')}
                    {...form.getInputProps("availableForBooking", { type: "checkbox" })}
                  />
                </div>
              </Box>
            </Box>
          </Box>
          </form>
          )}
        </Container>
      </div>
    </BatchTranslationLoader>
  );
};

export default EditStaffMember;