import { Button } from "@mantine/core";
import React, { useMemo } from "react";
import { IoArrowBackCircleOutline, IoChevronForward } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useGetFlashSales, useGetPromotions } from "../../hooks/useMarketing";

const Promotion = () => {
  const { tc } = useBatchTranslation();
  const { data: flashSales = [] } = useGetFlashSales();
  const { data: promotions = [] } = useGetPromotions();

  // Check if any flash sale is currently active
  const hasActiveFlashSale = useMemo(() => {
    if (!flashSales || !Array.isArray(flashSales)) return false;
    const now = new Date();
    return flashSales.some((sale) => {
      if (!sale.isActive) return false;
      const startDate = new Date(sale.startDate);
      const endDate = new Date(sale.endDate);
      return now >= startDate && now <= endDate;
    });
  }, [flashSales]);

  // Check if any happy hour (promotion) is active
  const hasActiveHappyHours = useMemo(() => {
    if (!promotions || !Array.isArray(promotions)) return false;
    return promotions.some((promo) => promo.isActive === true);
  }, [promotions]);

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] p-4 overflow-auto">
        <Link to={"/dashboard/marketing"} className="flex w-auto mb-4">
          <Button
            size="lg"
            className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
          >
            <IoArrowBackCircleOutline
              size={24}
              className="me-2 hidden sm:block"
            />{" "}
            {tc('goBack')}
          </Button>
        </Link>
        <p className="text-2xl text-slate-800 font-semibold">
          {tc('boostYourBookingsWithSmartPromotions')}
        </p>
        <p className="text-sm text-slate-400">
          {tc('attractMoreClientsWithTimeLimitedDiscounts')}
        </p>

        <div className="flex flex-col gap-10 my-10 ">
          <Link to={"/dashboard/marketing/promotions/flash-sale"}>
            <div className={`cursor-pointer flex items-center justify-between lg:w-1/2 px-6 py-6 border rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] ${
              hasActiveFlashSale 
                ? "bg-green-50 border-green-100" 
                : "bg-white border-slate-200"
            }`}>
              <div>
                <p className={`flex items-center gap-2 font-light ${
                  hasActiveFlashSale ? "text-green-600" : "text-stone-600"
                }`}>
                  <span className={`w-2 h-2 block rounded-2xl ${
                    hasActiveFlashSale ? "bg-green-600" : "bg-stone-500"
                  }`}></span>
                  {hasActiveFlashSale ? tc('active') : tc('inactive')}
                </p>

                <p className="text-xl text-slate-800">{tc('flashSale')}</p>

                <p className="text-slate-500">
                  {tc('boostYourSalesByPromotingExclusiveDeals')}
                </p>
              </div>
              <IoChevronForward color="#93AFD6" size={20} />
            </div>
          </Link>
          <Link to={"/dashboard/marketing/promotions/happy-hours"}>
            <div className={`cursor-pointer flex items-center justify-between lg:w-1/2 px-6 py-6 border rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] ${
              hasActiveHappyHours 
                ? "bg-green-50 border-green-100" 
                : "bg-white border-slate-200"
            }`}>
              <div>
                <p className={`flex items-center gap-2 font-light ${
                  hasActiveHappyHours ? "text-green-600" : "text-stone-600"
                }`}>
                  <span className={`w-2 h-2 block rounded-2xl ${
                    hasActiveHappyHours ? "bg-green-600" : "bg-stone-500"
                  }`}></span>
                  {hasActiveHappyHours ? tc('active') : tc('inactive')}
                </p>
                <p className="text-xl text-slate-800">{tc('happyHours')}</p>

                <p className="text-slate-500">
                  {tc('encourageMoreBookingsByOfferingSpecialRates')}
                </p>
              </div>
              <IoChevronForward color="#93AFD6" size={20} />
            </div>
          </Link>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default Promotion;
