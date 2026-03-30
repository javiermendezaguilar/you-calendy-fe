import React, { useEffect, useState } from "react";
import { Button, rem, Skeleton } from '@mantine/core';
import { toast } from 'sonner';
import greenTick from '../../assets/greenTick.png';
import rectangle from '../../assets/rectangle.png';
import { HeaderLogo } from "../../components/common/Svgs";
import { useNavigate } from 'react-router-dom';
import { useCreateSubscription, useStartFreeTrial, useSubscriptionStatus } from '../../hooks/useSubscription';
import { useGetPlans } from '../../hooks/usePlans';
import CommonModal from "../../components/common/CommonModal";

const Plan = () => {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialPlanInfo, setTrialPlanInfo] = useState(null); // { amount, currency, billingInterval, title }
  const [activeTrialModalOpen, setActiveTrialModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // API hooks
  const { data: plans, isLoading: plansLoading, error: plansError } = useGetPlans();
  const { data: subscriptionStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useSubscriptionStatus();
  const createSubscriptionMutation = useCreateSubscription();
  const startTrialMutation = useStartFreeTrial();

  // Ensure trial UI is hidden if status is not null/undefined/'none'
  useEffect(() => {
    const statusValue = subscriptionStatus?.data?.status;
    const allowedTrial = statusValue == null || statusValue === 'none';
    if (!allowedTrial) {
      if (trialModalOpen) setTrialModalOpen(false);
      if (trialPlanInfo) setTrialPlanInfo(null);
    }
  }, [subscriptionStatus, trialModalOpen, trialPlanInfo]);

  // On first mount, force a refetch so newly registered accounts get fresh status
  useEffect(() => {
    refetchStatus?.();
  }, []);
  
  // Debug subscription status loading
  console.log('Subscription Status Loading:', statusLoading);
  console.log('Subscription Status Error:', statusError);
  console.log('Subscription Status Data:', subscriptionStatus);
  console.log('Subscription Status Data Details:', JSON.stringify(subscriptionStatus, null, 2));
  
  const isLoading = createSubscriptionMutation.isPending || startTrialMutation.isPending || plansLoading;



  // Convert API plan features to display format
  const formatPlanFeatures = (features) => {
    return features?.map(feature => ({
      icon: greenTick,
      text: feature
    })) || [];
  };

  // Format plan price for display
  const formatPrice = (amount, currency = 'usd') => {
    const currencySymbols = {
      usd: '$',
      eur: '€',
      gbp: '£',
      cad: 'C$',
      aud: 'A$'
    };
    return `${currencySymbols[currency] || '$'}${amount.toFixed(2)}`;
  };

  // Get billing interval display text
  const getBillingText = (interval) => {
    const intervalMap = {
      day: 'daily',
      week: 'weekly', 
      month: 'monthly',
      year: 'yearly'
    };
    return intervalMap[interval] || 'monthly';
  };

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    console.log(`Selected plan: ${planId}`);
  };

  const handleUpgradeToPlan = async (priceId) => {
    try {
      if (!priceId) {
        console.error('Missing Stripe price ID for selected plan');
        return;
      }

      // Wait for subscription status to load
      if (statusLoading) {
        console.log('Subscription status still loading, please wait...');
        return;
      }

      if (statusError) {
        console.error('Error fetching subscription status:', statusError);
        toast.error('Failed to check subscription status. Please try again.');
        return;
      }

      console.log('Subscription Status:', subscriptionStatus);
      
      // Extract the actual data from the API response
      const statusData = subscriptionStatus?.data;
      console.log('Status Data:', statusData);
      console.log('Status value:', statusData?.status);
      console.log('Days left:', statusData?.daysLeft);
      console.log('Message:', statusData?.message);
      console.log('Checking trial status...');
      
      // If no subscription status data, we can't determine trial status
      if (!subscriptionStatus || !statusData) {
        console.log('No subscription status data available, proceeding with normal flow');
        // Proceed with normal subscription creation
      } else {

      // Check if trial has ended - if so, redirect to payment page
      const trialHasEnded = statusData?.status === 'incomplete_expired' || 
                           statusData?.daysLeft === 0 || 
                           statusData?.message?.includes('trial has ended');
      
      console.log('Trial has ended check:', trialHasEnded);
      
        if (trialHasEnded) {
          console.log('Trial has ended, redirecting to payment page');
          // Find the plan data for the selected price ID
          const selectedPlanObj = plans?.find(plan => plan.stripePriceId === priceId);
          
          // Navigate to payment page with plan data
          navigate('/payment', {
            state: {
              planData: selectedPlanObj || {
                stripePriceId: priceId,
                title: 'Premium Plan',
                amount: 80.00,
                billingInterval: 'month'
              }
            }
          });
          return;
        } else {
          // Trial is active: show info modal and block purchase for now
          const selectedPlanForInfo = plans?.find(p => p.stripePriceId === priceId);
          if (selectedPlanForInfo) {
            setTrialPlanInfo({
              amount: selectedPlanForInfo.amount,
              currency: selectedPlanForInfo.currency,
              billingInterval: selectedPlanForInfo.billingInterval,
              title: selectedPlanForInfo.title,
            });
          }
          setActiveTrialModalOpen(true);
          return;
        }
      }

      console.log('Trial is still active or no status data, creating subscription...');

      // If trial is still active, proceed with normal subscription creation
      const result = await createSubscriptionMutation.mutateAsync({ priceId, skipToast: true });
      
      console.log('Subscription API Response:', result);
      
      // Check if we need to redirect to Stripe checkout
      if (result?.requiresPayment && result?.checkoutUrl) {
        console.log('Redirecting to Stripe checkout:', result.checkoutUrl);
        window.location.href = result.checkoutUrl;
        return;
      }
      
      // Show success message and navigate to dashboard
      if (result?.subscriptionId) {
        console.log('Subscription created successfully, navigating to dashboard');
        toast.success('Subscription created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  const handleStartTrial = async () => {
    try {
      await startTrialMutation.mutateAsync();
      // Force-refresh subscription status so the guard sees 'trialing'
      try {
        const refreshed = await refetchStatus?.();
        const newStatus = refreshed?.data?.data?.status;
        if (newStatus !== 'trialing') {
          // Small fallback wait for eventual consistency
          await new Promise((res) => setTimeout(res, 400));
          await refetchStatus?.();
        }
      } catch (_) {}
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error toasts are handled in the hook
      console.error('Failed to start trial:', error);
    }
  };

  const TrialInfoContent = (
    <div className="p-2">
      <div className="text-xl font-semibold text-gray-900 mb-2">Start your 14-day free trial</div>
      <div className="text-sm text-gray-700 mb-3">
        You’ll get full access for 14 days. After the trial ends, you’ll need to purchase a subscription to continue using premium features.
      </div>
      {trialPlanInfo && (
        <div className="text-sm text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          After the trial: {formatPrice(trialPlanInfo.amount, trialPlanInfo.currency)} billed {getBillingText(trialPlanInfo.billingInterval)} for {trialPlanInfo.title}
        </div>
      )}
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-6">
        <li>No charges during the trial period</li>
        <li>Upgrade at any time</li>
        <li>Cancel before the trial ends to avoid charges</li>
      </ul>
      <div className="flex justify-end gap-3">
        <Button
          variant="default"
          radius="xl"
          onClick={() => setTrialModalOpen(false)}
          disabled={startTrialMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          radius="xl"
          bg={"black"}
          onClick={handleStartTrial}
          loading={startTrialMutation.isPending}
        >
          Start Trial
        </Button>
      </div>
    </div>
  );

  const ActiveTrialInfoContent = (
    <div className="p-2">
      <div className="text-xl font-semibold text-gray-900 mb-2">You’re on a free trial</div>
      <div className="text-sm text-gray-700 mb-3">
        You already have an active free trial. You can purchase a subscription after your trial ends.
      </div>
      {subscriptionStatus?.data?.daysLeft != null && (
        <div className="text-sm text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          Trial remaining: {subscriptionStatus.data.daysLeft} day{subscriptionStatus.data.daysLeft === 1 ? '' : 's'}
        </div>
      )}
      {trialPlanInfo && (
        <div className="text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-3 mb-4">
          After the trial: {formatPrice(trialPlanInfo.amount, trialPlanInfo.currency)} billed {getBillingText(trialPlanInfo.billingInterval)} for {trialPlanInfo.title}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button radius="xl" variant="default" onClick={() => setActiveTrialModalOpen(false)}>
          Close
        </Button>
        <Button radius="xl" bg="black" onClick={() => { setActiveTrialModalOpen(false); navigate('/dashboard'); }}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );

  const PlanCard = ({ title, features, price, buttonText, additionalInfo = [], planId, onButtonClick, showStartTrial, postTrialText }) => {
    const isSelected = selectedPlan === planId;
    
    return (
      <div
        className={`w-[360px] cursor-pointer transition-all duration-300 max-md:max-w-full min-h-[400px] ${isSelected ? 'scale-105 z-10' : 'scale-100 z-0'}`}
        onClick={() => handlePlanSelection(planId)}
      >
        <div
          className={`${planId === 'premium' && !isSelected ? "bg-[rgba(245,247,249,1)]" : ""} rounded-[30px] max-md:max-w-full transition-all duration-300 overflow-hidden`}
        >
          <div
            className={`flex flex-col items-stretch pt-[32px] pb-[9px] px-[7px] rounded-[28px] max-md:max-w-full transition-all duration-300 overflow-hidden
              ${isSelected 
                ? "bg-white shadow-[0px_10px_15px_rgba(0,0,0,0.1)]" 
                : planId === 'premium' 
                  ? "bg-[rgba(245,247,249,1)]" 
                  : "bg-[rgba(235,235,235,1)]"}`}
          >
            <div className="text-[rgba(50,51,52,1)] text-2xl font-semibold leading-none ml-[18px] max-md:ml-2">
              {title}
            </div>
            <div className="self-center w-[320px] max-w-full text-[rgba(29,29,29,1)] text-sm font-light leading-[1.4] mt-[20px]">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex w-full items-center gap-[15px] mt-[7px] first:mt-0"
                >
                  <img
                    src={feature.icon}
                    className="w-5 h-5 object-contain shrink-0 my-auto"
                    alt=""
                  />
                  <div className="self-stretch my-auto">{feature.text}</div>
                </div>
              ))}
            </div>
            {showStartTrial && (
              <div className="self-center w-[320px] max-w-full">
                <div className="text-xs text-gray-700 bg-white border border-[#e6e6e6] rounded-lg px-3 py-2 mt-3">
                  {postTrialText}
                </div>
              </div>
            )}
            <div className={`${isSelected ? "bg-[rgba(253,253,253,1)]" : "bg-[rgba(245,245,245,1)]"} flex w-full flex-col mt-[20px] px-[20px] py-5 rounded-[28px] max-md:max-w-full max-md:px-4 border border-[#e0e0e0] flex-grow transition-all duration-300`}> 
              {additionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="self-stretch flex items-center gap-[18px] text-[rgba(29,29,29,1)] text-sm font-medium leading-normal mb-2"
                >
                  <img
                    src={info.icon}
                    className="w-4 h-4 object-contain shrink-0 my-auto"
                    alt=""
                  />
                  <div className="grow shrink basis-auto">{info.text}</div>
                </div>
              ))}
              <div className="flex w-full max-w-full flex-col items-stretch justify-end pt-4">
                <Button
                  fullWidth
                  radius="xl"
                  onClick={onButtonClick}
                  loading={isLoading}
                  disabled={isLoading}
                  styles={(theme) => ({
                    root: {
                      backgroundColor: isSelected ? "#333333" : "#E5E5E5",
                      color: isSelected ? "white" : "#888888",
                      height: isSelected ? rem(54) : rem(50),
                      fontSize: rem(14),
                      border: isSelected ? "none" : "1px solid #dfdfdf",
                      transition: "all 0.3s ease",
                      '&:hover': {
                        backgroundColor: isSelected ? "#222222" : "#D5D5D5"
                      }
                    },
                    label: {
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }
                  })}
                >
                  {buttonText === 'Start Trial' ? buttonText : `${price} ${buttonText}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-[#f5f5f5]" style={{ position: 'relative' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <div className="self-stretch flex w-full items-stretch gap-5 flex-wrap justify-between max-md:max-w-full">
            <HeaderLogo />
          </div>
          
          <div className="text-[rgba(50,51,52,1)] text-3xl font-semibold leading-none text-center mt-[45px] max-md:mt-8">
            Explore Our Plans
          </div>
          <div className="flex gap-[30px] flex-wrap mt-[40px] max-md:max-w-full max-md:mt-8 justify-center items-stretch">
            {/* Dynamic Plans from API */}
      {plans && plans.length > 0 ? (
      plans.map((plan) => {
                // Determine which button to show
        const statusData = subscriptionStatus?.data; // API wraps data
        const statusValue = statusData?.status; // e.g., undefined/null/'none'/'trialing'/'active'/'incomplete_expired'
        // While loading or unknown, default to Start Trial for new accounts
        const showStartTrial = statusLoading || statusValue == null || statusValue === 'none';

        return (
                  <PlanCard
                    key={plan._id}
                    planId={plan._id}
                    title={plan.title}
                    features={formatPlanFeatures(plan.features)}
                    price={formatPrice(plan.amount, plan.currency)}
                    buttonText={showStartTrial ? 'Start Trial' : 'Buy now'}
        showStartTrial={showStartTrial}
        postTrialText={`After the free trial: ${formatPrice(plan.amount, plan.currency)} billed ${getBillingText(plan.billingInterval)}`}
                    additionalInfo={[
                      {
                        icon: rectangle,
                        text: `Billed ${getBillingText(plan.billingInterval)}`
                      },
                      {
                        icon: rectangle,
                        text: 'Best for businesses & professionals'
                      }
                    ]}
  onButtonClick={() => (showStartTrial ? (setTrialPlanInfo({ amount: plan.amount, currency: plan.currency, billingInterval: plan.billingInterval, title: plan.title }), setTrialModalOpen(true)) : handleUpgradeToPlan(plan.stripePriceId))}
                  />
                );
              })
            ) : null}
            
            {/* Show loading state for plans with Skeleton */}
            {plansLoading && (
              <>
                <div className="w-[360px] h-[400px] bg-white rounded-[30px] p-6">
                  <Skeleton height={32} width="70%" mb={20} />
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="80%" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="75%" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="85%" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-[28px] p-5 mt-auto">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <Skeleton height={16} width={16} radius="sm" />
                        <Skeleton height={14} width="60%" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton height={16} width={16} radius="sm" />
                        <Skeleton height={14} width="70%" />
                      </div>
                    </div>
                    <Skeleton height={50} radius="xl" />
                  </div>
                </div>
                <div className="w-[360px] h-[400px] bg-white rounded-[30px] p-6">
                  <Skeleton height={32} width="60%" mb={20} />
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="90%" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="70%" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton height={20} width={20} radius="sm" />
                      <Skeleton height={16} width="80%" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-[28px] p-5 mt-auto">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <Skeleton height={16} width={16} radius="sm" />
                        <Skeleton height={14} width="65%" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton height={16} width={16} radius="sm" />
                        <Skeleton height={14} width="75%" />
                      </div>
                    </div>
                    <Skeleton height={50} radius="xl" />
                  </div>
                </div>
              </>
            )}
            
            {/* Show error state for plans */}
            {plansError && (
              <div className="w-[360px] h-[400px] flex items-center justify-center bg-red-50 rounded-[30px] border border-red-200">
                <div className="text-red-500 text-center p-4">
                  <div className="font-semibold mb-2">Failed to load plans</div>
                  <div className="text-sm">{plansError.message}</div>
                </div>
              </div>
            )}
          </div>

          
          <footer className="flex w-full max-w-[1200px] items-center gap-[20px_60px] text-base text-[rgba(113,132,173,1)] font-light leading-[1.3] justify-between flex-wrap mt-12 max-md:max-w-full max-md:mt-10">
            <div className="self-stretch my-auto max-md:max-w-full">
              © 2025 Copyright All Rights Reserved{" "}
              <span className="font-['Montserrat_Alternates'] font-bold">
                YouCalendy
              </span>
            </div>
            <div className="self-stretch my-auto">
              Design & Developed by <span className="font-medium">Dotclickllc</span>
            </div>
          </footer>
        </div>
      </div>
      <CommonModal
        opened={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        content={TrialInfoContent}
        size="sm"
      />
      <CommonModal
        opened={activeTrialModalOpen}
        onClose={() => setActiveTrialModalOpen(false)}
        content={ActiveTrialInfoContent}
        size="sm"
      />
    </main>
  );
};

export default Plan;
