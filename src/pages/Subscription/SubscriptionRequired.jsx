import React from 'react';
import { Button } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeaderLogo } from '../../components/common/Svgs';
import { useSubscriptionStatus } from '../../hooks/useSubscription';
import { IconLock } from '@tabler/icons-react';
import barberBackground from '../../assets/background.webp';

const SubscriptionRequired = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateMsg = location.state?.message;
  const { data, isLoading } = useSubscriptionStatus();

  const status = data?.data?.status;
  const daysLeft = data?.data?.daysLeft;

  const getMessage = () => {
    if (stateMsg) return stateMsg;
    if (isLoading) return 'Checking your subscription status…';
    if (status === 'incomplete_expired' || (status === 'trialing' && daysLeft === 0)) {
      return 'Your free trial expired. Please purchase a plan to continue using premium features.';
    }
    if (status === 'canceled') {
      return 'Your subscription was canceled. Please purchase a plan to regain access.';
    }
    if (status === 'past_due' || status === 'incomplete') {
      return 'There is an issue with your payment method. Please purchase a plan or update payment to continue.';
    }
    if (status === 'none' || status == null) {
      return 'No active subscription found. It’s possible your free trial has expired. Please purchase a plan to continue.';
    }
    return 'It’s possible your free trial has expired, or no active subscription was found. Please purchase a plan to continue.';
  };

  const getBadge = () => {
    if (isLoading) return { text: 'Checking status', bg: 'bg-gray-100', color: 'text-gray-700' };
    if (status === 'incomplete_expired' || (status === 'trialing' && daysLeft === 0)) {
      return { text: 'Trial expired', bg: 'bg-amber-100', color: 'text-amber-800' };
    }
    if (status === 'canceled') {
      return { text: 'Subscription canceled', bg: 'bg-red-100', color: 'text-red-700' };
    }
    if (status === 'past_due' || status === 'incomplete') {
      return { text: 'Payment issue', bg: 'bg-orange-100', color: 'text-orange-700' };
    }
    if (status === 'none' || status == null) {
      return { text: 'No active plan', bg: 'bg-blue-100', color: 'text-blue-700' };
    }
    return { text: 'Subscription required', bg: 'bg-gray-100', color: 'text-gray-800' };
  };

  const badge = getBadge();

  return (
    <main
      className="min-h-screen p-4 flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${barberBackground})` }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-start py-4">
          <HeaderLogo />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-[30px] shadow-[0_10px_20px_rgba(0,0,0,0.08)] max-w-xl w-full p-8 text-center border border-[#e0e0e0]">
          <div className="mx-auto mb-4 rounded-full w-16 h-16 bg-[#f0f0f0] flex items-center justify-center ring-2 ring-[#e7e7e7]">
            <IconLock size={26} color="#333" />
          </div>
          {/* Removed status badge per request */}
          <div className="text-[rgba(50,51,52,1)] text-[26px] leading-8 font-semibold mb-2">Subscription Required</div>
          <div className="text-sm text-gray-700 mb-4">{getMessage()}</div>
          <div className="text-xs text-gray-600 mb-6">
            If you already purchased a plan in another tab, refresh this page to try again.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              radius="xl"
              className="w-full sm:w-[220px]"
              styles={{ root: { backgroundColor: '#333333' }, label: { fontWeight: 600 } }}
              onClick={() => navigate('/plan')}
            >
              Go to Plans
            </Button>
            <Button variant="default" radius="xl" className="w-full sm:w-[220px]" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SubscriptionRequired;
