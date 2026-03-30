import React, { useState, useEffect } from "react";
import { Button, Title, Text, LoadingOverlay, Card, Skeleton } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import barberBackground from "../../assets/background.webp";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { useCreateSubscription } from '../../hooks/useSubscription';
import { useGetPlans } from '../../hooks/usePlans';
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Header = () => (
  <div className="w-full py-6 bg-[#323334] flex items-center justify-center rounded-[32px_32px_0px_0px]">
    <HeaderLogoLight className="text-white" />
  </div>
);

const SecurityBadge = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 text-[#323334] text-sm">
      <Shield className="w-4 h-4" />
      <span>{t('Secured by Stripe')}</span>
    </div>
  );
};

const PaymentFeatures = ({ planData }) => {
  const { t } = useTranslation();
  // Use plan features from API if available, otherwise use default features
  const defaultFeatures = [
    "Unlimited appointments",
    "Advanced scheduling tools",
    "Priority customer support",
    "Analytics and reporting",
    "Team management",
    "Custom branding"
  ];
  
  const usingDefault = !(planData?.features?.length > 0);
  const features = planData?.features?.length > 0 ? planData.features : defaultFeatures;

  return (
    <div className="space-y-3">
      <Text className="text-[#323334] font-semibold text-lg mb-4">
        {t("What you'll get:")}
      </Text>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <Text className="text-[#323334] text-sm">{usingDefault ? t(feature) : feature}</Text>
        </div>
      ))}
    </div>
  );
};

const PaymentContentSkeleton = () => (
  <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
    <div className="flex flex-col items-center gap-6 w-full">
      <header className="flex flex-col items-center text-center">
        <Skeleton height={32} width="70%" mb={8} />
        <Skeleton height={20} width="85%" />
      </header>

      {/* Plan Summary Card Skeleton */}
      <Card className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Skeleton height={24} width={150} mb={4} />
            <Skeleton height={16} width={100} />
          </div>
          <div className="text-right">
            <Skeleton height={32} width={80} mb={2} />
            <Skeleton height={16} width={60} />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton height={20} width={120} mb={16} />
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton height={20} width={20} radius="sm" />
              <Skeleton height={16} width={`${60 + Math.random() * 30}%`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Security Info Skeleton */}
      <div className="flex flex-col items-center gap-2">
        <Skeleton height={16} width={120} />
        <Skeleton height={12} width={200} />
      </div>
    </div>
  </div>
);

const PaymentContent = ({ planData }) => {
  const { t } = useTranslation();
  const getBillingText = (interval) => ({
    month: t('Monthly'),
    year: t('Yearly'),
    monthly: t('Monthly'),
    yearly: t('Yearly'),
  }[interval] || t('Monthly'));
  const getIntervalNoun = (interval) => ({
    month: t('month'),
    year: t('year'),
    monthly: t('month'),
    yearly: t('year'),
  }[interval] || t('month'));

  return (
    <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
      <div className="flex flex-col items-center gap-6 w-full">
        <header className="flex flex-col items-center text-center">
          <Title
            order={2}
            className="text-[#323334] text-center text-2xl font-bold leading-[32px] mb-2"
          >
            {t('Complete Your Subscription')}
          </Title>
          <Text className="text-[#323334] text-center text-base font-light">
            {t('Your free trial has ended. Continue with premium features.')}
          </Text>
        </header>

        {/* Plan Summary Card */}
        <Card className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Text className="text-[#323334] font-semibold text-lg">
                {planData?.title || t('Premium Plan')}
              </Text>
              <Text className="text-[#666] text-sm">
                {t('Billed')} {getBillingText(planData?.billingInterval)}
              </Text>
            </div>
            <div className="text-right">
              <Text className="text-[#323334] font-bold text-2xl">
                ${planData?.amount || '80.00'}
              </Text>
              <Text className="text-[#666] text-sm">
                {t('per')} {getIntervalNoun(planData?.billingInterval)}
              </Text>
            </div>
          </div>
          
          <PaymentFeatures planData={planData} />
        </Card>

        {/* Security Info */}
        <div className="flex flex-col items-center gap-2">
          <SecurityBadge />
          <Text className="text-[#666] text-xs text-center">
            {t('Your payment information is encrypted and secure')}
          </Text>
        </div>
      </div>
    </div>
  );
};

const PaymentActionsSkeleton = () => (
  <div className="px-10 pt-6 pb-6 space-y-3">
    <Skeleton height={48} radius="md" />
    <Skeleton height={48} radius="md" />
  </div>
);

