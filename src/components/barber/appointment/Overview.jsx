import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import {
  AppointmentIcon,
} from "../../common/Svgs";
import { Badge, Skeleton, Tooltip, Select } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { Popover } from "@mantine/core";
import { FaCalendarAlt, FaInfoCircle, FaPercentage } from "react-icons/fa";
import { useGetDashboardStats } from "../../../hooks/useAppointments";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";
import dayjs from "dayjs";

// Agenda Occupancy Card Component
const AgendaOccupancyCard = ({
  percentage,
  bookedMinutes,
  availableMinutes,
  change,
  tooltip,
  tc,
}) => {
  const isPositive = change >= 0;
  return (
    <div className="border border-slate-100 p-3 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
      <div className="flex items-center justify-between">
        <div className="bg-[#E6F4FF] p-3 rounded-full inline-block">
          <FaPercentage size={20} color="#0055A4" />
        </div>
        <Tooltip
          label={tooltip}
          multiline
          width={280}
          withArrow
          position="left"
        >
          <div className="cursor-help">
            <FaInfoCircle size={16} color="#9CA3AF" />
          </div>
        </Tooltip>
      </div>
      <p className="text-sm text-slate-700 mt-2">{tc("agendaOccupancy")}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-medium">{percentage}%</p>
        <Badge color={isPositive ? "#D4E1FE" : "#FFE4E4"} radius={25}>
          <p className={isPositive ? "text-blue-900" : "text-red-900"}>
            {isPositive ? "+" : ""}
            {change}%
          </p>
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {bookedMinutes} / {availableMinutes} {tc("minutes")}
      </p>
    </div>
  );
};

// Appointments Total Card Component
const AppointmentsCard = ({ total, change, tooltip, tc }) => {
  const isPositive = change >= 0;
  return (
    <div className="border border-slate-100 p-3 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
      <div className="flex items-center justify-between">
        <div className="bg-[#F4FFE0] p-3 rounded-full inline-block">
          <AppointmentIcon size={20} stroke={2} color="#556B2F" />
        </div>
        <Tooltip
          label={tooltip}
          multiline
          width={280}
          withArrow
          position="left"
        >
          <div className="cursor-help">
            <FaInfoCircle size={16} color="#9CA3AF" />
          </div>
        </Tooltip>
      </div>
      <p className="text-sm text-slate-700 mt-2">{tc("appointments")}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-medium">{total}</p>
        <Badge color={isPositive ? "#D4E1FE" : "#FFE4E4"} radius={25}>
          <p className={isPositive ? "text-blue-900" : "text-red-900"}>
            {isPositive ? "+" : ""}
            {change}%
          </p>
        </Badge>
      </div>
    </div>
  );
};

