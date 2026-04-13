import React, { Suspense, lazy, useState } from 'react';
import { Button, Skeleton } from '@mantine/core';
import { MonthlyAppointmentsIcon, AnnualAppointmentsIcon, TotalRevenueIcon, RecurringVsNewClientsIcon } from '../../components/common/Svgs';
import { useAdminUserStats, useAdminRevenueProjection, useAdminAppointmentTrends } from '../../hooks/useAdmin';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import { toast } from 'sonner';

const AppointmentsTrendChart = lazy(() => import('../../components/admin/AppointmentsTrendChart'));
const TopBarberChart = lazy(() => import('../../components/admin/TopBarberChart'));

const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div className="stat-info">
            <Skeleton height={14} width={150} mb="sm" />
            <Skeleton height={28} width={100} />
        </div>
        <Skeleton height={64} circle />
    </div>
);

const ChartCardSkeleton = ({ height = 350 }) => (
  <div className="bg-white p-6 rounded-xl shadow-md mt-6">
    <Skeleton height={height} />
  </div>
);

const AdminDashboard = () => {
  const { tc } = useBatchTranslation();
  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useAdminUserStats();
  const { data: revenueData, isLoading: revenueLoading } = useAdminRevenueProjection({ groupBy: 'month' });
  const { data: trendsData, isLoading: trendsLoading } = useAdminAppointmentTrends();
  
  const [isExporting, setIsExporting] = useState(false);

  // Combined loading state for the top stat cards
  const isStatsLoading = userStatsLoading || revenueLoading || trendsLoading;
  
  const error = userStatsError;

  const monthlyAppointments = trendsData?.data?.monthlyCounts?.reduce((sum, month) => sum + (month.count || 0), 0) || 0;
  
  const completionRate = revenueData?.data?.summary?.completionRate
    ? `${Math.round(revenueData.data.summary.completionRate)}%`
    : 'N/A';

  const statsData = [
    {
      title: tc('monthlyAppointments'),
      value: monthlyAppointments.toLocaleString(),
      icon: <MonthlyAppointmentsIcon />,
      color: '#F4FFE0',
    },
    {
      title: tc('totalRevenue'),
      value: `$${(revenueData?.data?.totalRevenue ?? 0).toLocaleString()}`,
      icon: <TotalRevenueIcon />,
      color: '#EDF6FF',
    },
    {
      title: tc('totalBarbers'),
      value: (userStats?.data?.barbers?.total ?? 0).toLocaleString(),
      icon: <AnnualAppointmentsIcon />,
      color: '#F4FFE0',
    },
    {
      title: tc('completionRate'),
      value: completionRate,
      icon: <RecurringVsNewClientsIcon />,
      color: '#EDF6FF',
    },
  ];
  
  const iconColorClasses = {
    '#F4FFE0': "bg-[#F4FFE0] [&_path]:fill-[#556B2F]",
    '#EDF6FF': "bg-[#EDF6FF] [&_path]:fill-[#003366]"
  };

  // Export handlers
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const { exportToCSV, prepareDashboardData } = await import('../../utils/exportUtils');
      const exportData = prepareDashboardData(userStats, revenueData, trendsData);
      await exportToCSV(exportData);
      toast.success(tc('csvExportedSuccessfully') || 'CSV exported successfully!');
    } catch {
      toast.error(tc('csvExportFailed') || 'Failed to export CSV file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const { exportToPDF, prepareDashboardData } = await import('../../utils/exportUtils');
      const exportData = prepareDashboardData(userStats, revenueData, trendsData);
      await exportToPDF(exportData);
      toast.success(tc('pdfExportedSuccessfully') || 'PDF exported successfully!');
    } catch {
      toast.error(tc('pdfExportFailed') || 'Failed to export PDF file');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BatchTranslationLoader>
      <div className='h-[83vh] overflow-auto'>

        <div className="p-6 bg-white rounded-xl font-sans admin-dashboard-content">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4 sm:gap-0">
            <div className="header-left">
              <h1 className="m-0 text-2xl">{tc('adminDashboard')}</h1>
              <p className="m-0 text-[#939799]">{tc('overviewOfPlatformStatistics')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <Button            
                style={{
                  border: '1px solid #000',
                  color: '#000'
                }}
                variant="subtle"
                radius="md"
                className="w-full sm:w-auto"
                onClick={handleExportCSV}
                loading={isExporting}
                disabled={isStatsLoading || error}
              >
                {tc('exportCSV')}
              </Button>
              <Button
                style={{
                  color: '#fff',
                }}
                variant="filled"
                color="dark"
                radius="md"
                className="w-full sm:w-auto"
                onClick={handleExportPDF}
                loading={isExporting}
                disabled={isStatsLoading || error}
              >
                {tc('exportPDF')}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isStatsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : error ? (
              <div className="col-span-full text-center py-8 text-red-500">
                {tc('failedToLoadDashboardStatistics')}
              </div>
            ) : (
              statsData.map((stat, index) => (
                <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center" key={index}>
                  <div className="stat-info">
                    <p className="m-0 text-[#323334] text-sm uppercase" data-translated="true">{stat.title}</p>
                    <h2 className="m-0 text-2xl">{stat.value}</h2>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex justify-center items-center ${iconColorClasses[stat.color]}`}>
                    {React.cloneElement(stat.icon, { className: 'w-7 h-7' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Suspense fallback={<ChartCardSkeleton height={350} />}>
          <AppointmentsTrendChart isLoading={trendsLoading} />
        </Suspense>
        <div className="bg-white p-6 rounded-xl shadow-md mt-6  gap-6">
          <div>
            <Suspense fallback={<Skeleton height={400} />}>
              <TopBarberChart isLoading={userStatsLoading} />
            </Suspense>
          </div>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default AdminDashboard;
