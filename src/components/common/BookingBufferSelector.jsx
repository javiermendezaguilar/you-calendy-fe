import React from "react";
import { Select, Group, Text } from "@mantine/core";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const BookingBufferSelector = ({ value, onChange, minMinutes = 0, maxMinutes = 1440, ...props }) => {
  const { tc } = useBatchTranslation();

  const parseValue = (totalMinutes) => {
    const initial = Number.isFinite(totalMinutes) ? totalMinutes : minMinutes;
    const hours = Math.floor(initial / 60);
    const minutes = initial % 60;
    return { hours, minutes };
  };

  const convertToMinutes = (hours, minutes) => hours * 60 + minutes;

  const { hours, minutes } = parseValue(value);

  const maxHours = Math.floor(maxMinutes / 60);
  const hourOptions = Array.from({ length: maxHours + 1 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "0 hours" : i === 1 ? "1 hour" : `${i} hours`,
  }));

  const getMinuteBounds = (selectedHours) => {
    const maxForHour = Math.max(0, Math.min(59, maxMinutes - (selectedHours * 60)));
    const minForHour = Math.max(0, Math.min(59, minMinutes - (selectedHours * 60)));
    const start = Math.max(0, Math.min(59, minForHour));
    const end = Math.max(start, maxForHour);
    return { start, end };
  };

  const getMinuteOptions = (selectedHours) => {
    const { start, end } = getMinuteBounds(selectedHours);
    return Array.from({ length: end - start + 1 }, (_, idx) => {
      const i = start + idx;
      return {
        value: i.toString(),
        label: i === 0 ? "0 minutes" : i === 1 ? "1 minute" : `${i} minutes`,
      };
    });
  };

  const minuteOptions = getMinuteOptions(hours);

  const handleHourChange = (newHours) => {
    const newHoursInt = parseInt(newHours) || 0;
    let newMinutes = minutes;
    const total = convertToMinutes(newHoursInt, newMinutes);
    const { start, end } = getMinuteBounds(newHoursInt);
    if (total > maxMinutes) newMinutes = Math.min(end, newMinutes);
    if (convertToMinutes(newHoursInt, newMinutes) < minMinutes) newMinutes = Math.max(start, newMinutes);
    const clamped = Math.min(end, Math.max(start, newMinutes));
    onChange(convertToMinutes(newHoursInt, clamped));
  };

  const handleMinuteChange = (newMinutesVal) => {
    const newMinutesInt = parseInt(newMinutesVal) || 0;
    const total = convertToMinutes(hours, newMinutesInt);
    if (total >= minMinutes && total <= maxMinutes) {
      onChange(total);
    }
  };

  const totalMinutes = convertToMinutes(hours, minutes);
  const isValid = totalMinutes >= minMinutes && totalMinutes <= maxMinutes;

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
            error={!isValid && (`${tc('mustBeBetween') || 'Must be between'} ${minMinutes} ${tc('minutes') || 'minutes'} ${tc('and') || 'and'} ${maxMinutes} ${tc('minutes') || 'minutes'}`)}
            {...props}
          />
        </div>
      </Group>
      {!isValid && (
        <Text size="xs" color="red" mt={4}>
          {`${tc('mustBeBetween') || 'Must be between'} ${minMinutes} ${tc('minutes') || 'minutes'} ${tc('and') || 'and'} ${maxMinutes} ${tc('minutes') || 'minutes'}`}
        </Text>
      )}
      <Text size="xs" color="dimmed" mt={4}>
        {tc('totalInterval') || 'Total interval'}: {totalMinutes} {tc('minutes') || 'minutes'}
        {hours > 0 && ` (${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'})`}
      </Text>
    </div>
  );
};

export default BookingBufferSelector;