// Appointment Status Card with Donut Chart
const AppointmentStatusCard = ({
  finished,
  cancelled,
  noShow,
  total,
  tooltips,
  tc,
  currentLanguage,
}) => {
  const chartOptions = {
    chart: {
      type: "donut",
      height: 200,
    },
    labels: [tc("finished"), tc("cancelled"), tc("noShows")],
    colors: ["#00BE70", "#FF6B6B", "#FFB347"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 600,
              formatter: () => total,
            },
            total: {
              show: true,
              label: tc("total"),
              fontSize: "12px",
              formatter: () => total,
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => {
          const percentage =
            total > 0 ? ((val / total) * 100).toFixed(1) : 0;
          return `${val} (${percentage}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 180,
          },
        },
      },
    ],
  };

  const chartSeries = [finished.count, cancelled.count, noShow.count];

  // Status item renderer
  const StatusItem = ({ label, count, percentage, change, color, tooltip }) => {
    const isPositive = change >= 0;
    const isNegativeMetric = label === tc("cancelled") || label === tc("noShows");
    // For negative metrics, decrease (negative change) is good
    const displayPositive = isNegativeMetric ? !isPositive : isPositive;

    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <Tooltip label={tooltip} multiline width={250} withArrow>
            <span className="text-sm text-slate-600 cursor-help">{label}</span>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{count}</span>
          <span className="text-xs text-gray-500">({percentage}%)</span>
          <Badge
            size="xs"
            color={displayPositive ? "#D4E1FE" : "#FFE4E4"}
            radius={25}
          >
            <span className={displayPositive ? "text-blue-900" : "text-red-900"}>
              {isPositive ? "+" : ""}
              {change}%
            </span>
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-slate-100 p-3 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white col-span-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-700">
          {tc("appointmentStatus")}
        </p>
        <Tooltip
          label={tc("appointmentStatusTooltip")}
          multiline
          width={280}
          withArrow
          position="left"
        >
          <div className="cursor-help">
            <FaInfoCircle size={16} color="#9CA3AF" />
          </div>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          {total > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={180}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              {tc("noDataAvailable")}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="flex flex-col justify-center">
          <StatusItem
            label={tc("finished")}
            count={finished.count}
            percentage={finished.percentage}
            change={finished.change}
            color="#00BE70"
            tooltip={tooltips?.finished}
          />
          <StatusItem
            label={tc("cancelled")}
            count={cancelled.count}
            percentage={cancelled.percentage}
            change={cancelled.change}
            color="#FF6B6B"
            tooltip={tooltips?.cancelled}
          />
          <StatusItem
            label={tc("noShows")}
            count={noShow.count}
            percentage={noShow.percentage}
            change={noShow.change}
            color="#FFB347"
            tooltip={tooltips?.noShow}
          />
        </div>
      </div>
    </div>
  );
};

const Overview = ({ selectedDate, onDateChange, staffId, onStaffChange }) => {
  const { tc, currentLanguage } = useBatchTranslation();
  const [internalDate, setInternalDate] = useState(
    selectedDate || dayjs().toDate()
  );
  const [internalStaffId, setInternalStaffId] = useState(staffId || "");
  const [popoverOpened, setPopoverOpened] = useState(false);

  // Sync internal state with props
  useEffect(() => {
    if (selectedDate) {
      setInternalDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (staffId !== undefined) {
      setInternalStaffId(staffId);
    }
  }, [staffId]);

  const dateObj = dayjs(internalDate);
  const month = dateObj.month() + 1;
  const year = dateObj.year();

  const {
    data: statsData,
    isLoading,
    isFetching,
    error,
  } = useGetDashboardStats({
    month,
    year,
    staffId: internalStaffId || undefined,
  });

  const handleDateChange = (date) => {
    if (!date) return;
    const normalizedDate = dayjs(date).startOf("month").toDate();
    setInternalDate(normalizedDate);
    setPopoverOpened(false);
    if (onDateChange) {
      onDateChange(normalizedDate);
    }
  };

  const handleStaffChange = (value) => {
    setInternalStaffId(value || "");
    if (onStaffChange) {
      onStaffChange(value || "");
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton height={36} width={120} radius="md" />
          <Skeleton height={36} width={150} radius="md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="border border-slate-100 p-3 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white"
            >
              <Skeleton height={40} width={40} radius="xl" className="mb-3" />
              <Skeleton height={16} width="60%" className="mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton height={24} width="40%" />
                <Skeleton height={20} width={50} radius="xl" />
              </div>
            </div>
          ))}
          <div className="col-span-2 border border-slate-100 p-3 rounded-xl shadow-[0px_14px_32.2px_0px_#E9EEF059] bg-white">
            <Skeleton height={180} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{tc("errorLoadingAppointmentStatistics")}</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }

  const data = statsData?.data;
  const staffList = data?.staffFilter?.staffList || [];

  return (
    <div key={currentLanguage} className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Date Picker */}
        <Popover
          opened={popoverOpened}
          onChange={setPopoverOpened}
          position="bottom-start"
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <button
              type="button"
              className="flex items-center bg-black text-white py-2 px-3 rounded-lg text-sm cursor-pointer hover:bg-black/90"
              onClick={() => setPopoverOpened((o) => !o)}
            >
              <FaCalendarAlt size={14} />
              <span className="ml-2">{tc(dateObj.locale('en').format("MMM").toLowerCase())} {dateObj.format("YYYY")}</span>
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <MonthPicker value={internalDate} onChange={handleDateChange} />
          </Popover.Dropdown>
        </Popover>

        {/* Staff Filter */}
        {staffList.length > 0 && (
          <Select
            placeholder={tc("allStaff")}
            value={internalStaffId || null}
            onChange={handleStaffChange}
            data={[
              { value: "", label: tc("allStaff") },
              ...staffList.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
            clearable
            size="sm"
            styles={{
              input: {
                minWidth: 150,
              },
            }}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Agenda Occupancy */}
        <AgendaOccupancyCard
          percentage={data?.agendaOccupancy?.percentage || 0}
          bookedMinutes={data?.agendaOccupancy?.bookedMinutes || 0}
          availableMinutes={data?.agendaOccupancy?.availableMinutes || 0}
          change={data?.agendaOccupancy?.change || 0}
          tooltip={tc(data?.tooltips?.agendaOccupancy || "agendaOccupancyTooltip")}
          tc={tc}
        />

        {/* Total Appointments */}
        <AppointmentsCard
          total={data?.appointments?.total || 0}
          change={data?.appointments?.change || 0}
          tooltip={tc(data?.tooltips?.appointments || "appointmentsTooltip")}
          tc={tc}
        />

        {/* Appointment Status (Finished, Cancelled, No-Show) */}
        <AppointmentStatusCard
          key={`status-chart-${currentLanguage}-${internalStaffId}-${month}-${year}`}
          currentLanguage={currentLanguage}
          finished={{
            count: data?.appointmentStatus?.finished?.count || 0,
            percentage: data?.appointmentStatus?.finished?.percentage || 0,
            change: data?.appointmentStatus?.finished?.change || 0,
          }}
          cancelled={{
            count: data?.appointmentStatus?.cancelled?.count || 0,
            percentage: data?.appointmentStatus?.cancelled?.percentage || 0,
            change: data?.appointmentStatus?.cancelled?.change || 0,
          }}
          noShow={{
            count: data?.appointmentStatus?.noShow?.count || 0,
            percentage: data?.appointmentStatus?.noShow?.percentage || 0,
            change: data?.appointmentStatus?.noShow?.change || 0,
          }}
          total={data?.appointments?.total || 0}
          tooltips={{
            finished: tc(data?.tooltips?.finished || "finishedTooltip"),
            cancelled: tc(data?.tooltips?.cancelled || "cancelledTooltip"),
            noShow: tc(data?.tooltips?.noShow || "noShowTooltip"),
          }}
          tc={tc}
        />
      </div>

      {/* Period Comparison Note */}
      <div className="mt-3 p-2 bg-slate-50 rounded-lg">
        <Tooltip
          label={tc(data?.tooltips?.percentageChange || "percentageChangeTooltip")}
          multiline
          width={280}
          withArrow
        >
          <p className="text-xs text-gray-500 cursor-help flex items-center gap-1">
            <FaInfoCircle size={12} />
            {tc("comparedToPreviousMonth")} (
            {data?.previousPeriod
              ? `${tc(dayjs().month(data.previousPeriod.month - 1).format("MMM"))} ${data.previousPeriod.year}`
              : ""}
            )
          </p>
        </Tooltip>
      </div>
    </div>
  );
};

export default Overview;
