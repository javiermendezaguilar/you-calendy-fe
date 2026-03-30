import React, { useEffect, useState } from "react";
import { Button, Title, Text, Card, Skeleton } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import barberBackground from "../../assets/background.webp";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { toast } from 'sonner';
import { useGetPlans } from '../../hooks/usePlans';
import { useTranslation } from 'react-i18next';

const Header = () => (
  <div className="w-full py-6 bg-[#323334] flex items-center justify-center rounded-[32px_32px_0px_0px]">
    <HeaderLogoLight className="text-white" />
  </div>
);

const SuccessIcon = () => (
  <div className="flex justify-center mb-6">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircle className="w-12 h-12 text-green-500" />
    </div>
  </div>
);

const SubscriptionDetailsSkeleton = () => (
  <Card className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-lg p-6 mb-6">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton height={16} width={120} />
        <Skeleton height={20} width={100} />
      </div>
      
      <div className="flex justify-between items-center">
        <Skeleton height={16} width={60} />
        <Skeleton height={20} width={120} />
      </div>
    
      <div className="flex justify-between items-center">
        <Skeleton height={16} width={100} />
        <Skeleton height={12} width={150} />
      </div>
      
      <div className="flex justify-between items-center">
        <Skeleton height={16} width={50} />
        <div className="flex items-center gap-2">
          <Skeleton height={8} width={8} radius="xl" />
          <Skeleton height={16} width={50} />
        </div>
      </div>
    </div>
  </Card>
);

const SubscriptionDetails = ({ planData, subscriptionId, actualPlanData }) => {
  const { t } = useTranslation();
  // Use actual plan data from API if available, otherwise fall back to passed planData
  const displayPlan = actualPlanData || planData;
  const getIntervalNoun = (interval) => ({
    month: t('month'),
    year: t('year'),
    monthly: t('month'),
    yearly: t('year'),
  }[interval] || t('month'));
  
  return (
    <Card className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-lg p-6 mb-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Text className="text-[#666] text-sm">{t('Subscription Plan')}</Text>
          <Text className="text-[#323334] font-semibold">
            {displayPlan?.title || t('Premium Plan')}
          </Text>
        </div>
        
        <div className="flex justify-between items-center">
          <Text className="text-[#666] text-sm">{t('Amount')}</Text>
          <Text className="text-[#323334] font-semibold">
            ${displayPlan?.amount || '29.00'} / {getIntervalNoun(displayPlan?.billingInterval || 'month')}
          </Text>
        </div>
      
      {subscriptionId && (
        <div className="flex justify-between items-center">
          <Text className="text-[#666] text-sm">{t('Subscription ID')}</Text>
          <Text className="text-[#323334] font-mono text-xs">
            {subscriptionId}
          </Text>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Text className="text-[#666] text-sm">{t('Status')}</Text>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Text className="text-green-600 font-semibold text-sm">{t('Active')}</Text>
        </div>
      </div>
      </div>
    </Card>
  );
};



const SuccessContentSkeleton = () => (
  <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex justify-center mb-6">
        <Skeleton height={80} width={80} radius="xl" />
      </div>
      
      <header className="flex flex-col items-center text-center">
        <Skeleton height={32} width="60%" mb={8} />
        <Skeleton height={20} width="80%" />
      </header>

      <SubscriptionDetailsSkeleton />
      
      <div className="text-center">
        <Skeleton height={16} width={250} />
      </div>
    </div>
  </div>
);

const SuccessContent = ({ planData, subscriptionId, actualPlanData }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
      <div className="flex flex-col items-center gap-6 w-full">
        <SuccessIcon />
        
        <header className="flex flex-col items-center text-center">
          <Title
            order={2}
            className="text-[#323334] text-center text-2xl font-bold leading-[32px] mb-2"
          >
            {t('Payment Successful!')}
          </Title>
          <Text className="text-[#323334] text-center text-base font-light">
            {t('Welcome to YouCalendy Premium. Your subscription is now active.')}
          </Text>
        </header>
  
        <SubscriptionDetails 
          planData={planData} 
          subscriptionId={subscriptionId}
          actualPlanData={actualPlanData}
        />
        
        <div className="text-center">
          <Text className="text-[#666] text-sm">
            {t('Need help? Contact our support team anytime.')}
          </Text>
        </div>
      </div>
    </div>
  );
};

const SuccessActions = ({ onContinue }) => {
  const { t } = useTranslation();
  return (
    <div className="px-10 pt-6 pb-6">
      <Button
        onClick={onContinue}
        fullWidth
        size="md"
        radius="md"
        color="#323334"
        rightSection={<ArrowRight className="w-4 h-4" />}
        aria-label={t('Go to Dashboard')}
      >
        {t('Go to Dashboard')}
      </Button>
    </div>
  );
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [actualPlanData, setActualPlanData] = useState(null);
  const { t } = useTranslation();
  
  // Get data from location state (direct subscription) or URL params (Stripe checkout)
  const planData = location.state?.planData;
  const subscriptionId = location.state?.subscriptionId;
  
  // Check for session_id in URL params (from Stripe checkout success)
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session_id');
  
  // Fetch plans to get actual pricing
  const { data: plans, isLoading: plansLoading } = useGetPlans();
  const isDataLoading = plansLoading && !actualPlanData;

  useEffect(() => {
    // Show success toast
    toast.success(t('Subscription activated successfully!'), {
      duration: 4000,
      position: 'top-center',
    });

    // If no state data and no session_id, redirect to dashboard after a delay
    if (!planData && !subscriptionId && !sessionId) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [planData, subscriptionId, sessionId, navigate]);
  
  // Fetch actual plan data when subscription status and plans are available
  useEffect(() => {
    if (plans?.length > 0) {
      let selectedPlan = null;
      
      // First, try to match with the planData that was passed (if available)
      if (planData?.stripePriceId) {
        selectedPlan = plans.find(plan => plan.stripePriceId === planData.stripePriceId);
      }
      
      // If no match found and we have planData with amount, try to match by amount
      if (!selectedPlan && planData?.amount) {
        selectedPlan = plans.find(plan => plan.amount === planData.amount);
      }
      
      // If still no match, use the first active plan as fallback
      if (!selectedPlan) {
        selectedPlan = plans.find(plan => plan.isActive);
      }
      
      if (selectedPlan) {
        setActualPlanData({
          title: selectedPlan.title,
          amount: selectedPlan.amount,
          billingInterval: selectedPlan.billingInterval,
          stripePriceId: selectedPlan.stripePriceId
        });
        console.log('PaymentSuccess: Using plan data from API:', selectedPlan);
      }
    }
  }, [plans, planData]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <main
      className="flex justify-center items-center w-full h-screen overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${barberBackground})` }}
      role="main"
      aria-label="Payment success page"
    >
      <div
        className="w-[520px] bg-white shadow-[0px_100px_150px_-27px_rgba(38,44,61,0.12)] rounded-[32px] border-[3px] border-[#D9E2F4] max-md:w-[90%] max-sm:w-[95%] max-sm:h-auto"
        role="region"
        aria-label="Payment success content"
      >
        <Header />
        {isDataLoading ? (
          <SuccessContentSkeleton />
        ) : (
          <SuccessContent 
            planData={planData} 
            subscriptionId={subscriptionId}
            actualPlanData={actualPlanData}
          />
        )}
        <SuccessActions onContinue={handleContinue} />
      </div>
    </main>
  );
};

export default PaymentSuccess;