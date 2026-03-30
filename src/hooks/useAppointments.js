import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../configs/axios.config";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

/**
 * Helper function to get user's timezone offset in minutes
 * Returns the offset in minutes (e.g., 300 for UTC+5, -300 for UTC-5)
 * 
 * JavaScript's getTimezoneOffset() returns the opposite sign:
 * - It returns minutes to SUBTRACT from UTC to get local time
 * - So for UTC+5 (Pakistan), it returns -300
 * - We need to negate it to get +300 (minutes to ADD to UTC)
 * 
 * This function automatically handles:
 * - All timezones globally (UTC-12 to UTC+14)
 * - Daylight Saving Time (DST) changes
 * - Half-hour and quarter-hour offsets (e.g., India UTC+5:30, Nepal UTC+5:45)
 * 
 * Examples:
 * - Pakistan (UTC+5): getTimezoneOffset() returns -300, function returns 300
 * - Spain (UTC+1): getTimezoneOffset() returns -60, function returns 60
 * - Spain (UTC+2 DST): getTimezoneOffset() returns -120, function returns 120
 * - India (UTC+5:30): getTimezoneOffset() returns -330, function returns 330
 * - Nepal (UTC+5:45): getTimezoneOffset() returns -345, function returns 345
 * - New York (UTC-5): getTimezoneOffset() returns 300, function returns -300
 * - New York (UTC-4 DST): getTimezoneOffset() returns 240, function returns -240
 */
const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  // getTimezoneOffset() returns minutes to subtract from UTC to get local time
  // So for UTC+5, it returns -300, and we need to return +300
  // For UTC-5, it returns 300, and we need to return -300
  return -offset;
};

// API functions
const createAppointment = async (appointmentData) => {
  const response = await axiosInstance.post(
    "/appointments/barber",
    appointmentData
  );
  return response.data;
};

const getAppointments = async (params = {}) => {
  // Debug: log the params being sent


  // Filter out undefined/null values and 'all' for staffId
  const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});



  const queryParams = new URLSearchParams(cleanedParams).toString();


  const response = await axiosInstance.get(`/appointments?${queryParams}`);
  return response.data;
};

const getAppointmentById = async (id) => {
  const response = await axiosInstance.get(`/appointments/${id}`);
  return response.data;
};

const updateAppointment = async ({ id, data }) => {
  const response = await axiosInstance.put(`/appointments/${id}`, data);
  return response.data;
};

const updateAppointmentStatus = async ({ id, status, reviewRequest, reviewMessage, incidentNote, blockClient }) => {
  const response = await axiosInstance.put(`/appointments/${id}/status`, {
    status,
    ...(reviewRequest !== undefined && { reviewRequest }),
    ...(reviewMessage !== undefined && { reviewMessage }),
    ...(incidentNote !== undefined && incidentNote.trim() && { incidentNote }),
    ...(blockClient !== undefined && { blockClient })
  });
  return response.data;
};

const getAppointmentStats = async () => {
  const response = await axiosInstance.get("/appointments/stats");
  return response.data;
};

const getDashboardStats = async (params = {}) => {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {})
  ).toString();
  const response = await axiosInstance.get(`/appointments/dashboard-stats?${queryParams}`);
  return response.data;
};

const getRevenueProjection = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/appointments/revenue-projection?${queryParams}`);
  return response.data;
};

const getAppointmentHistory = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/appointments/history?${queryParams}`);
  return response.data;
};

const applyPenalty = async ({ id, penaltyData }) => {
  const response = await axiosInstance.post(`/appointments/${id}/penalty`, penaltyData);
  return response.data;
};

const getClientPenalties = async (clientId) => {
  const response = await axiosInstance.get(`/appointments/penalties/${clientId}`);
  return response.data;
};

const payPenalty = async (penaltyId) => {
  const response = await axiosInstance.put(`/appointments/penalties/${penaltyId}/pay`);
  return response.data;
};

const notifyDelay = async ({ id, delayData }) => {
  const response = await axiosInstance.post(`/appointments/${id}/delay`, delayData);
  return response.data;
};

const getDelayInfo = async (id) => {
  const response = await axiosInstance.get(`/appointments/${id}/delay`);
  return response.data;
};

const getReminderSettings = async () => {
  const response = await axiosInstance.get('/appointments/reminder-settings');
  return response.data;
};

const updateReminderSettings = async ({ id, reminderData }) => {
  const response = await axiosInstance.put(`/appointments/${id}/reminder-settings`, reminderData);
  return response.data;
};

const sendAutomatedReminder = async (reminderData) => {
  const response = await axiosInstance.post('/appointments/automated-reminder', reminderData);
  return response.data;
};

const bulkUpdateReminderSettings = async (reminderData) => {
  const response = await axiosInstance.put('/appointments/bulk-update-reminder-settings', reminderData);
  return response.data;
};

const generateReviewLink = async (data) => {
  const response = await axiosInstance.post("/appointments/generate-review-link", data);
  return response.data;
};

// Hook exports
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      toast.success(tc('appointmentCreatedSuccessfully'));
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorCreatingAppointment'));
    },
  });
};

export const useGetAppointments = (params = {}) => {
  const { date, staffId, status, page, limit } = params;
  return useQuery({
    queryKey: ["appointments", date, staffId, status, page, limit],
    queryFn: () => getAppointments(params),
    enabled: !!date, // Only fetch when date is provided
    staleTime: 0, // Always consider data stale to ensure refetch
    refetchOnWindowFocus: true,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching appointments");
    },
  });
};

