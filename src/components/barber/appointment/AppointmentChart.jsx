import React, { useState, useEffect, useCallback } from 'react';
import ReactApexChart from "react-apexcharts";
import { FaCalendarAlt, FaUsers, FaUser } from "react-icons/fa";
import { MonthPicker } from "@mantine/dates";
import { Popover, Skeleton, Select, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { axiosInstance } from '../../../configs/axios.config';
import { useBatchTranslation } from '../../../contexts/BatchTranslationContext';
import { useGetStaff } from '../../../hooks/useStaff';

const AppointmentChart = ({ selectedDate: propsDate, onDateChange, selectedStaffId: propsStaffId, onStaffChange }) => {
  const [selectedDate, setSelectedDate] = useState(propsDate || dayjs().startOf('year').toDate());
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('year');
  const [selectedStaffId, setSelectedStaffId] = useState(propsStaffId || ''); // '' means all staff (global)
  const { tc, currentLanguage } = useBatchTranslation();
  
  // Sync with props
  useEffect(() => {
    if (propsDate) {
      setSelectedDate(propsDate);
      if (viewMode === 'year' && dayjs(propsDate).year() !== dayjs(selectedDate).year()) {
          // Keep year view if we just changed year via props
      } else {
          setViewMode('month');
      }
    }
  }, [propsDate]);

  useEffect(() => {
    if (propsStaffId !== undefined) {
      setSelectedStaffId(propsStaffId);
    }
  }, [propsStaffId]);

  // Fetch staff members for the filter dropdown
  const { data: staffData } = useGetStaff({ limit: 100 });
  const staffList = staffData?.data?.data?.staff || [];

  // Fetch revenue projection data with date filtering and optional staff filter
  const fetchRevenueData = useCallback(async (startDate, endDate, groupBy = 'month', staffId = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        groupBy
      });
      
      // Add staff filter if selected
      if (staffId) {
        params.append('staffId', staffId);
      }


      const response = await axiosInstance.get(`/appointments/revenue-projection?${params}`);

      setRevenueData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || tc('errorLoadingRevenueData'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when component mounts or date/staff changes
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const d = dayjs(selectedDate);


    if (viewMode === 'year') {
      const startOfYear = d.startOf('year');
      const endOfYear = d.endOf('year');

      fetchRevenueData(startOfYear, endOfYear, 'month', selectedStaffId);
    } else {
      const startOfMonth = d.startOf('month');
      const endOfMonth = d.endOf('month');

      fetchRevenueData(startOfMonth, endOfMonth, 'day', selectedStaffId);
    }
  }, [fetchRevenueData, selectedDate, viewMode, selectedStaffId]);

  const handleDateChange = (date) => {
    if (!date) {
      return;
    }

    const normalizedDate = dayjs(date).startOf("month").toDate();

    setSelectedDate(normalizedDate);
    setViewMode('month');
    setPopoverOpened(false);
    if (onDateChange) {
      onDateChange(normalizedDate);
    }
  };

  const handleYearOverview = () => {
    const startOfYear = dayjs(selectedDate).startOf('year').toDate();
    setSelectedDate(startOfYear);
    setViewMode('year');
    if (onDateChange) {
      onDateChange(startOfYear);
    }
  };
  
  const handleStaffChange = (value) => {
    const newStaffId = value || '';
    setSelectedStaffId(newStaffId);
    if (onStaffChange) {
      onStaffChange(newStaffId);
    }
  };

  // Prepare chart data
  const getChartData = () => {


    if (viewMode === 'year') {
      const allMonths = [
        tc('jan'), tc('feb'), tc('mar'), tc('apr'), tc('may'), tc('jun'),
        tc('jul'), tc('aug'), tc('sep'), tc('oct'), tc('nov'), tc('dec')
      ];

      const monthlyData = new Array(12).fill(0);

      const selectedYear = selectedDateObj.year();


      revenueData?.revenueData?.forEach((item) => {
        const parsed = dayjs(item.date);
        const itemYear = parsed.year();
        const monthIndex = parsed.month();
        const matches = parsed.isValid() && itemYear === selectedYear;


        if (matches) {
          monthlyData[monthIndex] = item.revenue || 0;
        }
      });


      return {
        series: [{ name: tc("revenue"), data: monthlyData }],
        categories: allMonths
      };
    }

    // Month view
    const daysInMonth = selectedDateObj.daysInMonth();
    const dailyData = new Array(daysInMonth).fill(0);
    const dayCategories = Array.from({ length: daysInMonth }, (_, index) => `${index + 1}`);

    const selectedYear = selectedDateObj.year();
    const selectedMonth = selectedDateObj.month();



    revenueData?.revenueData?.forEach((item) => {
      const parsed = dayjs(item.date);
      const itemYear = parsed.year();
      const itemMonth = parsed.month();
      const dayIndex = parsed.date() - 1;
      const matches = parsed.isValid() && itemYear === selectedYear && itemMonth === selectedMonth;



      if (matches) {
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          dailyData[dayIndex] = item.revenue || 0;
        }
      }
    });


    return {
      series: [{ name: tc("revenue"), data: dailyData }],
      categories: dayCategories
    };
  };

  const buttonBaseClass = "flex items-center bg-black text-white py-2 px-4 rounded-lg text-sm mt-4 sm:mt-0 cursor-pointer hover:bg-black/90";
  const selectedDateObj = dayjs(selectedDate);
  const chartData = getChartData();
  const options = {
    chart: {
      type: "bar",
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#00BE7099"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: viewMode === 'year' ? "55%" : "35%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: viewMode === 'year' ? tc('months') : tc('days'),
      },
      labels: {
        rotate: 0,
        rotateAlways: false,
        hideOverlappingLabels: false,
        trim: false,
        style: {
          fontSize: '11px',
        },
      },
      tickPlacement: 'on',
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          if (val === 0) return '0';
          return Number(val.toFixed(2)).toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        formatter: (val) => {
          if (viewMode === 'month') {
            return `${tc('day')} ${val}`;
          }
          return val;
        },
      },
      y: {
        formatter: (val) => val === 0 ? tc('noDataAvailable') : `$${val.toLocaleString()}`,
      },
    },
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{tc('errorLoadingRevenueData')}</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }
  
  // Get selected staff name for display
  const selectedStaffItem = selectedStaffId ? staffList.find(s => s._id === selectedStaffId) : null;
  const selectedStaffName = selectedStaffId 
    ? (selectedStaffItem ? `${selectedStaffItem.firstName} ${selectedStaffItem.lastName}` : tc('loading'))
    : tc('allStaff');

  return (
    <div key={currentLanguage} className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-medium">{tc('appointmentsOccupancy')}</p>
            {/* Staff indicator badge */}
            <Tooltip label={selectedStaffId ? tc('showingIndividualPerformance') : tc('showingGlobalPerformance')}>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${selectedStaffId ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {selectedStaffId ? <FaUser size={10} /> : <FaUsers size={10} />}
                <span>{selectedStaffName}</span>
              </div>
            </Tooltip>
          </div>
          <p className="text-sm text-blue-700">{tc('revenueProjection')}</p>
          {revenueData && (
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span>{tc('totalRevenue')}: ${Number(revenueData.totalRevenue ?? 0).toLocaleString()}</span>
              <span>{tc('totalAppointments')}: {Number(revenueData.totalAppointments ?? 0).toLocaleString()}</span>
              <span>{tc('avgPerAppointment')}: ${Number(revenueData.averageRevenuePerAppointment ?? 0).toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          {staffList.length > 0 && (
            <Select
              placeholder={tc('selectStaff')}
              value={selectedStaffId || null}
              onChange={handleStaffChange}
              data={[
                { value: '', label: tc('allStaff') + ' (' + tc('global') + ')' },
                ...staffList.map((s) => ({
                  value: s._id,
                  label: `${s.firstName} ${s.lastName}`,
                })),
              ]}
              clearable
              size="sm"
              leftSection={selectedStaffId ? <FaUser size={12} /> : <FaUsers size={12} />}
              styles={{
                input: {
                  minWidth: 180,
                },
              }}
            />
          )}
          
          {/* Date Picker */}
          <Popover
            opened={popoverOpened}
            onChange={setPopoverOpened}
            position="bottom-end"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <button
                type="button"
                className={buttonBaseClass}
                onClick={() => setPopoverOpened((o) => !o)}
              >
                <FaCalendarAlt />
                <span className="ml-2">
                  {viewMode === 'year'
                    ? dayjs(selectedDate).format("YYYY")
                    : `${tc(dayjs(selectedDate).locale('en').format("MMM").toLowerCase())} ${dayjs(selectedDate).format("YYYY")}`}
                </span>
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <MonthPicker
                value={selectedDate}
                onChange={handleDateChange}
              />
            </Popover.Dropdown>
          </Popover>
          
          {viewMode === 'month' && (
            <button
              type="button"
              className={buttonBaseClass}
              onClick={handleYearOverview}
            >
              <FaCalendarAlt />
              <span className="ml-2">{tc('viewYearlyOverview')}</span>
            </button>
          )}
        </div>
      </div>

      <div id="chart" className="overflow-x-auto">
        {!revenueData && isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton height={20} width="60%" />
            <Skeleton height={300} />
            <div className="flex gap-4">
              <Skeleton height={16} width="30%" />
              <Skeleton height={16} width="25%" />
              <Skeleton height={16} width="35%" />
            </div>
          </div>
        ) : (
          <div style={{ minWidth: chartData.categories.length * 30 }}>
            <ReactApexChart
              key={`chart-${currentLanguage}-${viewMode}-${selectedDateObj.format('YYYY-MM')}-${selectedStaffId}`}
              options={options}
              series={chartData.series}
              type="bar"
              height={340}
              width="100%"
            />
          </div>
        )}
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default AppointmentChart;
