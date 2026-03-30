import { Paper, Box, Title, Text, Group, Stack } from '@mantine/core';
import CheckItem from "./CheckItem";
import SignUpButton from "./SignupButton";
import SmsIcon from "../../../../assets/sms.png"
import BarberPole from "../../../../assets/hero-candy.png"
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

export function MarketingHero() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full"
    >
      <Paper className="!w-full !min-h-[430px] md:!h-[530px] !max-w-[1002px] !rounded-lg sm:!rounded-xl !bg-[#F9FFF8] !p-3 sm:!p-4 md:!p-6 lg:!px-16  !mt-[30px] sm:!mt-[50px] md:!mt-[101px] lg:!mt-[131px]" radius="xl" withBorder={false}>
        <Box className="mb-3 md:mb-6 flex h-[25px] w-[25px] sm:h-[30px] sm:w-[30px] md:h-[40px] md:w-[40px] items-center justify-center rounded-[10px] !bg-[#F1FFE9]">
          <img src={SmsIcon} alt="SMS" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-auto md:h-auto" />
        </Box>
        
        <Title className="!mb-2 !text-lg sm:!text-xl md:!text-2xl lg:!text-3xl !font-semibold !text-[#556B2F]">
          <span className="block">Informing Clients About Closures Or</span>
          <span className="block">Promotions Is Time Consuming?</span>
        </Title>
        
        <Title className="!mb-4 !text-base md:!text-lg !font-medium !text-black">
          Solution!
        </Title>
        
        <Stack className="mb-4 sm:mb-6 md:mb-10" gap="xs" sm:gap="sm" md:gap="md">
          <CheckItem>Send bulk messages for promotions & updates.</CheckItem>
          <CheckItem>Automated reminders for upcoming appointments.</CheckItem>
          <CheckItem>
            Ready-to-use SMS templates for quick communication.
          </CheckItem>
        </Stack>
        
        <Group className="mb-4 sm:mb-6 md:mb-6" gap="xs" align="center">
          <img className="h-[15px] sm:h-[20px] md:h-[30px] w-[5px] sm:w-[7px] md:w-[10px]" src={BarberPole} alt="Barber pole" />
          <Text className="!text-sm sm:!text-base md:!text-lg lg:!text-xl !text-black">
            Keep clients engaged & increase repeat bookings!
          </Text>
        </Group>
        
        <Link to="/registration">
          <SignUpButton className="!bg-[#526B2F] !text-xs sm:!text-sm md:!text-md" data-allow-without-login/>
        </Link>
      </Paper>
    </motion.div>
  );
}

export default MarketingHero;