export const useGetAppointmentById = (id) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching appointment");
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      toast.success(tc('appointmentUpdatedSuccessfully'));
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorUpdatingAppointment'));
    },
  });
};

export const useUpdateAppointmentStatus = (options = {}) => {
  const { showToast = true } = options;
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: (data, variables) => {
      if (showToast) {
        toast.success(`${tc('appointmentMarkedAs')} ${variables.status.toLowerCase()}!`);
      }
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      if (showToast) {
        toast.error(error.response?.data?.message || tc('errorUpdatingAppointmentStatus'));
      }
    },
  });
};

export const useGetAppointmentStats = () => {
  return useQuery({
    queryKey: ["appointmentStats"],
    queryFn: getAppointmentStats,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching appointment stats");
    },
  });
};

export const useGetDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardStats", params],
    queryFn: () => getDashboardStats(params),
    staleTime: 0, // Always consider data stale to ensure background refetch on return
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching dashboard stats");
    },
  });
};

export const useGetRevenueProjection = (params = {}) => {
  return useQuery({
    queryKey: ["revenueProjection", params],
    queryFn: () => getRevenueProjection(params),
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching revenue projection");
    },
  });
};

export const useGetAppointmentHistory = (params = {}) => {
  return useQuery({
    queryKey: ["appointmentHistory", params],
    queryFn: () => getAppointmentHistory(params),
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error fetching appointment history");
    },
  });
};

export const useApplyPenalty = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: applyPenalty,
    onSuccess: () => {
      toast.success(tc('penaltyAppliedSuccessfully'));
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorApplyingPenalty'));
    },
  });
};

export const useGetClientPenalties = (clientId) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["clientPenalties", clientId],
    queryFn: () => getClientPenalties(clientId),
    enabled: !!clientId,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorFetchingClientPenalties'));
    },
  });
};

export const usePayPenalty = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: payPenalty,
    onSuccess: () => {
      toast.success(tc('penaltyPaidSuccessfully'));
      queryClient.invalidateQueries(["clientPenalties"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorPayingPenalty'));
    },
  });
};

export const useNotifyDelay = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: notifyDelay,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorSendingDelayNotification'));
    },
  });
};

export const useGetDelayInfo = (id) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["delayInfo", id],
    queryFn: () => getDelayInfo(id),
    enabled: !!id,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorFetchingDelayInfo'));
    },
  });
};

export const useGetReminderSettings = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["reminderSettings"],
    queryFn: getReminderSettings,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorFetchingReminderSettings'));
    },
  });
};

export const useUpdateReminderSettings = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: updateReminderSettings,
    onSuccess: () => {
      // Toast is handled in the component to avoid duplicate toasts
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorUpdatingReminderSettings'));
    },
  });
};

export const useSendAutomatedReminder = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: sendAutomatedReminder,
    onSuccess: (data) => {
      toast.success(tc('remindersSentSuccessfully'));
      queryClient.invalidateQueries(["appointments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorSendingAutomatedReminders'));
    },
  });
};

export const useBulkUpdateReminderSettings = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: bulkUpdateReminderSettings,
    onSuccess: (data, variables) => {
      const isEnabled = variables.appointmentReminder;

      // Show simple message about reminder status
      if (isEnabled) {
        toast.success(tc('appointmentRemindersEnabled'));
      } else {
        toast.success(tc('appointmentRemindersDisabled'));
      }

      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["reminderSettings"]); // Refresh reminder settings after update
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('errorUpdatingReminderSettings'));
    },
  });
};

export const useGenerateReviewLink = () => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: generateReviewLink,
    onSuccess: (data) => {
      // Toast is handled in the component for more specific messaging
    },
    onError: (error) => {
      // Error message is shown in the component to handle backend errors properly
    },
  });
};

export const useGetAvailableSlots = ({ businessId, serviceId, date, staffId }) => {
  return useQuery({
    queryKey: ["availableSlots", businessId, serviceId, date, staffId],
    queryFn: async () => {
      // Get user's timezone offset in minutes
      // This ensures slots are filtered based on the user's local timezone
      const timezoneOffset = getTimezoneOffset();

      // Format date to YYYY-MM-DD in user's local timezone
      const formatLocalYmd = (d) => {
        if (!d) return null;
        const dateObj = d instanceof Date ? d : new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formattedDate = formatLocalYmd(date);
      if (!formattedDate) {
        return [];
      }

      // Always use /appointments/available endpoint as it fully supports timezoneOffset
      // This ensures accurate time slot filtering based on user's local timezone
      // The staff working hours client-side endpoint may not support timezoneOffset yet
      // 
      // Note: timezoneOffset is sent both as:
      // 1. Query parameter (primary method - backend prefers this)
      // 2. HTTP header 'x-timezone-offset' (fallback - added automatically by axios interceptor)
      // This dual approach ensures maximum compatibility across all timezones globally
      const params = new URLSearchParams({
        businessId,
        serviceId,
        date: formattedDate,
        timezoneOffset: timezoneOffset.toString(), // Primary method: query parameter
      });
      if (staffId) {
        params.append('staffId', staffId);
      }

      const response = await axiosInstance.get(`/appointments/available?${params.toString()}`);
      return response.data?.data?.availableSlots || [];
    },
    enabled: !!(businessId && serviceId && date),
    retry: false,
  });
};