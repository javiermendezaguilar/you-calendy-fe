import React from 'react';
import { Badge, Button, Skeleton, Alert } from '@mantine/core';
import { BadgeCheck, AlertCircle, Clock, CheckCircle2, Info } from 'lucide-react';
import { useSubscriptionStatus } from '../../hooks/useSubscription';
import { useGetPlans } from '../../hooks/usePlans';
import { useGetBusiness } from '../../hooks/useBusiness';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import { useNavigate } from 'react-router-dom';

// Helper to map status to badge style
const statusMeta = (status) => {
  switch (status) {
    case 'trialing':
      return { label: 'Trialing', color: 'yellow', tone: 'text-amber-700', dot: 'bg-amber-500' };
    case 'active':
      return { label: 'Active', color: 'green', tone: 'text-green-700', dot: 'bg-green-500' };
    case 'past_due':
    case 'incomplete':
      return { label: 'Payment Issue', color: 'orange', tone: 'text-orange-700', dot: 'bg-orange-500' };
    case 'canceled':
      return { label: 'Canceled', color: 'red', tone: 'text-red-700', dot: 'bg-red-500' };
    case 'incomplete_expired':
      return { label: 'Trial Expired', color: 'gray', tone: 'text-gray-700', dot: 'bg-gray-400' };
    case 'none':
    default:
      return { label: 'No Plan', color: 'blue', tone: 'text-blue-700', dot: 'bg-blue-500' };
  }
};

const SubscriptionStatus = () => {
  const { t, tc, currentLanguage } = useBatchTranslation();
  const navigate = useNavigate();
  const { data: subData, isLoading: subLoading } = useSubscriptionStatus();
  const { data: plansData, isLoading: plansLoading } = useGetPlans();
  const { data: businessData, isLoading: businessLoading } = useGetBusiness();

  const status = subData?.data?.status || 'none';
  const daysLeft = subData?.data?.daysLeft;
  const nextBillingDate = subData?.data?.nextBillingDate; // assuming backend may send this later
  const meta = statusMeta(status);

  // Locale-aware date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    try {
      return new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return new Date(dateString).toLocaleDateString(locale);
    }
  };

  // Attempt to infer current plan by matching amount (if backend returns plan info later we can adjust)
  const currentAmount = subData?.data?.amount; // hypothetical
  let currentPlan = null;
  if (plansData && currentAmount != null) {
    currentPlan = plansData.find(p => p.amount === currentAmount) || null;
  }

  // Fallback: show first active plan if status active but we couldn't map
  if (!currentPlan && plansData && status === 'active') {
    currentPlan = plansData.find(p => p.isActive) || null;
  }

  const loading = subLoading || plansLoading || businessLoading;

  const showUpgrade = status === 'none' || status === 'incomplete_expired' || status === 'canceled';
  const showResolve = status === 'past_due' || status === 'incomplete';

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BadgeCheck size={32} color="#228be6" />
                <h1 className="text-2xl text-slate-800 font-semibold">{tc('subscriptionStatus')}</h1>
                {loading ? (
                  <Skeleton height={24} width={90} radius="xl" />
                ) : (
                  <Badge color={meta.color} variant="light" className="capitalize">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {t(meta.label)}
                    </div>
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 text-lg max-w-xl">
                {tc('managePricingPlansTrialsAndPromotionalOffers')}
              </p>
            </div>
            <div className="flex items-center">
              <Button onClick={() => navigate('/plan')} color="#323334" className="!bg-[#323334] hover:!bg-[#232425]">
                {showUpgrade ? tc('viewPlans') : tc('changePlan')}
              </Button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-6">
              <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
                <Skeleton height={20} width={180} mb={20} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton height={14} width={100} />
                      <Skeleton height={20} width={140} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
                <Skeleton height={20} width={200} mb={20} />
                <div className="space-y-2">
                  {[...Array(5)].map((_,i) => <Skeleton key={i} height={16} width={`${60 + (i*5)}%`} />)}
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Status Overview */}
              <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white mb-8">
                <h2 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={18} /> {tc('subscriptionStatus')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">{tc('currentPlan')}</p>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {currentPlan?.title || (status === 'trialing' ? tc('youAreCurrentlyOnFreeTrial') : tc('noActiveSubscription'))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{status === 'trialing' ? tc('trialDaysLeft') : tc('nextBillingDate')}</p>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {status === 'trialing'
                        ? (daysLeft != null ? `${daysLeft} ${tc('daysRemaining')}` : '—')
                        : (nextBillingDate ? formatDate(nextBillingDate) : '—')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{tc('status')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                      <p className={`text-lg font-semibold ${meta.tone}`}>{t(meta.label)}</p>
                    </div>
                  </div>
                </div>
                {(showUpgrade || showResolve) && (
                  <Alert color={showResolve ? 'orange' : 'blue'} icon={<AlertCircle size={16} />} className="mt-6" radius="md">
                    {showResolve ? tc('subscriptionIssues') : tc('noActiveSubscription')}
                  </Alert>
                )}
              </div>

              {/* Current Plan Details */}
              <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
                <h2 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> {tc('currentPlan')}
                </h2>
                {currentPlan ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500">{tc('planPriceBilling')}</p>
                      <p className="text-lg font-semibold text-slate-800 mt-1">
                        ${currentPlan.amount?.toFixed(2)} / {currentPlan.billingInterval}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{tc('include')}</p>
                      <ul className="text-sm text-slate-700 mt-1 space-y-1 list-disc list-inside max-h-40 overflow-auto pr-1">
                        {currentPlan.features?.map((f,i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{status === 'trialing' ? tc('trialDaysLeft') : tc('renewsOn')}</p>
                      <p className="text-lg font-semibold text-slate-800 mt-1 flex items-center gap-2">
                        <Clock size={16} />
                        {status === 'trialing'
                          ? (daysLeft != null ? `${daysLeft} ${tc('daysRemaining')}` : '—')
                          : (nextBillingDate ? formatDate(nextBillingDate) : '—')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-sm">
                    {status === 'trialing' ? tc('youAreCurrentlyOnFreeTrial') : tc('noActiveSubscription')}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {showUpgrade && (
                    <Button onClick={() => navigate('/plan')} className="!bg-[#323334] hover:!bg-[#232425]" radius="md">
                      {tc('upgradePlan')}
                    </Button>
                  )}
                  {showResolve && (
                    <Button onClick={() => navigate('/payment', { state: { planData: currentPlan } })} color="orange" radius="md">
                      {tc('resolveNow')}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default SubscriptionStatus;
