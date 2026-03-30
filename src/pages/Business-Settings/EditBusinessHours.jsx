import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Switch, Button, TextInput } from "@mantine/core";
import { useForm } from '@mantine/form';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import CommonModal from "../../components/common/CommonModal";
import {
  useGetBusiness,
  useUpdateBusinessHours,
} from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const convert24HourTo12Hour = (time) => {
  if (!time) return '';
  const [rawHours, rawMinutes] = time.split(':');
  const hours = parseInt(rawHours, 10);
  const minutes = parseInt(rawMinutes || '0', 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return '';
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  if (displayHours === 0) {
    displayHours = 12;
  }

  return `${displayHours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;
};

const parse12HourTo24Hour = (input) => {
  if (!input) {
    return '';
  }

  const sanitized = input.trim().toUpperCase().replace(/\s+/g, ' ');
  const match = sanitized.match(/^([0-9]{1,2})(?::?([0-9]{2}))?\s*(AM|PM)$/);

  if (!match) {
    return null;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const period = match[3];

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    return null;
  }

  if (period === 'AM') {
    if (hours === 12) {
      hours = 0;
    }
  } else if (period === 'PM' && hours !== 12) {
    hours += 12;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

const parse24HourInput = (input) => {
  if (!input) {
    return '';
  }

  const cleaned = input.replace(/[^0-9:]/g, '');
  if (!cleaned) {
    return '';
  }

  let hours;
  let minutes;

  if (cleaned.includes(':')) {
    const [hourPart, minutePart] = cleaned.split(':');
    hours = parseInt(hourPart, 10);
    minutes = minutePart !== undefined ? parseInt(minutePart, 10) : 0;
  } else if (cleaned.length >= 3) {
    if (cleaned.length === 3) {
      hours = parseInt(cleaned.substring(0, 1), 10);
      minutes = parseInt(cleaned.substring(1, 3), 10);
    } else {
      hours = parseInt(cleaned.substring(0, 2), 10);
      minutes = parseInt(cleaned.substring(2, 4), 10);
    }
  } else {
    hours = parseInt(cleaned, 10);
    minutes = 0;
  }

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours >= 24 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    return null;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

const formatTimeForDisplay = (value, timeFormat) => {
  if (!value) {
    return '';
  }

  return timeFormat === '12h'
    ? convert24HourTo12Hour(value)
    : value;
};

// Custom TimeInput component with validation
const TimeInput = ({ value, onChange, placeholder, error, timeFormat = '12h', ...rest }) => {
  const [inputValue, setInputValue] = useState('');
  const [lastValidValue, setLastValidValue] = useState('');

  useEffect(() => {
    const normalized = value || '';
    setLastValidValue(normalized);
    setInputValue(formatTimeForDisplay(normalized, timeFormat));
  }, [value, timeFormat]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    if (timeFormat === '12h') {
      const filtered = newValue
        .replace(/[^0-9APMapm:\s]/g, '')
        .slice(0, 8);
      setInputValue(filtered.toUpperCase());
    } else {
      const filtered = newValue.replace(/[^0-9:]/g, '').slice(0, 5);
      setInputValue(filtered);
    }
  };

  const handleBlur = () => {
    const trimmedValue = inputValue.trim();

    if (trimmedValue === '') {
      setInputValue('');
      setLastValidValue('');
      onChange('');
      return;
    }

    if (timeFormat === '12h') {
      const parsedValue = parse12HourTo24Hour(trimmedValue);

      if (parsedValue !== null) {
        setLastValidValue(parsedValue);
        const displayValue = formatTimeForDisplay(parsedValue, timeFormat);
        setInputValue(displayValue);
        onChange(parsedValue);
        return;
      }
    } else {
      const parsedValue = parse24HourInput(trimmedValue);

      if (parsedValue !== null) {
        setLastValidValue(parsedValue);
        const displayValue = formatTimeForDisplay(parsedValue, timeFormat);
        setInputValue(displayValue);
        onChange(parsedValue);
        return;
      }
    }

    // Revert to last valid value when the input is invalid
    setInputValue(formatTimeForDisplay(lastValidValue, timeFormat));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  };

  return (
    <TextInput
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      error={error}
      {...rest}
      styles={{
        input: {
          height: '48px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          fontSize: '16px',
          '&:focus': {
            borderColor: '#2F70EF',
          },
          textTransform: timeFormat === '12h' ? 'uppercase' : 'none',
        },
      }}
    />
  );
};

const ModalContent = ({ selectedDay, handleShiftChange, addShift, deleteShift, handleCloseModal, handleSaveModal, validationError, tc, timeFormatPreference }) => {
  if (!selectedDay) return null;
  
  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-start text-[#323334] mb-2">
        {tc('businessHours')}
      </h2>
      <p className="text-start text-[#7898AB] text-xs md:text-sm mb-4 md:mb-6">
        {tc('businessHoursDescription')}
      </p>

      <div className="flex flex-col gap-4 md:gap-5">
        {selectedDay.shifts.map((shift, index) => (
          <div key={index} className="mb-1">
            <label className="text-[#323334] text-[14px] md:text-[16px] font-medium mb-1 md:mb-2 block">
              {index === 0 ? tc('firstShift') : index === 1 ? tc('secondShift') : index === 2 ? tc('thirdShift') : `${tc('shift')} ${index + 1}`}
            </label>
            <div className="flex items-center gap-2 md:gap-3">
              <TimeInput
                value={shift.startTime}
                onChange={(value) =>
                  handleShiftChange(index, "startTime", value)
                }
                placeholder={timeFormatPreference === '12h' ? '09:00 AM' : '09:00'}
                className="flex-1"
                timeFormat={timeFormatPreference}
              />
              <TimeInput
                value={shift.endTime}
                onChange={(value) =>
                  handleShiftChange(index, "endTime", value)
                }
                placeholder={timeFormatPreference === '12h' ? '05:00 PM' : '17:00'}
                className="flex-1"
                timeFormat={timeFormatPreference}
              />
              {index > 0 && (
                <div className="h-[40px] md:h-[45px] w-[40px] md:w-[45px] flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteShift(index);
                    }}
                    className="h-[40px] md:h-[45px] w-[40px] md:w-[45px] rounded-full bg-[#FFD8DB] hover:bg-[#FFC0C4] flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2
                      size={16}
                      className="text-[#FF5C5C] cursor-pointer"
                    />
                  </button>
                </div>
              )}
              {index === 0 && (
                <div className="h-[40px] md:h-[45px] w-[40px] md:w-[45px] flex-shrink-0"></div>
              )}
            </div>
          </div>
        ))}
        
        {/* Error message display */}
        {validationError && (
          <div className="text-red-500 text-xs md:text-sm mt-2 px-1">
            {validationError}
          </div>
        )}

        {selectedDay.shifts.length < 3 && (
          <button
            onClick={addShift}
            className="flex items-center justify-start gap-2 w-full h-[40px] md:h-[45px] bg-white border border-dashed border-[#D1D5DB] rounded-xl text-[#373B3F] hover:bg-[#F9F9F9] mt-1 text-xs md:text-md cursor-pointer"
          >
            <Plus size={16} className="ml-4 text-[#373B3F]" />
            {tc('addAnotherShift')}
          </button>
        )}
      </div>

      <div className="flex gap-3 mt-4 md:mt-6">
        <Button
          className="!bg-[#EEF0F2] !text-[#6B7280] !hover:bg-[#E5E7EB] !h-[40px] md:!h-[45px] !flex-1 !rounded-xl !text-xs md:!text-sm !font-medium"
          onClick={handleCloseModal}
        >
          {tc('cancel')}
        </Button>

        <Button
          className="!bg-[#323334] !text-white !hover:bg-[#292A2B] !h-[40px] md:!h-[45px] !flex-1 !rounded-xl !text-xs md:!text-sm !font-medium"
          onClick={handleSaveModal}
        >
          {tc('save')}
        </Button>
      </div>
    </div>
  );
};

const EditBusinessHours = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [validationError, setValidationError] = useState('');

  const { data: businessData, isLoading: isFetching } = useGetBusiness();
  const { mutate: updateHours, isPending: isSaving } = useUpdateBusinessHours();

  // Helper to convert backend data to frontend format
  const transformBackendToFrontend = (backendHours) => {
    const dayOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return dayOrder.map((dayName, index) => {
      const backendDay = backendHours[dayName];
      return {
        id: index + 1,
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        isActive: backendDay.enabled,
        shifts: backendDay.shifts.map((s) => ({
          startTime: s.start,
          endTime: s.end,
        })),
      };
    });
  };

  const form = useForm({
    initialValues: {
      timeFormatPreference: '12h',
      businessHours: [
        { day: "Monday", isActive: false, shifts: [] },
        { day: "Tuesday", isActive: false, shifts: [] },
        { day: "Wednesday", isActive: false, shifts: [] },
        { day: "Thursday", isActive: false, shifts: [] },
        { day: "Friday", isActive: false, shifts: [] },
        { day: "Saturday", isActive: false, shifts: [] },
        { day: "Sunday", isActive: false, shifts: [] },
      ].map((d, i) => ({ ...d, id: i + 1 })),
    },
    validate: {
      businessHours: {
        shifts: (shifts) => {
          if (!shifts) return null;
          
          for (const shift of shifts) {
            if (shift.startTime >= shift.endTime) {
              return tc('endTimeMustBeAfterStartTime');
            }
          }
          
          if (shifts.length > 1) {
            const sortedShifts = [...shifts].sort((a, b) => 
              a.startTime.localeCompare(b.startTime)
            );
            
            for (let i = 0; i < sortedShifts.length - 1; i++) {
              if (sortedShifts[i].endTime > sortedShifts[i + 1].startTime) {
                return tc('shiftsCannotOverlap');
              }
            }
          }
          
          return null;
        }
      }
    }
  });

  useEffect(() => {
    if (businessData?.data?.businessHours) {
      const frontendHours = transformBackendToFrontend(
        businessData.data.businessHours
      );
      form.setFieldValue("businessHours", frontendHours);
    }

    if (businessData?.data?.timeFormatPreference) {
      form.setFieldValue(
        "timeFormatPreference",
        businessData.data.timeFormatPreference
      );
    }
  }, [businessData]);

  const handleToggle = (e, id) => {
    e.stopPropagation();
    
    const updatedHours = form.values.businessHours.map((day) => {
      if (day.id === id) {
        const newIsActive = !day.isActive;
        const newShifts = newIsActive
          ? [{ startTime: "10:00", endTime: "14:00" }]
          : [{ startTime: "00:00", endTime: "00:00" }];
        return {
          ...day,
          isActive: newIsActive,
          shifts: newShifts,
        };
      }
      return day;
    });

    form.setFieldValue('businessHours', updatedHours);
  };

  const handleEditHours = (day) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDay(null);
    setValidationError('');
  };

  const handleSaveModal = () => {
    // Clear previous errors
    setValidationError('');
    
    const shifts = selectedDay.shifts;
    
    // Check if shifts are valid
    for (const shift of shifts) {
      if (shift.startTime >= shift.endTime) {
        setValidationError(tc('endTimeMustBeAfterStartTime'));
        return;
      }
    }
    
    // Check for overlapping shifts
    if (shifts.length > 1) {
      const sortedShifts = [...shifts].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
      
      for (let i = 0; i < sortedShifts.length - 1; i++) {
        if (sortedShifts[i].endTime > sortedShifts[i + 1].startTime) {
          setValidationError(tc('shiftsCannotOverlap'));
          return;
        }
      }
    }

    // If no errors, save and close
    const updatedHours = form.values.businessHours.map((day) =>
      day.id === selectedDay.id ? selectedDay : day
    );
    form.setFieldValue("businessHours", updatedHours);
    handleCloseModal();
  };

  const handleShiftChange = (shiftIndex, field, value) => {
    if (!selectedDay) return;
    
    const updatedShifts = selectedDay.shifts.map((shift, index) => {
      if (index === shiftIndex) {
        return { ...shift, [field]: value };
      }
      return shift;
    });
    setSelectedDay({ ...selectedDay, shifts: updatedShifts });
  };

  const addShift = () => {
    const newShifts = [...selectedDay.shifts, { startTime: "10:00", endTime: "14:00" }];
    setSelectedDay({ ...selectedDay, shifts: newShifts });
  };

  const deleteShift = (shiftIndex) => {
    const newShifts = selectedDay.shifts.filter((_, idx) => idx !== shiftIndex);
    setSelectedDay({ ...selectedDay, shifts: newShifts });
  };

  const handleSave = () => {
    // Helper to convert frontend data to backend format
    const transformFrontendToBackend = (frontendHours) => {
      const backendHours = {};
      frontendHours.forEach((day) => {
        const dayName = day.day.toLowerCase();
        backendHours[dayName] = {
          enabled: day.isActive,
          shifts: day.isActive
            ? day.shifts.map((s) => ({ start: s.startTime, end: s.endTime }))
            : [],
        };
      });
      return backendHours;
    };

    const backendData = transformFrontendToBackend(form.values.businessHours);
    const payload = {
      businessHours: backendData,
      timeFormatPreference: form.values.timeFormatPreference,
    };

    updateHours(payload, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const displayTime = (time) =>
    formatTimeForDisplay(time, form.values.timeFormatPreference || '12h');

  const timeFormatOptions = [
    { value: '12h', label: tc('timeFormatOption12h') || '12-hour (AM/PM)' },
    { value: '24h', label: tc('timeFormatOption24h') || '24-hour' },
  ];

  const formatTimeRange = (shifts) => {
    if (!shifts || shifts.length === 0 || !shifts[0].startTime) {
      return tc('closedTimeRange');
    }
    // Handle explicit closed marker 00:00 - 00:00
    if (shifts.length === 1 && shifts[0].startTime === '00:00' && shifts[0].endTime === '00:00') {
      return tc('closedTimeRange');
    }
    if (shifts.length === 1) {
      return `${displayTime(shifts[0].startTime)} - ${displayTime(shifts[0].endTime)}`;
    }
    
    // Show all shifts, each on a new line
    return (
      <div className="flex flex-col">
        {shifts.map((shift, index) => (
          <span key={index} className="text-xs sm:text-sm text-[#323334] font-medium">
            {displayTime(shift.startTime)} - {displayTime(shift.endTime)}
          </span>
        ))}
      </div>
    );
  };

  return (
    <BatchTranslationLoader>
      <main className="max-w-none h-[83vh] overflow-auto bg-white mx-auto p-4 sm:p-6 rounded-[18px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-14 gap-4 sm:gap-0">
          <Link to={-1} className="flex w-auto">
            <Button
              size="lg"
              className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:!text-sm max-md:!py-2 max-md:!px-4 max-md:size-md"
            >
              <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
            </Button>
          </Link>

          <Button
            color="#323334"
            size="md"
            px={50}
            radius={10}
            className="max-md:w-full"
            onClick={handleSave}
            loading={isSaving || isFetching}
          >
            {tc('save')}
          </Button>
        </div>

      <div className="flex flex-col gap-3 sm:gap-4 w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
        <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border border-[#EBEBEB] shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
          <div>
            <h3 className="text-[#323334] text-base sm:text-lg font-semibold">
              {tc('timeFormatPreference') || 'Time format'}
            </h3>
            <p className="text-[#6B7280] text-xs sm:text-sm mt-1">
              {tc('timeFormatPreferenceDescription') || 'Choose how you want to enter and display working hours across your profile.'}
            </p>
          </div>
          <div className="flex gap-3">
            {timeFormatOptions.map((option) => {
              const isActive = form.values.timeFormatPreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setFieldValue('timeFormatPreference', option.value)}
                  className={`flex-1 min-h-[44px] rounded-xl border transition-colors text-sm sm:text-base font-medium ${
                    isActive
                      ? 'border-[#556B2F] bg-[#556B2F] text-white'
                      : 'border-[#E5E7EB] bg-white text-[#323334] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {form.values.businessHours.map((day) => (
          <div
            key={day.id}
            className={`flex items-center justify-between p-3 sm:p-6 rounded-2xl border border-[#EBEBEB] shadow-[0px_14px_32.2px_0px_#E9EEF059] ${
              day.isActive ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-6">
              <Switch
                size="sm"
                classNames={{
                  root: "mr-0 sm:mr-2"
                }}
                color="#556B2F"
                checked={day.isActive}
                onChange={(e) => handleToggle(e, day.id)}
              />
              <span className="w-25 text-sm sm:text-base md:text-lg font-medium text-[#323334]">
                {tc(day.day.toLowerCase())}
              </span>
              <span className="text-xs sm:text-sm text-[#323334] mr-1 sm:mr-3 font-medium hidden sm:block">
                {formatTimeRange(day.shifts)}
              </span>
            </div>

            <div className="flex items-center ml-auto">
              <span className="text-xs text-[#323334] mr-1 font-medium block sm:hidden">
                {formatTimeRange(day.shifts)}
              </span>
              <button 
                onClick={() => handleEditHours(day)} 
                className="flex items-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#929699]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CommonModal
        opened={modalOpen}
        onClose={handleCloseModal}
        size="md" 
        styles={{
          content: { 
            borderRadius: '20px',
            padding: 0,
            backgroundColor: 'white',
            boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
            width: '90%', 
            maxWidth: '450px'
          },
          body: {
            padding: 0
          },
          inner: {
            padding: '15px'
          }
        }}
        content={
          <ModalContent
            selectedDay={selectedDay}
            handleShiftChange={handleShiftChange}
            addShift={addShift}
            deleteShift={deleteShift}
            handleCloseModal={handleCloseModal}
            handleSaveModal={handleSaveModal}
            validationError={validationError}
            tc={tc}
            timeFormatPreference={form.values.timeFormatPreference}
          />
        }
      />
</main>
    </BatchTranslationLoader>
  );
};

export default EditBusinessHours;
