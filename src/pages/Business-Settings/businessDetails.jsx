import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import { IoArrowBackCircleOutline, IoChevronForward } from "react-icons/io5";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const BusinessDetail = () => {
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();

  const businessSections = [
    {
      title: tc('businessOverview'),
      description: tc('businessOverviewDescription'),
      path: "/dashboard/business-setting/business-info",
    },
    {
      title: tc('workingHours'),
      description: tc('workingHoursDescription'),
      path: "/dashboard/business-setting/business-hours",
    },
    {
      title: tc('uploadYourPhoto'),
      description: tc('uploadYourPhotoDescription'),
      path: "/dashboard/business-setting/profile-images",
    },
    {
      title: tc('officeLocation'),
      description: tc('officeLocationDescription'),
      path: "/dashboard/business-setting/location",
    },
  ];

  const handleSectionClick = (path) => {
    navigate(path);
  };

  return (
    <main className="h-[83vh] overflow-auto bg-white mx-auto p-4 sm:p-6 rounded-xl">
      <Link to={-1} className="flex w-auto">
        <Button
          size="lg"
          className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:!text-sm max-md:!py-2 max-md:!px-4 max-md:size-md"
        >
          <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
        </Button>
      </Link>

      <h1 className="text-[#323334] text-xl sm:text-2xl font-semibold mt-6 sm:mt-10 mb-6 sm:mb-10">
        {tc('businessDetail')}
      </h1>

      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full sm:max-w-[600px]">
        {businessSections.map((section, index) => (
          <div
            key={index}
            onClick={() => handleSectionClick(section.path)}
            className="w-full border shadow-[0px_27px_37px_-27px_rgba(38,44,61,0.10)] bg-white rounded-xl sm:rounded-2xl border-solid border-[#EBEBEB] cursor-pointer transition-transform hover:scale-[1.01] duration-200"
          >
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 min-h-[100px] sm:min-h-[120px]">
              <div className="pr-3 sm:pr-6">
                <h3 className="text-[#323334] text-base sm:text-lg font-medium leading-[22px] sm:leading-[25px] mb-1 sm:mb-2">
                  {section.title}
                </h3>
                <p className="text-[#939799] text-xs sm:text-sm md:text-md font-normal leading-[18px] sm:leading-[20px] md:leading-[22px]">
                  {section.description}
                </p>
              </div>
              <div className="flex items-center justify-center ml-2 sm:ml-0">
                <IoChevronForward size={18} className="sm:w-5 sm:h-5 text-[#93AFD6]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default BusinessDetail;
