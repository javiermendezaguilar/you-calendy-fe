import React from "react";
import { Button, Title, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import barberBackground from "../../assets/background.webp";
import { HeaderLogoLight } from "../../components/common/Svgs";

const Header = () => (
  <div className="w-full py-6 bg-[#323334] flex items-center justify-center rounded-[32px_32px_0px_0px]">
    <HeaderLogoLight className="text-white" />
  </div>
);

const WelcomeContent = () => (
  <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
    <div className="flex flex-col items-center gap-6">
      <header className="flex flex-col items-center">
        <Title
          order={2}
          className="text-[#323334] text-center text-2xl font-bold leading-[32px]"
        >
          Welcome to YouCalendy
        </Title>
        <Title
          order={3}
          className="text-[#323334] text-center text-xl font-bold leading-[32px]"
        >
          your ultimate scheduling assistant!
        </Title>
      </header>
      <div className="flex flex-col items-center gap-4">
        <p className="text-[#323334] text-center text-sm font-light">
          YouCalendy is designed to streamline your workflow. Manage
          appointments, set work schedules, accept payments, track analytics,
          and keep everything organized—all from one easy-to-use platform.
        </p>
        <p className="text-[#323334] text-center text-sm font-light">
          And when you're on the go, use YouCalendy on your mobile device to
          access key features and stay in control of your business anytime,
          anywhere.
        </p>
      </div>
    </div>
  </div>
);

const ActionButton = ({ onClick }) => (
  <div className=" max-sm:inset-x-4 px-10 pt-10 pb-6">
    <Button
      onClick={onClick}
      fullWidth
      size="md"
      radius="md"
      color="#323334"
      aria-label="Continue to next step"
    >
      Next
    </Button>
  </div>
);

const Welcome = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/plan");
  };

  return (
    <main
      className="flex justify-center items-center w-full h-screen overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${barberBackground})` }}
      role="main"
      aria-label="Welcome to YouCalendy"
    >
      <div
        className=" w-[480px]  bg-white shadow-[0px_100px_150px_-27px_rgba(38,44,61,0.12)] rounded-[32px] border-[3px] border-[#D9E2F4] max-md:w-[90%] max-sm:w-[95%] max-sm:h-auto"
        role="region"
        aria-label="Welcome content"
      >
        <Header />
        <WelcomeContent />
        <ActionButton onClick={handleNext} />
      </div>
    </main>
  );
};

export default Welcome;
