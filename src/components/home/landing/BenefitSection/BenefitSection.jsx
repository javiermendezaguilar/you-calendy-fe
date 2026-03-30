import React from "react";
import { Paper, Title, Text, Box, Group } from "@mantine/core";
import TickIcon from "../../../../assets/Tick.png";
import BenefitIcon from "../../../../assets/calender.png";
import CandyIcon from "../../../../assets/hero-candy.png";
import { motion } from "framer-motion";

const BenefitItem = ({ text }) => {
  return (
    <Group gap="xs" className="w-full">
      <Box className="mr-2">
        <img className="w-[16px] h-[16px]" src={TickIcon} alt="Tick-icon" />
      </Box>
      <Text className="!text-[#333333] !text-sm md:!text-md !font-light !tracking-[0.02em]">
        {text}
      </Text>
    </Group>
  );
};

const BenefitList = () => {
  return (
    <Box className="flex flex-col items-start gap-3">
      <BenefitItem text="Store haircut history & personal preferences." />
      <BenefitItem text="Add private notes for each client." />
      <BenefitItem text="Quick access to client details before appointments." />
    </Box>
  );
};

export const BenefitSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="md:w-2/5 w-full !flex-1 mt-10 md:mt-0"
    >
      <Paper
        className="!bg-[#F9FFF8] !px-4 !py-6 md:!py-8 md:!px-10 lg:!px-16 !rounded-xl h-full"
        radius="xl"
        withBorder={false}
      >
        <Box className="flex flex-col items-start gap-[20px]">
          <img
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
            src={BenefitIcon}
            alt="Benefit-icon"
          />
          <Title
            order={2}
            className="!text-[#556B2F] !text-2xl md:!text-3xl !font-bold"
          >
            Struggling to remember client preferences?
          </Title>
          <Box className="flex flex-col items-start gap-4">
            <Text className="!text-[#1C315E] !text-xl md:!text-2xl !font-normal">
              Solution!
            </Text>
            <BenefitList />
          </Box>
          <Group gap="xs" className="items-center mt-4">
            <img className="w-[8px] h-[24px]" src={CandyIcon} alt="Candy-icon" />
            <Text className="!text-black !text-lg md:!text-xl !font-medium !tracking-[0.02em]">
              Personalized service = Happy & loyal clients!
            </Text>
          </Group>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default BenefitSection;
