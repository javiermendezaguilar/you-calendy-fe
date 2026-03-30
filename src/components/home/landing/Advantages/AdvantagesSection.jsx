import { Container, Title, Text } from "@mantine/core";
import FeatureList from "./FeatureList";
import AppointmentCard from "./AppointmentCard";
import { motion } from "framer-motion";

const AdvantagesSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      id="advantages"
      className="flex flex-col items-center w-full mt-8 sm:mt-12 md:mt-16 lg:mt-20 bg-white sm:px-4"
    >
      <Container
        size="xl"
        className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full"
      >
        <header className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-full">
          <Title
            order={1}
            className="!text-[#036] !text-center !text-2xl sm:!text-3xl md:!text-4xl !font-bold !leading-normal"
          >
            Advantages
          </Title>
          <Text className="!text-[#333] !text-center !text-sm sm:!text-base md:!text-lg !font-normal !max-w-[840px] !leading-normal">
            Seamless tools designed to save your time and enhance client
            satisfaction.
          </Text>
        </header>
        <div className="flex w-full mt-4 sm:mt-6 flex-col md:flex-row md:items-stretch ">
          <FeatureList />
          <AppointmentCard />
        </div>
      </Container>
    </motion.section>
  );
};

export default AdvantagesSection;
