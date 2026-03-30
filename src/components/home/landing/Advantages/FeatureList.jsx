import { Paper, Title, Text, Button, Box } from '@mantine/core';
import AppointmentIcon from "../../../../assets/Appointment.png";
import TickIcon from "../../../../assets/Tick.png";
import CandyIcon from "../../../../assets/hero-candy.png";
import { Link } from 'react-router-dom';
const FeatureList = () => {
  return (
    <Paper className="h-full !w-full md:!flex-1 !bg-[#F8FBFF] !p-4 sm:!p-6 md:!p-8 !rounded-xl md:!rounded-l-xl md:!rounded-r-none mb-6 md:mb-0" radius="xl" withBorder={false} mt={40}>
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 h-full">
        <Box className="w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] flex items-center justify-center !bg-[#E9F2FF] rounded-[9.578px]">
          <img src={AppointmentIcon} alt="check-icon" className="max-w-[65%] md:max-w-[75%]" />
        </Box>
        <Title order={2} className="!text-[#036] !text-xl sm:!text-2xl md:!text-3xl !font-bold !tracking-[0.5px] !max-w-[817px]">
          Annoying calls outside work hours?
        </Title>
        <Text className="!text-[#556B2F] !text-lg sm:!text-xl md:!text-2xl !font-normal">
          Solution!
        </Text>
        <div className="flex flex-col gap-2 ">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <img className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] mt-1 sm:mt-0" src={TickIcon} alt="Tick-icon" />
            <Text className="!text-[#333] !text-xs sm:!text-sm md:!text-md !font-light">
              24/7 client self-booking.
            </Text>
          </div>
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <img className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] mt-1 sm:mt-0" src={TickIcon} alt="Tick-icon" />
            <Text className="!text-[#333] !text-xs sm:!text-sm md:!text-md !font-light">
              Automated reminders reduce no-shows and keep your schedule
              organized
            </Text>
          </div>
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <img className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] mt-1 sm:mt-0" src={TickIcon} alt="Tick-icon" />
            <Text className="!text-[#333] !text-xs sm:!text-sm md:!text-md !font-light">
              Customize your calendar to fit your working hours and availibility
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-1">
          <img className="w-[6px] h-[18px] sm:w-[8px] sm:h-[24px]" src={CandyIcon} alt="Candy-icon" />
          <Text className="!text-black !text-sm sm:!text-lg md:!text-xl !font-medium">
            Focus on your craft --- our app takes care of the rest!
          </Text>
        </div>
        <div>
          <Link to="/registration" data-allow-without-login>
            <Button 
              className="!bg-[#036] !text-white !text-sm sm:!text-base md:!text-lg !font-normal !px-3 sm:!px-4 !py-1.5 sm:!py-2 !rounded-lg !hover:bg-[#002a4c]"
              radius="lg"
              size="md"
            >
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </Paper>
  );
};

export default FeatureList;
