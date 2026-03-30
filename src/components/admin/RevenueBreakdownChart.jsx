import React, { useMemo } from 'react';
import { RevenueBreakdownIcon } from '../common/Svgs';
import { useAdminRevenueProjection } from '../../hooks/useAdmin';
import { Skeleton } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const RevenueSkeleton = () => (
    <div className="text-center">
        <Skeleton height={20} width={150} mb="lg" />
        <Skeleton height={48} width={250} />
    </div>
);

const RevenueBreakdownChart = ({ isLoading: isDashboardLoading }) => {
    const { tc } = useBatchTranslation();
    const { data: revenueData, isLoading: isRevenueLoading, error } = useAdminRevenueProjection({ groupBy: 'month' });
    
    const isLoading = isDashboardLoading || isRevenueLoading;

    const totalRevenue = useMemo(() => {
        if (isLoading || error) return 0;
        return revenueData?.data?.totalRevenue || 0;
    }, [revenueData, isLoading, error]);

    return (
        <div>
            <div className="flex items-center mb-4">
                <RevenueBreakdownIcon />
                <span className="ml-2 text-2xl">{tc('revenue')}</span>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl mt-6 flex justify-center items-center h-[360px]">
                {isLoading ? (
                    <RevenueSkeleton />
                ) : error ? (
                    <div className="text-red-500">
                        {tc('failedToLoadRevenueData')}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-gray-500">{tc('totalRevenue')}</p>
                        <h3 className="text-5xl font-bold text-gray-800">
                            ${totalRevenue.toLocaleString()}
                        </h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueBreakdownChart;