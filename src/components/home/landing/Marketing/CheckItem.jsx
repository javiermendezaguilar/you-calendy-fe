import { Group, Text } from '@mantine/core';
import TickIcon from "../../../../assets/Tick.png"

export function CheckItem({ children }) {
  return (
    <Group gap="xs" align="start" className="items-start sm:items-center">
      <img 
        className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] mt-1 sm:mt-0" 
        src={TickIcon} 
        alt="Checkmark" 
        aria-hidden="true" 
      />
      <Text className="!text-[#333333] !text-xs sm:!text-sm md:!text-md !font-light !tracking-[0.02em]">{children}</Text>
    </Group>
  );
}

export default CheckItem;
