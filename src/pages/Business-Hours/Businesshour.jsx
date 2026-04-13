import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Plus, Trash2, ChevronDown, X, AlertCircle } from 'lucide-react';
import LazyFooter from '../../components/home/landing/LazyFooter';
import { Switch, Text, Button, Title, Modal, Group, ActionIcon, Stack, Select, TextInput } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setBusinessHours, nextStep, prevStep } from '../../store/registrationSlice';
import CommonModal from '../../components/common/CommonModal';
import { HeaderLogo } from "../../components/common/Svgs";

const TIME_OPTIONS = (() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m++) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const time = `${hour}:${minute}`;
            options.push({ value: time, label: time });
        }
    }
    return options;
})();

// Custom TimeInput component with validation
const TimeInput = ({ value, onChange, placeholder, error }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [lastValidValue, setLastValidValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
    if (value) setLastValidValue(value);
  }, [value]);

  const validateAndFormatTime = (input) => {
    if (!input) return '';
    
    // Remove any non-digit characters except colon
    const cleaned = input.replace(/[^\d:]/g, '');
    
    let hours, minutes;
    
    if (cleaned.includes(':')) {
      // Format: HH:MM or H:MM
      const parts = cleaned.split(':');
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
    } else if (cleaned.length >= 3) {
      // Format: HHMM or HMM
      if (cleaned.length === 3) {
        hours = parseInt(cleaned.substring(0, 1));
        minutes = parseInt(cleaned.substring(1, 3));
      } else {
        hours = parseInt(cleaned.substring(0, 2));
        minutes = parseInt(cleaned.substring(2, 4));
      }
    } else if (cleaned.length <= 2) {
      // Format: HH or H (hours only)
      hours = parseInt(cleaned) || 0;
      minutes = 0;
    } else {
      return null; // Invalid format
    }
    
    // Validate ranges
    if (hours >= 24 || minutes >= 60) {
      return null; // Invalid time
    }
    
    // Format to HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    // Allow only digits and colon, limit length
    const filtered = newValue.replace(/[^\d:]/g, '').slice(0, 5);
    setInputValue(filtered);
  };

  const handleBlur = () => {
    const formattedTime = validateAndFormatTime(inputValue);
    if (formattedTime !== null) {
      setInputValue(formattedTime);
      setLastValidValue(formattedTime);
      onChange(formattedTime);
    } else if (inputValue.trim() === '') {
      // Allow empty input
      setInputValue('');
      setLastValidValue('');
      onChange('');
    } else {
      // Revert to last valid value for invalid input
      setInputValue(lastValidValue);
    }
  };

  const handleKeyDown = (event) => {
    // Allow Enter to trigger blur (format the input)
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
      styles={{
        input: {
          height: '48px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          fontSize: '16px',
          '&:focus': {
            borderColor: '#2F70EF',
          }
        }
      }}
    />
  );
};

const LogoSection = ({ onBack }) => (
  <div className="w-full flex justify-start items-start mb-5">
    <div className="flex flex-col">
      <div className="mb-3">
        <div className="flex justify-center items-center">
          <Link to="/" className="cursor-pointer">
            <HeaderLogo />
          </Link>
        </div>
      </div>
      <Button
        onClick={onBack}
        variant="subtle"
        p={0}
        top={40}
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
  <div className="flex flex-col items-center w-full mb-4 mt-10">
    <Title className="!text-[#323334] !text-center !text-3xl !sm:text-4xl !font-bold !leading-tight">
      Business Hours
    </Title>
    <Text className="!text-[#7898AB] !text-center !text-sm !font-normal !leading-normal !mt-2">
      When can clients book an appointment with you?
    </Text>
  </div>
);

