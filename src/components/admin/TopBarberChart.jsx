import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AppointmentsTrendIcon } from '../common/Svgs';
import { useAdminTopBarbers } from '../../hooks/useAdmin';
import { Skeleton } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

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

    const { series, categories } = useMemo(() => {
        if (isLoading || error || !topBarbersData?.data) {
            return { series: [{ name: tc('appointments'), data: [] }], categories: [] };
        }
        const barbers = topBarbersData.data;
        const appointmentData = barbers.map(item => item.completedAppointments || 0);
        const barberNames = barbers.map(item => item.name || tc('unknown'));
        
        return {
            series: [{
                name: tc('appointments'),
                data: appointmentData,
            }],
            categories: barberNames
        };
    }, [topBarbersData, isLoading, error, tc]);

    const options = useMemo(() => ({
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: true,
                barHeight: '60%',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: categories,
            labels: {
                show: true,
                style: {
                    colors: '#6c757d',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: true,
                color: '#9CA3AF',
                strokeDashArray: 4
            },
            axisTicks: {
                show: true,
            },
            max: 200,
        },
        yaxis: {
            labels: {
                style: {
                    colors: ['#6c757d'],
                    fontSize: '14px',
                },
            }
        },
        grid: {
            show: true,
            borderColor: '#D1D5DB',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                }
            }
        },
        tooltip: {
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const barberName = w.globals.labels[dataPointIndex];
                const appointments = series[seriesIndex][dataPointIndex];
                return `<div class="p-2 bg-white border-none rounded-md shadow-lg">
                    <span class="font-bold">${barberName}</span><br/>
                    <span class="text-gray-500">${tc('appointments')} : ${appointments}</span>
                </div>`;
            }
        },
        colors: ['#63D4A6'],
        states: {
            hover: {
                filter: {
                    type: 'dark',
                    value: 0.1,
                }
            },
            active: {
                filter: {
                    type: 'none',
                    value: 0,
                }
            }
        }
    }), [categories, tc]);

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
                ) : (series[0].data.length === 0) ? (
                    <div className="flex justify-center items-center h-[400px] text-gray-500">
                        {tc('noBarberDataAvailableYet')}
                    </div>
                ) : (
                    <div id="top-barber-chart">
                        <ReactApexChart options={options} series={series} type="bar" height={400} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopBarberChart;