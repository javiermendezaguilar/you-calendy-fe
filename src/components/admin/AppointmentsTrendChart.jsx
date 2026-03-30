import React, { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AppointmentsTrendIcon } from '../common/Svgs';
import { FaCalendarAlt } from 'react-icons/fa';
import { useAdminAppointmentTrends } from '../../hooks/useAdmin';
import { Skeleton } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import i18n from '../../i18n';

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

    const series = useMemo(() => {
        if (isLoading || error || !trendsData?.data?.monthlyCounts) {
            return [{ name: tc('appointments'), data: [] }];
        }
        const appointmentData = trendsData.data.monthlyCounts.map(item => item.count || 0);
        return [{
            name: tc('appointments'),
            data: appointmentData,
        }];
    }, [trendsData, isLoading, error, tc]);

    const options = useMemo(() => ({
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'sans-serif',
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: false,
                columnWidth: '80%',
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: [tc('jan'), tc('feb'), tc('mar'), tc('apr'), tc('may'), tc('jun'), tc('jul'), tc('aug'), tc('sep'), tc('oct'), tc('nov'), tc('dec')],
            axisBorder: { show: true, color: '#9CA3AF', strokeDashArray: 4 },
            axisTicks: { show: true },
            labels: { style: { colors: '#6c757d', fontSize: '12px' } },
        },
        yaxis: {
            min: 0,
            labels: {
                style: { colors: '#6c757d', fontSize: '12px' },
                formatter: function (val) { return val.toFixed(0); }
            },
            tickAmount: 4,
            axisBorder: { show: true, color: '#9CA3AF', strokeDashArray: 4 },
            axisTicks: { show: true },
        },
        fill: { opacity: 1, colors: ['#6366F1'] },
        tooltip: {
            x: { show: true },
            y: {
                formatter: function (val) { return val; },
                title: { formatter: function () { return tc('appointments') + ':'; } }
            },
            marker: { show: false },
        },
        grid: {
            borderColor: '#D1D5DB',
            strokeDashArray: 4,
            position: 'back',
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } }
        },
        annotations: {
            xaxis: [
                { x: tc('feb'), fillColor: '#EBE5FC', borderColor: 'transparent', opacity: 0.6 }
            ]
        },
        states: {
            hover: { filter: { type: 'darken', value: 0.95 } },
            active: { filter: { type: 'none', value: 0 } }
        }
    }), [tc]);


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
                ) : (series[0].data.length === 0) ? (
                    <div className="flex justify-center items-center h-[350px] text-gray-500">
                        {tc('noAppointmentDataAvailableYet')}
                    </div>
                ) : (
                    <div id="chart">
                        <ReactApexChart options={options} series={series} type="bar" height={350} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsTrendChart;