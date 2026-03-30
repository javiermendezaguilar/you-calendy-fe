import { Button, Title, Text, Container } from "@mantine/core";
import booking from "../../../assets/booking-background.webp";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroTitle = () => (
  <Title order={1} className="text-5xl font-semibold max-md:max-w-full max-md:text-[40px] max-md:leading-[53px]">
    Simplify Your Barber Business
    <Text component="span" className="!block !font-semibold !text-2xl !mb-4">
      More Bookings, Less Hassle!
    </Text>
  </Title>
);

const HeroDescription = () => (
  <Text className="text-lg font-normal leading-8 tracking-[0.52px] mt-8 max-md:max-w-full">
    Barbers waste hours managing appointments—YouCalendy does it for
    you! Get 24/7 self-booking, automated reminders, and an organized
    schedule. Focus on your craft while we handle the rest.
  </Text>
);

const ActionButton = () => (
  <Link to="/registration" data-allow-without-login>
    <Button
      size="md"
      className="!bg-[rgba(85,107,47,1)] !w-[200px] !max-w-full !font-normal !mt-8 !p-2.5 !rounded-lg hover:!bg-opacity-90 !transition-all hover:!transform hover:!-translate-y-1"
      aria-label="Get Started"
    >
      Get Started Today
    </Button>
  </Link>
);

const Booking = () => {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="flex flex-col relative z-10 w-full items-center text-white justify-center px-[20%] py-32 max-md:max-w-full max-md:px-5 max-md:py-[100px]"
      role="banner"
      aria-label="Main hero section"
    >
      <img
        src={booking}
        alt="Hero background"
        className="absolute h-full w-full object-cover inset-0"
        loading="eager"
        aria-hidden="true"
      />
      <Container className="relative flex w-full flex-col items-center max-md:max-w-full">
        <div className="flex w-full flex-col items-center text-center">
          <HeroTitle />
          <HeroDescription />
        </div>
        <ActionButton />
      </Container>
    </motion.header>
  );
};

export default Booking;