const PaymentActions = ({ onPayment, onCancel, isLoading }) => {
  const { t } = useTranslation();
  return (
    <div className="px-10 pt-6 pb-6 space-y-3">
      <Button
        onClick={onPayment}
        fullWidth
        size="md"
        radius="md"
        color="#323334"
        loading={isLoading}
        disabled={isLoading}
        leftSection={<CreditCard className="w-4 h-4" />}
        aria-label={t('Proceed to Payment')}
      >
        {isLoading ? t('Processing...') : t('Proceed to Payment')}
      </Button>
      
      <Button
        onClick={onCancel}
        fullWidth
        size="md"
        radius="md"
        variant="outline"
        color="#666"
        disabled={isLoading}
        aria-label="Cancel and return"
      >
        {t('Cancel')}
      </Button>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [planData, setPlanData] = useState(null);
  
  const createSubscriptionMutation = useCreateSubscription();
  const { data: plans, isLoading: plansLoading } = useGetPlans();
  const isLoading = createSubscriptionMutation.isPending;
  const isDataLoading = plansLoading || (!planData && plans?.length > 0);

  useEffect(() => {
    // Get plan data from navigation state or URL params
    const stateData = location.state?.planData;
    const urlParams = new URLSearchParams(location.search);
    const priceId = urlParams.get('priceId');
    const amount = urlParams.get('amount');

    if (stateData) {
      setPlanData(stateData);
    } else if (priceId && plans?.length > 0) {
      // Find the actual plan from API data using priceId
      const matchedPlan = plans.find(plan => plan.stripePriceId === priceId);
      if (matchedPlan) {
        setPlanData({
          stripePriceId: matchedPlan.stripePriceId,
          title: matchedPlan.title,
          amount: matchedPlan.amount,
          billingInterval: matchedPlan.billingInterval,
          features: matchedPlan.features
        });
      } else {
        // If no match found, use URL params but try to find a plan with similar amount
        const amountMatch = plans.find(plan => plan.amount === parseFloat(amount));
        if (amountMatch) {
          setPlanData({
            stripePriceId: amountMatch.stripePriceId,
            title: amountMatch.title,
            amount: amountMatch.amount,
            billingInterval: amountMatch.billingInterval,
            features: amountMatch.features
          });
        } else {
          // Use the first active plan as fallback
          const activePlan = plans.find(plan => plan.isActive);
          if (activePlan) {
            setPlanData({
              stripePriceId: activePlan.stripePriceId,
              title: activePlan.title,
              amount: activePlan.amount,
              billingInterval: activePlan.billingInterval,
              features: activePlan.features
            });
          }
        }
      }
    } else if (plans?.length > 0) {
      // No URL params, use the first active plan
      const activePlan = plans.find(plan => plan.isActive);
      if (activePlan) {
        setPlanData({
          stripePriceId: activePlan.stripePriceId,
          title: activePlan.title,
          amount: activePlan.amount,
          billingInterval: activePlan.billingInterval,
          features: activePlan.features
        });
      }
    }
  }, [location, plans]);

  const handlePayment = async () => {
    try {
      console.log('PaymentPage: Starting payment process...');
      console.log('PaymentPage: Plan data:', planData);
      
      if (!planData?.stripePriceId) {
        console.error('PaymentPage: Missing stripePriceId');
        toast.error('Plan information is missing. Please try again.');
        return;
      }

      console.log('PaymentPage: Calling createSubscription with priceId:', planData.stripePriceId);
      const result = await createSubscriptionMutation.mutateAsync({ 
        priceId: planData.stripePriceId,
        skipToast: true // Handle toasts manually in this component
      });

      console.log('PaymentPage: Subscription API result:', result);
      
      // Extract data from API response
      const responseData = result?.data;
      console.log('PaymentPage: Response data:', responseData);
      console.log('PaymentPage: checkoutUrl:', responseData?.checkoutUrl);
      console.log('PaymentPage: subscriptionId:', responseData?.subscriptionId);
      console.log('PaymentPage: requiresPayment:', responseData?.requiresPayment);

      // Check if we need to redirect to Stripe checkout
      if (responseData?.checkoutUrl) {
        console.log('PaymentPage: Redirecting to Stripe checkout:', responseData.checkoutUrl);
        window.location.href = responseData.checkoutUrl;
      } else if (responseData?.subscriptionId) {
        console.log('PaymentPage: Direct success, redirecting to success page');
        // Direct success - redirect to success page
        navigate('/payment/success', { 
          state: { 
            subscriptionId: responseData.subscriptionId,
            planData: planData
          }
        });
      } else {
        console.log('PaymentPage: No checkoutUrl or subscriptionId, falling back to dashboard');
        // Fallback to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('PaymentPage: Payment failed:', error);
      navigate('/payment/failure', { 
        state: { 
          error: error.message || 'Payment failed',
          planData: planData
        }
      });
    }
  };

  const handleCancel = () => {
    navigate('/plan');
  };

  return (
    <main
      className="flex justify-center items-center w-full h-screen overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${barberBackground})` }}
      role="main"
      aria-label="Payment page"
    >
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <div
        className="w-[520px] bg-white shadow-[0px_100px_150px_-27px_rgba(38,44,61,0.12)] rounded-[32px] border-[3px] border-[#D9E2F4] max-md:w-[90%] max-sm:w-[95%] max-sm:h-auto"
        role="region"
        aria-label="Payment content"
      >
        <Header />
        {isDataLoading ? (
          <PaymentContentSkeleton />
        ) : (
          <PaymentContent 
            planData={planData}
          />
        )}
        {isDataLoading ? (
          <PaymentActionsSkeleton />
        ) : (
          <PaymentActions 
            onPayment={handlePayment}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </main>
  );
};

export default PaymentPage;