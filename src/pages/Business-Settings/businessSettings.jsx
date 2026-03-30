import React from "react";
import { ChevronRight, FileText, Settings } from "lucide-react";
import {
  BusinessDetailsIcon,
  ServiceSetupIcon,
} from "../../components/common/Svgs";
import { StaffManagementIcon } from "../../components/icons";
import { useNavigate } from "react-router-dom";

import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

// Bell icon matching the same color as other icons (#93AFD6)
const AutomatedRemindersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" fill="#93AFD6"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#93AFD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BusinessSettings = () => {
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();

  const serviceCards = [
    {
      id: 1,
      title: tc('businessInformation'),
      description: tc('businessInformationDescription'),
      icon: <BusinessDetailsIcon className="w-3 h-3" />,
      path: "/dashboard/business-setting/details",
    },
    {
      id: 2,
      title: tc('setUpServices'),
      description: tc('setUpServicesDescription'),
      icon: <ServiceSetupIcon className="w-3 h-3" />,
      path: "/dashboard/business-setting/service-setup",
    },
    {
      id: 3,
      title: tc('staffManagement'),
      description: tc('manageYourTeamDescription'),
      icon: <StaffManagementIcon />,
      path: "/dashboard/staff-management",
    },
    {
      id: 4,
      title: tc('automatedAppointmentReminders'),
      description: tc('appointmentReminders'),
      icon: <AutomatedRemindersIcon />,
      path: "/dashboard/business-setting/appointment-reminders",
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <BatchTranslationLoader>
      <div className="bg-gray-100 flex flex-row justify-center w-full">
        <div className="bg-white rounded-xl overflow-x-hidden overflow-y-auto w-full h-[83vh] relative">
          <div className="w-full px-4 md:px-8 py-8 md:py-8">
            <div className="flex flex-col gap-4 md:gap-6 max-w-4xl">
              {serviceCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.path)}
                  className="w-full md:w-[550px] h-auto md:h-[140px] border border-solid border-[#eaeaea] shadow-[0px_27px_37px_-27px_#262c3d1a] rounded-[20px] bg-white cursor-pointer hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-0 h-full">
                    <div className="relative w-full h-full flex items-center px-4 md:px-6 py-4 md:py-0">
                      <ChevronRight className="absolute w-5 h-5 top-1/2 transform -translate-y-1/2 right-4 md:right-6 cursor-pointer" />

                      <div className="flex flex-col w-full items-start gap-2.5 pr-8">
                        <div className="flex flex-col items-start gap-1 relative self-stretch w-full">
                          <div className="inline-flex items-center gap-[19px]">
                            {card.icon}
                            <div className="font-['Outfit',Helvetica] font-medium text-[#323334] text-base md:text-[18px] tracking-[0] leading-[22px] md:leading-[25px] whitespace-nowrap cursor-pointer">
                              {card.title}
                            </div>
                          </div>

                          <p className="font-['Outfit',Helvetica] font-normal text-[#929699] text-sm md:text-md tracking-[0] leading-[20px] md:leading-[22px]">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default BusinessSettings;
