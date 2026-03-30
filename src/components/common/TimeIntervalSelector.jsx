import React from "react";
import { Select, Group, Text } from "@mantine/core";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const TimeIntervalSelector = ({ value, onChange, error, ...props }) => {
  const { tc } = useBatchTranslation();

  // Parse the current value (in minutes) to hours and minutes
  const parseValue = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) {
      return { hours: 0, minutes: 5 }; // Default to 5 minutes
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  // Convert hours and minutes back to total minutes
  const convertToMinutes = (hours, minutes) => {
    return hours * 60 + minutes;
  };

  const { hours, minutes } = parseValue(value);

  // Generate hour options (0-2, max 120 minutes = 2 hours)
  const hourOptions = Array.from({ length: 3 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "0 hours" : i === 1 ? "1 hour" : `${i} hours`,
  }));

  // Generate minute options based on selected hours to respect 120-minute limit
  const getMinuteOptions = (selectedHours) => {
    const maxMinutes = selectedHours >= 2 ? 0 : 59; // If 2 hours selected, only 0 minutes allowed
    const actualMaxMinutes = selectedHours >= 2 ? 0 : Math.min(59, 120 - (selectedHours * 60));
    
    return Array.from({ length: actualMaxMinutes + 1 }, (_, i) => ({
      value: i.toString(),
      label: i === 0 ? "0 minutes" : i === 1 ? "1 minute" : `${i} minutes`,
    }));
  };

  const minuteOptions = getMinuteOptions(hours);

  const handleHourChange = (newHours) => {
    const newHoursInt = parseInt(newHours) || 0;
    let newMinutes = minutes;
    
    // If selecting 2 hours, force minutes to 0 (120 minutes max)
    if (newHoursInt >= 2) {
      newMinutes = 0;
    }
    
    const totalMinutes = convertToMinutes(newHoursInt, newMinutes);
    onChange(totalMinutes);
  };

  const handleMinuteChange = (newMinutes) => {
    const newMinutesInt = parseInt(newMinutes) || 0;
    const totalMinutes = convertToMinutes(hours, newMinutesInt);
    
    // Ensure we don't exceed 120 minutes
    if (totalMinutes <= 120) {
      onChange(totalMinutes);
    }
  };

  // Validation: minimum 5 minutes, maximum 120 minutes
  const totalMinutes = convertToMinutes(hours, minutes);
  const isValid = totalMinutes >= 5 && totalMinutes <= 120;

  return (
    <div>
      <Group spacing="md" align="flex-start">
        <div style={{ flex: 1 }}>
          <Text size="xs" color="dimmed" mb={4}>
            {tc('hours') || 'Hours'}
          </Text>
          <Select
            data={hourOptions}
            value={hours.toString()}
            onChange={handleHourChange}
            placeholder={tc('selectHours') || 'Select hours'}
            searchable
            clearable={false}
            {...props}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Text size="xs" color="dimmed" mb={4}>
            {tc('minutes') || 'Minutes'}
          </Text>
          <Select
            data={minuteOptions}
            value={minutes.toString()}
            onChange={handleMinuteChange}
            placeholder={tc('selectMinutes') || 'Select minutes'}
            searchable
            clearable={false}
            error={!isValid && (tc('timeIntervalMustBeBetween5And120Minutes') || 'Time interval must be between 5 and 120 minutes')}
            {...props}
          />
        </div>
      </Group>
      {!isValid && (
        <Text size="xs" color="red" mt={4}>
          {tc('timeIntervalMustBeBetween5And120Minutes') || 'Time interval must be between 5 and 120 minutes'}
        </Text>
      )}
      <Text size="xs" color="dimmed" mt={4}>
        {tc('totalInterval') || 'Total interval'}: {totalMinutes} {tc('minutes') || 'minutes'}
        {hours > 0 && ` (${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'})`}
      </Text>
    </div>
  );
};

export default TimeIntervalSelector;