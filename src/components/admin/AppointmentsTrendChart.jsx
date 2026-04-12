import React, { useMemo } from 'react';
import { AppointmentsTrendIcon } from '../common/Svgs';
import { FaCalendarAlt } from 'react-icons/fa';
import { useAdminAppointmentTrends } from '../../hooks/useAdmin';
import { Skeleton } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import i18n from '../../i18n';
import SimpleVerticalBarChart from '../common/charts/SimpleVerticalBarChart';

const ChartSkeleton = () => (
    <div className="h-[350px] w-full flex items-end gap-2 p-4">
        <Skeleton height="60%" width="8%" />
        <Skeleton height="40%" width="8%" />
        <Skeleton height="80%" width="8%" />
        <Skeleton height="50%" width="8%" />
        <Skeleton height="90%" width="8%" />
        <Skeleton height="30%" width="8%" />
        <Skeleton height="70%" width="8%" />
        <Skeleton height="55%" width="8%" />
        <Skeleton height="65%" width="8%" />
        <Skeleton height="45%" width="8%" />
        <Skeleton height="85%" width="8%" />
        <Skeleton height="75%" width="8%" />
    </div>
);

const AppointmentsTrendChart = ({ isLoading: isDashboardLoading }) => {
    const { tc } = useBatchTranslation();
    const { data: trendsData, isLoading: isTrendsLoading, error } = useAdminAppointmentTrends();
    
    const isLoading = isDashboardLoading || isTrendsLoading;

    const formattedDate = new Date().toLocaleDateString(i18n.language, { day: '2-digit', month: 'long', year: 'numeric' });

    const chartData = useMemo(() => {
        if (isLoading || error || !trendsData?.data?.monthlyCounts) {
            return [];
        }

        const labels = [tc('jan'), tc('feb'), tc('mar'), tc('apr'), tc('may'), tc('jun'), tc('jul'), tc('aug'), tc('sep'), tc('oct'), tc('nov'), tc('dec')];
        return labels.map((label, index) => ({
            label,
            value: trendsData.data.monthlyCounts[index]?.count || 0,
        }));
    }, [trendsData, isLoading, error, tc]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <AppointmentsTrendIcon />
                    <span className="ml-2 text-2xl">{tc('appointmentsTrend')}</span>
                </div>
                <div className="flex items-center bg-black text-white py-2 px-4 rounded-lg text-sm">
                    <FaCalendarAlt />
                    <span className="ml-2">{formattedDate}</span>
                </div>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl font-sans mt-6">
                {isLoading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <div className="flex justify-center items-center h-[350px] text-red-500">
                        {tc('failedToLoadAppointmentTrends')}
                    </div>
                ) : (chartData.length === 0) ? (
                    <div className="flex justify-center items-center h-[350px] text-gray-500">
                        {tc('noAppointmentDataAvailableYet')}
                    </div>
                ) : (
                    <SimpleVerticalBarChart
                        data={chartData}
                        height={350}
                        color="#6366F1"
                        emptyLabel={tc('noAppointmentDataAvailableYet')}
                    />
                )}
            </div>
        </div>
    );
};

export default AppointmentsTrendChart;