const Businesshour = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const initialBusinessHours = useSelector((state) => state.registration.businessHours);
  
  const [localBusinessHours, setLocalBusinessHours] = useState(initialBusinessHours);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempShifts, setTempShifts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setLocalBusinessHours(initialBusinessHours);
  }, [initialBusinessHours]);

  const handleToggle = useCallback((day) => {
    setLocalBusinessHours(prev => {
      const isEnabled = !prev[day].enabled;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          enabled: isEnabled,
          shifts: isEnabled ? (prev[day].shifts.length ? prev[day].shifts : [{ start: '09:00', end: '17:00' }]) : []
        }
      };
    });
  }, []);

  const handleOpenModal = useCallback((day) => {
    if (!localBusinessHours[day].enabled) return;
    setSelectedDay(day);
    setTempShifts(JSON.parse(JSON.stringify(localBusinessHours[day].shifts)));
    setValidationErrors({});
    setModalOpened(true);
  }, [localBusinessHours]);

  const handleCloseModal = useCallback(() => {
    setModalOpened(false);
    setSelectedDay(null);
    setTempShifts([]);
    setValidationErrors({});
  }, []);

  const handleShiftChange = useCallback((index, field, value) => {
    setTempShifts(prev => {
      const newShifts = [...prev];
      newShifts[index] = { ...newShifts[index], [field]: value };
      return newShifts;
    });
    setValidationErrors(prev => ({ ...prev, [`shift-${index}-${field}`]: null, overlap: null }));
  }, []);

  const validateShifts = useCallback((shifts) => {
    const errors = {};
    if (!shifts.length) return errors;
    shifts.forEach((shift, index) => {
        if (!shift.start) errors[`shift-${index}-start`] = "Required";
        if (!shift.end) errors[`shift-${index}-end`] = "Required";
        if (shift.start && shift.end && shift.start >= shift.end) {
            errors[`shift-${index}-end`] = "Must be after start";
        }
    });
    const sortedShifts = [...shifts].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
    for (let i = 1; i < sortedShifts.length; i++) {
        if (sortedShifts[i].start && sortedShifts[i - 1].end && sortedShifts[i].start < sortedShifts[i - 1].end) {
            errors.overlap = "Shifts cannot overlap";
            break;
        }
    }
    return errors;
  }, []);

  const handleSaveShifts = useCallback(() => {
    const errors = validateShifts(tempShifts);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setLocalBusinessHours(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        shifts: tempShifts,
        enabled: tempShifts.length > 0
      }
    }));
    handleCloseModal();
  }, [selectedDay, tempShifts, handleCloseModal, validateShifts]);

  const handleNext = () => {
    dispatch(setBusinessHours(localBusinessHours));
    dispatch(nextStep());
    navigate('/services');
  };
  
  const handleBack = () => {
    dispatch(prevStep());
    navigate('/location');
  };

  const getTimeDisplay = useCallback((shifts, enabled) => {
    if (!enabled || shifts.length === 0) {
      return <span className="text-gray-400">Closed</span>;
    }
    return shifts.map(shift => `${shift.start} - ${shift.end}`).join(', ');
  }, []);

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto">
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-5 sm:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection onBack={handleBack} />
        <ProgressBar />

        <div className="flex flex-col items-center w-full max-w-[450px]">
          <div className="flex flex-col items-center gap-4 w-full">
            <FormHeader />

            <div className="flex flex-col w-full gap-2">
              {Object.entries(localBusinessHours).map(([day, { enabled, shifts }]) => (
                <div 
                  key={day}
                  className={`bg-white rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.08)] px-4 py-3 ${enabled ? 'cursor-pointer hover:bg-gray-50' : 'opacity-70'} transition-colors flex items-center justify-between gap-2`}
                  onClick={() => handleOpenModal(day)}
                >
                  <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Switch
                      checked={enabled}
                      onChange={() => handleToggle(day)}
                      color="#556B2F"
                      size="sm"
                    />
                    <span className="w-28 text-[#323334] capitalize text-base font-semibold">{day}</span>
                    <span className="text-[#565656] text-base font-medium ml-2 min-w-[90px]">{getTimeDisplay(shifts, enabled)}</span>
                  </div>
                  {enabled && <ChevronRight size={20} className="text-gray-400" />}
                </div>
              ))}
            </div>

            <div className="flex justify-end w-full mt-4 mb-30">
            <Button
              onClick={handleNext}
              size="md"
              radius="md"
              w={{ base: '100%'}}
              styles={{
                root: {
                  backgroundColor: '#323334',
                  height: '45px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '15px',
                  '&:hover': { backgroundColor: '#444' },
                }
              }}
              aria-label="Next step"
            >
              Next
            </Button>
            </div>
          </div>
        </div>
      </main>

      {selectedDay && (
        <Modal 
          opened={modalOpened} 
          onClose={handleCloseModal} 
          centered
          size="md"
          withCloseButton={false}
          styles={{
            content: {
              borderRadius: '16px',
              padding: 0,
            },
            body: {
              padding: 0,
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#323334]">Business Hours</h2>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Description */}
            <p className="text-[#7898AB] text-sm mb-8">
              Set your business hours here. To adjust specific days, use the calendar.
            </p>

            {/* Shifts */}
            <div className="space-y-6">
              {tempShifts.map((shift, index) => (
                <div key={index}>
                   <div className="mb-3">
                     <h3 className="text-lg font-medium text-[#323334] mb-3">
                       {index === 0 ? 'First Shift' : index === 1 ? 'Second Shift' : `Shift ${index + 1}`}
                     </h3>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     <div className="flex-1">
                       <TimeInput
                         value={shift.start}
                         onChange={(value) => handleShiftChange(index, 'start', value)}
                         placeholder="10:00"
                         error={validationErrors[`shift-${index}-start`]}
                       />
                     </div>
                     
                     <div className="flex-1">
                       <TimeInput
                         value={shift.end}
                         onChange={(value) => handleShiftChange(index, 'end', value)}
                         placeholder="14:00"
                         error={validationErrors[`shift-${index}-end`]}
                       />
                     </div>
                     
                     {tempShifts.length > 1 && (
                       <button
                         onClick={() => setTempShifts(prev => prev.filter((_, i) => i !== index))}
                         className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                       >
                         <Trash2 size={16} className="text-red-500" />
                       </button>
                     )}
                   </div>
                 </div>
              ))}
              
              {validationErrors.overlap && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  <span>{validationErrors.overlap}</span>
                </div>
              )}
              
              {tempShifts.length < 3 && (
                <button
                  onClick={() => setTempShifts(prev => [...prev, { start: '', end: '' }])}
                  className="flex items-center gap-2 text-[#373B3F] transition-colors font-medium cursor-pointer"
                >
                  <Plus size={16} color='#93AFD6' />
                  Add another Shift
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseModal}
                className="flex-1 h-12 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShifts}
                className="flex-1 h-12 bg-[#323334] hover:bg-[#1F2937] text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      <LazyFooter />
    </div>
  );
};

export default Businesshour;
