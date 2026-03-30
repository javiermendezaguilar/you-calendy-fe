import React, { useState } from 'react';
import {
  Button,
  Badge,
  Skeleton,
  Alert,
  NumberFormatter
} from '@mantine/core';
import { CreditCard, Zap, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGetBusiness } from '../../hooks/useBusiness';
import { getCreditProducts, createCheckoutSession } from '../../services/creditsAPI';
import { businessAPI } from '../../services/businessAPI';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';

const PurchaseCredits = () => {
  const { t } = useBatchTranslation();
  const [loadingProductId, setLoadingProductId] = useState(null);
  const { data: business, isLoading: businessLoading } = useGetBusiness();
  
  // Fetch business data to get current credit balances
  const { data: businessData, isLoading: businessDataLoading, refetch: refetchBusiness } = useQuery({
    queryKey: ['business-credits'],
    queryFn: async () => {
      const response = await businessAPI.getUserBusiness();
      // API shape: { success: true, data: { smsCredits, emailCredits, ... } }
      // Normalize so component can access businessData.smsCredits directly.
      return response?.data?.data || response?.data || {};
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  console.log("businessData",businessData)
  
  const { data: creditProducts, isLoading: productsLoading, error, refetch } = useQuery({
    queryKey: ['credit-products'],
    queryFn: async () => {
      const response = await getCreditProducts();
      // Handle the nested response structure: { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Fallback for direct array response
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handlePurchase = async (product) => {
    try {
      // Show loader only on the clicked product card
      setLoadingProductId(product?._id || product?.stripePriceId || product?.id);
      const response = await createCheckoutSession({ priceId: product.stripePriceId });
      
      // Handle nested response structure: { success: true, data: { url: '...' } }
      const checkoutUrl = response.data?.data?.url || response.data?.url;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error(t('Failed to create checkout session'));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || t('Failed to initiate purchase'));
    } finally {
      setLoadingProductId(null);
    }
  };

  if (businessLoading || productsLoading || businessDataLoading) {
    return (
      <BatchTranslationLoader>
        <div className="bg-white rounded-xl h-[83vh] overflow-y-auto">
          <div className="p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton height={32} width={32} radius="md" />
                <Skeleton height={32} width={200} />
              </div>
              <Skeleton height={24} width="60%" />
            </div>

            {/* Current Balance Skeleton */}
            <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white mb-8">
              <div className="flex justify-between items-center mb-4">
                <Skeleton height={24} width={150} />
                <Skeleton height={24} width={60} radius="xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Skeleton height={24} width={24} radius="md" />
                  <div>
                    <Skeleton height={16} width={80} mb={4} />
                    <Skeleton height={20} width={100} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton height={24} width={24} radius="md" />
                  <div>
                    <Skeleton height={16} width={80} mb={4} />
                    <Skeleton height={20} width={100} />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Packages Skeleton */}
            <div className="mb-6">
              <Skeleton height={28} width={200} mb={4} />
              <Skeleton height={20} width="70%" mb={6} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton height={24} width={24} radius="md" />
                    <Skeleton height={24} width={120} />
                  </div>
                  <Skeleton height={32} width={80} mb={4} />
                  <Skeleton height={16} width="90%" mb={6} />
                  <div className="space-y-2 mb-6">
                    <Skeleton height={16} width="100%" />
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={16} width="70%" />
                  </div>
                  <Skeleton height={40} width="100%" radius="md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </BatchTranslationLoader>
    );
  }

  if (error) {
    return (
      <BatchTranslationLoader>
        <div className="bg-white rounded-xl h-[83vh] overflow-y-auto">
          <div className="p-6">
            <Alert icon={<AlertCircle size={16} />} title={t('Error')} color="red">
              {t('Failed to load credit packages. Please try again later.')}
            </Alert>
          </div>
        </div>
      </BatchTranslationLoader>
    );
  }

  return (
    <BatchTranslationLoader>
      <div className="bg-white rounded-xl h-[83vh] overflow-y-auto">
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={32} color="#228be6" />
              <h1 className="text-2xl text-slate-800 font-semibold">
                {t('Purchase Credits')}
              </h1>
            </div>
            <p className="text-slate-500 text-lg">
              {t('Top up your SMS and Email credits to keep your marketing campaigns running smoothly.')}
            </p>
          </div>

          {/* Current Balance */}
          {businessData && (
            <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-slate-800">{t('Current Balance')}</h2>
                <Badge color="blue" variant="light">{t('Active')}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} color="#40c057" />
                  <div>
                    <p className="text-sm text-slate-500">{t('SMS Credits')}</p>
                    <p className="text-xl font-semibold text-slate-800">
                      <NumberFormatter value={businessData?.smsCredits || 0} thousandSeparator />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} color="#fd7e14" />
                  <div>
                    <p className="text-sm text-slate-500">{t('Email Credits')}</p>
                    <p className="text-xl font-semibold text-slate-800">
                      <NumberFormatter value={businessData?.emailCredits || 0} thousandSeparator />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Packages */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl text-slate-800 font-semibold">
                {t('Available Credit Packages')}
              </h2>
            </div>
            {!creditProducts || !Array.isArray(creditProducts) || creditProducts.length === 0 ? (
              <Alert icon={<AlertCircle size={16} />} title={t('No packages available')} color="yellow">
                {t('There are currently no credit packages available for purchase.')}
                {error && (
                  <div className="mt-2 text-xs opacity-70">
                    Error: {error.message}
                  </div>
                )}
              </Alert>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {creditProducts.map((product) => (
                   <div key={product._id} className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white flex flex-col h-full">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex-1">
                         <h3 className="text-lg font-semibold text-slate-800 mb-2">
                           {product.title}
                         </h3>
                         <p className="text-sm text-slate-500">
                           {product.description}
                         </p>
                       </div>
                       <Badge color="green" variant="light" className="ml-2">
                         <div className="flex items-center gap-1">
                           <Zap size={12} />
                           {t('Popular')}
                         </div>
                       </Badge>
                     </div>

                     <div className="mb-4">
                       <p className="text-2xl font-bold text-blue-600">
                         ${product.amount}
                       </p>
                       <p className="text-sm text-slate-500">
                         {t('One-time payment')}
                       </p>
                     </div>

                     <div className="space-y-2 mb-6 flex-1">
                       {product.smsCredits > 0 && (
                         <div className="flex items-center gap-2">
                           <MessageSquare size={16} color="#40c057" />
                           <span className="text-sm text-slate-700">
                             <NumberFormatter value={product.smsCredits} thousandSeparator /> {t('SMS Credits')}
                           </span>
                         </div>
                       )}
                       {product.emailCredits > 0 && (
                         <div className="flex items-center gap-2">
                           <Mail size={16} color="#fd7e14" />
                           <span className="text-sm text-slate-700">
                             <NumberFormatter value={product.emailCredits} thousandSeparator /> {t('Email Credits')}
                           </span>
                         </div>
                       )}
                     </div>

                     <Button
                       fullWidth
                       loading={loadingProductId === product._id}
                       disabled={Boolean(loadingProductId) && loadingProductId !== product._id}
                       onClick={() => handlePurchase(product)}
                       className="!bg-[#323334] hover:!bg-[#414546] !h-[46px] !font-normal"
                     >
                       {t('Purchase Now')}
                     </Button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Info Section */}
           <div className="border border-slate-200 p-6 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-blue-50 mt-8">
             <div className="flex items-start gap-4">
               <AlertCircle size={24} color="#228be6" className="flex-shrink-0 mt-1" />
               <div>
                 <h3 className="font-medium text-slate-800 mb-2">{t('How it works')}</h3>
                 <p className="text-sm text-slate-600">
                   {t('Purchase credit packages to send SMS and email campaigns to your clients. Credits are added to your account immediately after successful payment.')}
                 </p>
               </div>
             </div>
           </div>
         </div>
       </div>
     </BatchTranslationLoader>
  );
};

export default PurchaseCredits;