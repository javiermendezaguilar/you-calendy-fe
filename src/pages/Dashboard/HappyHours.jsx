import { Button, Skeleton, Text, Group } from "@mantine/core";
import React, { useState } from "react";
import { IoArrowBackCircleOutline, IoChevronForward } from "react-icons/io5";
import { Link } from "react-router-dom";
import CommonModal from "../../components/common/CommonModal";
import HappyHoursForm from "../../components/barber/marketing/HappyHoursForm";
import { useDisclosure } from "@mantine/hooks";
import { useGetPromotions, useTogglePromotionStatus } from "../../hooks/useMarketing";
import { useMemo } from "react";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const HappyHours = () => {
  const { tc } = useBatchTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedDay, setSelectedDay] = useState("");
  const { data: promotions, isLoading } = useGetPromotions();
  const toggleMutation = useTogglePromotionStatus();
  const [flashSaleOverlap, setFlashSaleOverlap] = useState(null);
  const [pendingPromotionId, setPendingPromotionId] = useState(null);
  const [flashSaleModalOpened, { open: openFlashSaleModal, close: closeFlashSaleModal }] = useDisclosure(false);
  const [loadingButton, setLoadingButton] = useState(null); // Track which button is loading

  const activeDays = useMemo(() => {
    const daysState = {
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false,
    };
    if (promotions) {
      promotions.forEach((promo) => {
        const day =
          promo.dayOfWeek.charAt(0).toUpperCase() + promo.dayOfWeek.slice(1);
        if (daysState.hasOwnProperty(day)) {
          daysState[day] = promo.isActive;
        }
      });
    }
    return daysState;
  }, [promotions]);

  // Map promotions by day for easy lookup
  const promotionsByDay = useMemo(() => {
    const map = {};
    if (promotions) {
      promotions.forEach((promo) => {
        const day =
          promo.dayOfWeek.charAt(0).toUpperCase() + promo.dayOfWeek.slice(1);
        map[day] = promo; // Include all promotions, not just active ones
      });
    }
    return map;
  }, [promotions]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    open();
  };

  const getPromotionForDay = (day) => {
    return promotionsByDay[day] || null;
  };

  // Use stable English keys for indexing, and translated labels for display
  const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = dayKeys.map((key) => ({ key, label: tc(key.toLowerCase()) }));

  const handleFormClose = () => {
    close();
  };

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] p-4 overflow-auto">
        <div className="flex justify-between items-center">
          <Link
            to={"/dashboard/marketing/promotions"}
            className="flex w-auto mb-4"
          >
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
        </div>
        <div className="lg:w-1/2">
          <p className="text-2xl text-slate-800 font-semibold">
            {tc('manageYourHappyHours')}
          </p>
          <p className="text-sm text-slate-400">
            {tc('happyHoursDescription')}
          </p>

          <div className="md:w-2/3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton height={10} width={10} radius="xl" />
                      <Skeleton height={16} width="15%" />
                    </div>
                    <div className="flex gap-2 items-center justify-between">
                      <div>
                        <Skeleton height={24} width="20%" mb="sm" />
                        <Skeleton height={16} width="30%" />
                      </div>
                      <Skeleton height={20} width={20} radius="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              days.map(({ key, label }, i) => {
              const promotion = getPromotionForDay(key);
              const isActive = promotion?.isActive || false;
              return (
                <div key={i} className="my-4">
                  <p className={`text-stone-500 flex items-center gap-2 ${isActive ? "text-green-600" : ""}`}>
                    <span className={`${isActive ? "bg-green-600" : "bg-stone-600"} w-2.5 h-2.5 rounded-2xl block`}></span>
                    {isActive ? tc('active') : tc('inactive')}
                  </p>
                  <div
                    onClick={() => handleDayClick(key)}
                    className={`cursor-pointer flex gap-4 items-center justify-between px-6 py-5 ${isActive ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"} border rounded-xl`}
                  >
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-stone-800 mb-1">
                        {label}
                      </p>
                      {promotion ? (
                        <div className="mt-2">
                          <p className="text-stone-600 font-medium text-sm">
                            {promotion.startTime} - {promotion.endTime}
                          </p>
                          <p className="text-green-600 font-semibold text-sm">
                            {promotion.discountPercentage}% {tc('off')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-stone-500 font-light mt-2">
                          {tc('selectTimeAndDiscount')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {promotion && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only check for flash sale overlap when activating (not when deactivating)
                            if (!promotion.isActive) {
                              toggleMutation.mutate(
                                { id: promotion._id },
                                {
                                  onError: (error) => {
                                    console.log("Toggle error:", error);
                                    console.log("Is flash sale overlap:", error.isFlashSaleOverlap);
                                    if (error.isFlashSaleOverlap) {
                                      console.log("Flash sale data:", error.flashSaleData);
                                      setFlashSaleOverlap(error.flashSaleData);
                                      setPendingPromotionId(promotion._id);
                                      setLoadingButton(null); // Reset loading state when opening modal
                                      openFlashSaleModal();
                                    }
                                  },
                                }
                              );
                            } else {
                              // Deactivating - no need to check for overlap
                              toggleMutation.mutate({ id: promotion._id });
                            }
                          }}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                            promotion.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {promotion.isActive ? tc("active") : tc("inactive")}
                        </button>
                      )}
                      <IoChevronForward color="#93AFD6" size={20} />
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
        <CommonModal
          opened={opened}
          onClose={handleFormClose}
          content={
            <HappyHoursForm 
              close={handleFormClose} 
              day={selectedDay} 
              existingPromotion={getPromotionForDay(selectedDay)}
            />
          }
          size="md"
          styles={{
            body: {
              maxHeight: "85vh",
              overflowY: "auto",
            }
          }}
        />

        {/* Flash Sale Overlap Modal */}
        <CommonModal
          opened={flashSaleModalOpened}
          onClose={closeFlashSaleModal}
          content={
            flashSaleOverlap && (
              <div className="p-6 flex flex-col items-center">
                <h2 className="text-xl font-semibold text-[#343a40] mb-4 text-center">
                  {tc('flashSaleOverlapTitle') || 'Flash Sale Conflict'}
                </h2>
                
                {flashSaleOverlap.existingFlashSales && flashSaleOverlap.existingFlashSales.length > 0 && (
                  <div className="w-full mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Text size="sm" c="dimmed" mb="xs" fw={500}>
                      {tc('activeFlashSale') || 'Active Flash Sale'}
                    </Text>
                    {flashSaleOverlap.existingFlashSales.map((sale, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <Text size="sm" fw={500}>{sale.name}</Text>
                        <Text size="sm" c="dimmed">
                          {sale.discountPercentage}% {tc('off')}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-slate-600 mb-6 text-center">
                  {tc('applyBothDiscountsQuestion') || 'Apply both discounts during happy hour time?'}
                </p>
                
                <div className="w-full flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (pendingPromotionId) {
                        setLoadingButton('no');
                        toggleMutation.mutate(
                          { id: pendingPromotionId, applyBothDiscounts: false },
                          {
                            onSuccess: () => {
                              closeFlashSaleModal();
                              setFlashSaleOverlap(null);
                              setPendingPromotionId(null);
                              setLoadingButton(null);
                            },
                            onError: () => {
                              setLoadingButton(null);
                            },
                          }
                        );
                      }
                    }}
                    loading={loadingButton === 'no' && toggleMutation.isPending}
                    disabled={toggleMutation.isPending}
                    className="!flex-1 !py-2 !rounded-lg !font-medium"
                  >
                    {tc('noOnlyHappyHour') || 'No, Only Happy Hour'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (pendingPromotionId) {
                        setLoadingButton('yes');
                        toggleMutation.mutate(
                          { id: pendingPromotionId, applyBothDiscounts: true },
                          {
                            onSuccess: () => {
                              closeFlashSaleModal();
                              setFlashSaleOverlap(null);
                              setPendingPromotionId(null);
                              setLoadingButton(null);
                            },
                            onError: () => {
                              setLoadingButton(null);
                            },
                          }
                        );
                      }
                    }}
                    loading={loadingButton === 'yes' && toggleMutation.isPending}
                    disabled={toggleMutation.isPending}
                    className="!flex-1 !py-2 !rounded-lg !font-medium !bg-[#343a40] hover:!bg-black"
                  >
                    {tc('yesApplyBoth') || 'Yes, Apply Both'}
                  </Button>
                </div>
              </div>
            )
          }
        />
      </div>
    </BatchTranslationLoader>
  );
};

export default HappyHours;
