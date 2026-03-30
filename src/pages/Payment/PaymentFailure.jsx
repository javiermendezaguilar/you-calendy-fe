import React, { useEffect } from "react";
import { Button, Title, Text, Card, Alert } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, CreditCard } from "lucide-react";
import barberBackground from "../../assets/background.webp";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Header = () => (
  <div className="w-full py-6 bg-[#323334] flex items-center justify-center rounded-[32px_32px_0px_0px]">
    <HeaderLogoLight className="text-white" />
  </div>
);

const FailureIcon = () => (
  <div className="flex justify-center mb-6">
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
      <XCircle className="w-12 h-12 text-red-500" />
    </div>
  </div>
);

const ErrorDetails = ({ error, planData }) => {
  const { t } = useTranslation();
  const getIntervalNoun = (interval) => {
    const lower = (interval || '').toLowerCase();
    if (lower === 'month' || lower === 'monthly') return t('month');
    if (lower === 'year' || lower === 'yearly' || lower === 'annual') return t('year');
    return t(interval || 'month');
  };

  return (
    <Card className="w-full bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <Text className="text-red-800 font-semibold text-sm mb-1">
              {t('Payment Failed')}
            </Text>
            <Text className="text-red-700 text-sm">
              {error || t('We were unable to process your payment. Please try again.')}
            </Text>
          </div>
        </div>
        
        {planData && (
          <div className="border-t border-red-200 pt-4">
            <div className="flex justify-between items-center">
              <Text className="text-red-700 text-sm">{t('Attempted Plan')}</Text>
              <Text className="text-red-800 font-semibold text-sm">
                {planData.title || t('Premium Plan')}
              </Text>
            </div>
            <div className="flex justify-between items-center mt-2">
              <Text className="text-red-700 text-sm">{t('Amount')}</Text>
              <Text className="text-red-800 font-semibold text-sm">
                ${planData.amount || '80.00'} / {getIntervalNoun(planData.billingInterval || 'month')}
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const TroubleshootingTips = () => {
  const { t } = useTranslation();
  const tips = [
    {
      icon: <CreditCard className="w-5 h-5 text-[#323334]" />,
      title: t('Check your card details'),
      description: t('Ensure your card number, expiry date, and CVV are correct')
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-[#323334]" />,
      title: t('Verify sufficient funds'),
      description: t('Make sure your account has enough balance for the transaction')
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#323334]" />,
      title: t('Try a different card'),
      description: t('Some cards may have restrictions on online payments')
    }
  ];

  return (
    <div className="space-y-4">
      <Text className="text-[#323334] font-semibold text-lg mb-4">
        {t('Common solutions:')}
      </Text>
      {tips.map((tip, index) => (
        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e9ecef]">
          <div className="flex-shrink-0 mt-1">
            {tip.icon}
          </div>
          <div>
            <Text className="text-[#323334] font-medium text-sm">
              {tip.title}
            </Text>
            <Text className="text-[#666] text-xs">
              {tip.description}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};

const FailureContent = ({ error, planData }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center px-12 py-8 max-sm:px-4">
      <div className="flex flex-col items-center gap-6 w-full">
        <FailureIcon />
        
        <header className="flex flex-col items-center text-center">
          <Title
            order={2}
            className="text-[#323334] text-center text-2xl font-bold leading-[32px] mb-2"
          >
            {t('Payment Failed')}
          </Title>
          <Text className="text-[#323334] text-center text-base font-light">
            {t("Don't worry, no charges were made to your account.")}
          </Text>
        </header>
  
        <ErrorDetails error={error} planData={planData} />
        
        <TroubleshootingTips />
        
        <Alert 
          icon={<AlertTriangle className="w-4 h-4" />} 
          title={t('Need Help?')} 
          color="blue"
          className="w-full"
        >
          <Text className="text-sm">
            {t("If you continue to experience issues, please contact our support team. We're here to help you get started with YouCalendy Premium.")}
          </Text>
        </Alert>
      </div>
    </div>
  );
};

const FailureActions = ({ onRetry, onGoBack, onContactSupport }) => {
  const { t } = useTranslation();
  return (
    <div className="px-10 pt-6 pb-6 space-y-3">
      <Button
        onClick={onRetry}
        fullWidth
        size="md"
        radius="md"
        color="#323334"
        leftSection={<RefreshCw className="w-4 h-4" />}
        aria-label={t('Try payment again')}
      >
        {t('Try Again')}
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onGoBack}
          size="md"
          radius="md"
          variant="outline"
          color="#666"
          leftSection={<ArrowLeft className="w-4 h-4" />}
          aria-label={t('Go back to plans')}
        >
          {t('Back to Plans')}
        </Button>
        
        <Button
          onClick={onContactSupport}
          size="md"
          radius="md"
          variant="outline"
          color="#323334"
          aria-label={t('Contact support')}
        >
          {t('Get Help')}
        </Button>
      </div>
    </div>
  );
};

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const error = location.state?.error;
  const planData = location.state?.planData;

  useEffect(() => {
    // Show error toast
    toast.error(t('Payment failed. Please try again.'), {
      duration: 4000,
      position: 'top-center',
    });
  }, []);

  const handleRetry = () => {
    // Navigate back to payment page with the same plan data
    if (planData) {
      navigate('/payment', { 
        state: { planData },
        replace: true
      });
    } else {
      navigate('/plan');
    }
  };

  const handleGoBack = () => {
    navigate('/plan');
  };

  const handleContactSupport = () => {
    navigate('/dashboard/support');
  };

  return (
    <main
      className="flex justify-center items-center w-full h-screen overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${barberBackground})` }}
      role="main"
      aria-label="Payment failure page"
    >
      <div
        className="w-[520px] bg-white shadow-[0px_100px_150px_-27px_rgba(38,44,61,0.12)] rounded-[32px] border-[3px] border-[#D9E2F4] max-md:w-[90%] max-sm:w-[95%] max-sm:h-auto"
        role="region"
        aria-label="Payment failure content"
      >
        <Header />
        <FailureContent error={error} planData={planData} />
        <FailureActions 
          onRetry={handleRetry}
          onGoBack={handleGoBack}
          onContactSupport={handleContactSupport}
        />
      </div>
    </main>
  );
};

export default PaymentFailure;