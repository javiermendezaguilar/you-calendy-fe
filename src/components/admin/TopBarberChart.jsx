import React, { useMemo } from 'react';
import { AppointmentsTrendIcon } from '../common/Svgs';
import { useAdminTopBarbers } from '../../hooks/useAdmin';
import { Skeleton } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import SimpleHorizontalBarChart from '../common/charts/SimpleHorizontalBarChart';

const TopBarberChartSkeleton = () => (
    <div className="h-[400px] w-full p-4 space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="70%" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="60%" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="80%" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="50%" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton height={20} width="20%" />
            <Skeleton height={20} width="75%" />
        </div>
    </div>
);

const TopBarberChart = ({ isLoading: isDashboardLoading }) => {
    const { tc } = useBatchTranslation();
    const { data: topBarbersData, isLoading: isTopBarbersLoading, error } = useAdminTopBarbers();
    
    const isLoading = isDashboardLoading || isTopBarbersLoading;

    const chartData = useMemo(() => {
        if (isLoading || error || !topBarbersData?.data) {
            return [];
        }
        const barbers = topBarbersData.data;
        return barbers.map((item) => ({
            label: item.name || tc('unknown'),
            value: item.completedAppointments || 0,
        }));
    }, [topBarbersData, isLoading, error, tc]);

    return (
        <div>
            <div className="flex items-center mb-4">
                <AppointmentsTrendIcon />
                <span className="ml-2 text-2xl">{tc('topBarber')}</span>
            </div>
            <div className=" bg-gray-100 rounded-xl font-sans mt-6">
                {isLoading ? (
                    <TopBarberChartSkeleton />
                ) : error ? (
                    <div className="flex justify-center items-center h-[400px] text-red-500">
                        {tc('failedToLoadTopBarbersData')}
                    </div>
                ) : (chartData.length === 0) ? (
                    <div className="flex justify-center items-center h-[400px] text-gray-500">
                        {tc('noBarberDataAvailableYet')}
                    </div>
                ) : (
                    <SimpleHorizontalBarChart
                        data={chartData}
                        color="#63D4A6"
                        emptyLabel={tc('noBarberDataAvailableYet')}
                    />
                )}
            </div>
        </div>
    );
};

export default TopBarberChart;
