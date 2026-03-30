import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';
import { Button, Alert, Loader, Skeleton } from '@mantine/core';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import { useGetBusiness } from '../../hooks/useBusiness';
import { useQueryClient } from '@tanstack/react-query';

const CreditSuccess = () => {
  const { t } = useBatchTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { refetch: refetchBusiness } = useGetBusiness();
  const queryClient = useQueryClient();
  
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate processing time and refresh business data
    const timer = setTimeout(async () => {
      try {
        // Refetch business data to get updated credit balance
        await refetchBusiness();
        // Invalidate and refetch business credits query
        await queryClient.invalidateQueries({ queryKey: ['business-credits'] });
        setLoading(false);
        
        if (success === '1') {
          toast.success(t('Payment successful! Credits have been added to your account.'));
        }
      } catch (error) {
        console.error('Error refreshing business data:', error);
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [success, refetchBusiness, t]);

  if (loading) {
    return (
      <BatchTranslationLoader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
            {/* Success Icon Skeleton */}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Skeleton height={32} width={32} radius="sm" />
            </div>
            
            {/* Title Skeleton */}
            <Skeleton height={28} width="60%" className="mx-auto mb-2" />
            
            {/* Description Skeleton */}
            <Skeleton height={20} width="90%" className="mx-auto mb-6" />
            
            {/* Transaction ID Skeleton */}
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <Skeleton height={12} width="30%" className="mx-auto mb-1" />
              <Skeleton height={14} width="80%" className="mx-auto" />
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="space-y-3">
              <Skeleton height={48} width="100%" radius="md" />
              <Skeleton height={48} width="100%" radius="md" />
            </div>
            
            {/* Additional Info Skeleton */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Skeleton height={16} width="100%" />
            </div>
          </div>
        </div>
      </BatchTranslationLoader>
    );
  }

  if (success !== '1') {
    return (
      <BatchTranslationLoader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
            <Alert color="red" className="mb-6">
              {t('Payment was not completed successfully.')}
            </Alert>
            <Button 
              onClick={() => navigate('/dashboard/purchase-credits')}
              className="!bg-[#323334] hover:!bg-[#414546]"
            >
              {t('Try Again')}
            </Button>
          </div>
        </div>
      </BatchTranslationLoader>
    );
  }

  return (
    <BatchTranslationLoader>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('Payment Successful!')}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {t('Your credits have been successfully added to your account. You can now use them for SMS and email campaigns.')}
          </p>
          
          {/* Session ID (if available) */}
          {sessionId && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-xs text-gray-500 mb-1">{t('Transaction ID')}</p>
              <p className="text-sm font-mono text-gray-700 break-all">{sessionId}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              fullWidth
              onClick={() => navigate('/dashboard')}
              className="!bg-[#323334] hover:!bg-[#414546]"
              rightSection={<ArrowRight size={16} />}
            >
              {t('Go to Dashboard')}
            </Button>
            
            <Button 
              fullWidth
              variant="outline"
              onClick={() => navigate('/dashboard/purchase-credits')}
              leftSection={<CreditCard size={16} />}
            >
              {t('Purchase More Credits')}
            </Button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('💡 Tip: You can check your current credit balance in the dashboard or purchase credits page.')}
            </p>
          </div>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default CreditSuccess;