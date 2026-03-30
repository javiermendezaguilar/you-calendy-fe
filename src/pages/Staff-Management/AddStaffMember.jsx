import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAddStaff } from "../../hooks/useStaff";
import { useGetBusiness } from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import TimeIntervalSelector from "../../components/common/TimeIntervalSelector";
import BookingBufferSelector from "../../components/common/BookingBufferSelector";

const AddStaffMember = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const { mutate: addStaff, isPending } = useAddStaff();
  const { data: businessData, isLoading: isLoadingBusiness } = useGetBusiness();

  const servicesOptions = businessData?.data?.services?.map(service => ({
    value: service._id,
    label: service.name,
  })) || [];

  
  const initialWorkingHours = [
    { day: "monday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "tuesday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "wednesday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "thursday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "friday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "saturday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
    { day: "sunday", enabled: false, shifts: [{ start: "09:00", end: "17:00", breaks: [] }] },
  ];

  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      position: "",
      services: [], // Array of { service: serviceId, timeInterval: number }
      bookingBuffer: 0,
      workingHours: initialWorkingHours,
      showInCalendar: true,
      availableForBooking: true,
      replicateSource: "", 
    },
    validate: {
      firstName: (value) => (!value ? tc('firstNameRequired') : null),
      lastName: (value) => (!value ? tc('lastNameRequired') : null),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : tc('invalidEmailAddress'),
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

  const addBreak = (day) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[0].breaks = [...(newShifts[0].breaks || []), { start: "12:00", end: "13:00" }];
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  const removeBreak = (day, breakIndex) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[0].breaks = newShifts[0].breaks.filter((_, index) => index !== breakIndex);
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
  };

  const handleBreakChange = (day, breakIndex, field, value) => {
    const updatedHours = form.values.workingHours.map((wh) => {
      if (wh.day === day) {
        const newShifts = [...wh.shifts];
        newShifts[0].breaks[breakIndex][field] = value;
        return { ...wh, shifts: newShifts };
      }
      return wh;
    });
    form.setFieldValue('workingHours', updatedHours);
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
      // Create new service object with default time interval of 30 minutes
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
    
    addStaff(payload);
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
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group
              justify="space-between"
              className="mb-6 max-sm:flex-col max-sm:gap-5 max-sm:items-stretch"
            >
              <Link to={"/dashboard/staff-management"}>
                <Button
                  size="lg"
                  className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
                  onClick={() => navigate(-1)}
                >
                  <IoArrowBackCircleOutline
                    size={24}
                    className="me-2 hidden sm:block"
                  />{" "}
                  {tc('goBack')}
                </Button>
              </Link>

              <Button
                type="submit"
                className="!w-30 !h-10 !text-white !font-medium !bg-[#323334] !rounded-xl max-sm:w-full"
                disabled={isPending}
              >
                {tc('save')}
              </Button>
            </Group>

          <Box>
            <Box className="mb-6 max-sm:mb-4">
              <p className="text-2xl text-slate-800 font-semibold">
                {tc('addNewStaffMember')}
              </p>
              <Text className="!text-[#939799] !text-base !font-normal !max-md:text-sm !max-sm:text-sm">
                {tc('expandTeamAddBarbers')}
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
                {isLoadingBusiness ? (
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
                    <Box key={wh.day} mb="md" p="sm" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                      {/* Day header with enable checkbox and shift times */}
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

                      {/* Break periods section */}
                      {wh.enabled && (
                        <Box mt="sm">
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500} c="#7184B4">
                              {tc('breakPeriods') || 'Break Periods'}
                            </Text>
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => addBreak(wh.day)}
                              style={{ fontSize: '12px' }}
                            >
                              {tc('addBreak') || 'Add Break'}
                            </Button>
                          </Group>

                          {wh.shifts[0].breaks && wh.shifts[0].breaks.map((breakPeriod, breakIndex) => (
                            <Group key={breakIndex} mb="xs" style={{ alignItems: 'flex-end' }}>
                              <TimeInput
                                placeholder="Break start"
                                value={breakPeriod.start}
                                onChange={(e) => handleBreakChange(wh.day, breakIndex, 'start', typeof e === 'string' ? e : e?.currentTarget?.value)}
                                styles={{ input: { height: '32px', fontSize: '14px' } }}
                                style={{ flex: 1 }}
                              />
                              <TimeInput
                                placeholder="Break end"
                                value={breakPeriod.end}
                                onChange={(e) => handleBreakChange(wh.day, breakIndex, 'end', typeof e === 'string' ? e : e?.currentTarget?.value)}
                                styles={{ input: { height: '32px', fontSize: '14px' } }}
                                style={{ flex: 1 }}
                              />
                              <Button
                                size="xs"
                                variant="light"
                                color="red"
                                onClick={() => removeBreak(wh.day, breakIndex)}
                                style={{ fontSize: '12px' }}
                              >
                                {tc('remove') || 'Remove'}
                              </Button>
                            </Group>
                          ))}

                          {(!wh.shifts[0].breaks || wh.shifts[0].breaks.length === 0) && (
                            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                              {tc('noBreakPeriodsAdded') || 'No break periods added'}
                            </Text>
                          )}
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
                  <Text size="sm" mb="md" c="dimmed">
                    {tc('replicateScheduleDescription') || 'Copy working hours from one day to multiple days'}
                  </Text>
                  <Group mb="md" grow>
                    <Select
                      placeholder={tc('selectSourceDay') || 'Select source day'}
                      data={form.values.workingHours
                        .filter(wh => wh.enabled)
                        .map(wh => ({ value: wh.day, label: tc(wh.day) }))}
                      value={form.values.replicateSource}
                      onChange={(value) => form.setFieldValue('replicateSource', value)}
                      style={{ flex: 1, minWidth: 260, width: '100%' }}
                      {...commonSelectProps}
                    />
                    <MultiSelect
                      placeholder={tc('selectTargetDays') || 'Select target days'}
                      data={form.values.workingHours.map(wh => ({
                        value: wh.day,
                        label: tc(wh.day)
                      }))}
                      onChange={(targetDays) => {
                        const sourceDay = form.values.replicateSource;
                        if (sourceDay && targetDays.length > 0) {
                          const sourceDayData = form.values.workingHours.find(wh => wh.day === sourceDay);
                          if (sourceDayData) {
                            const updatedHours = form.values.workingHours.map(wh => {
                              if (targetDays.includes(wh.day)) {
                                return {
                                  ...wh,
                                  enabled: true,
                                  shifts: JSON.parse(JSON.stringify(sourceDayData.shifts))
                                };
                              }
                              return wh;
                            });
                            form.setFieldValue('workingHours', updatedHours);
                          }
                        }
                      }}
                      styles={{ input: { height: '36px' } }}
                      style={{ flex: 2, minWidth: 320, width: '100%' }}
                      {...commonSelectProps}
                    />
                  </Group>
                </Box>
              </div>

              <Box className="mt-6">
                <div className="flex items-start mb-4">
                  <Checkbox
                    {...form.getInputProps("showInCalendar", {
                      type: "checkbox",
                    })}
                    size="md"
                    color="#323334"
                    radius="sm"
                    className="mt-1"
                  />
                  <Box className="ml-3">
                    <Text className="!text-[#323334] !text-lg !font-medium !leading-8 !max-sm:text-base !max-sm:leading-6">
                      {tc('showStaffMemberInCalendar')}
                    </Text>
                    <Text className="!text-[#939799] !text-sm !font-normal !leading-5 !max-w-[508px] !max-sm:text-xs">
                      {tc('checkBoxStaffMemberOffersServices')}
                    </Text>
                  </Box>
                </div>

                <div className="flex items-start mb-4">
                  <Checkbox
                    {...form.getInputProps("availableForBooking", {
                      type: "checkbox",
                    })}
                    size="md"
                    color="#323334"
                    radius="sm"
                    className="mt-1"
                  />
                  <Box className="ml-3">
                    <Text className="!text-[#323334] !text-lg !font-medium !leading-8 !max-sm:text-base !max-sm:leading-6">
                      {tc('availableForOnlineBooking')}
                    </Text>
                    <Text className="!text-[#939799] !text-sm !font-normal !leading-5 !max-w-[508px] !max-sm:text-xs">
                      {tc('checkBoxStaffMemberOffersServices')}
                    </Text>
                  </Box>
                </div>
              </Box>
            </Box>
          </Box>
        </form>
      </Container>
    </div>
    </BatchTranslationLoader>
  );
};

export default AddStaffMember;
