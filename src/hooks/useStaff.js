import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../configs/axios.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

const useGetStaff = (params = {}) => {
  const { search, sortBy, sortOrder, workingDay, position, page, limit } = params;
  
  return useQuery({
    queryKey: ["getStaff", search, sortBy, sortOrder, workingDay, position, page, limit],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortOrder) queryParams.set("sortOrder", sortOrder);
      if (workingDay) queryParams.set("workingDay", workingDay);
      if (position) queryParams.set("position", position);
      if (page) queryParams.set("page", page);
      if (limit) queryParams.set("limit", limit);
      
      const url = `/business/staff${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return axiosInstance.get(url);
    },
  });
};

const useGetStaffById = (staffId) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["getStaffById", staffId],
    queryFn: () => {
      return axiosInstance.get(`/business/staff/${staffId}`);
    },
    enabled: !!staffId,
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc("failedToFetchStaffMember")
      );
    },
  });
};

const useAddStaff = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (staffData) => {
      return axiosInstance.post("/business/staff", staffData);
    },
    onSuccess: () => {
      toast.success(tc("staffMemberAddedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });
      navigate("/dashboard/staff-management");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc("failedToAddStaffMember")
      );
    },
  });
};

const useUpdateStaff = (staffId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (staffData) => {
      return axiosInstance.put(`/business/staff/${staffId}`, staffData);
    },
    onSuccess: () => {
      toast.success(tc("staffMemberUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });
      navigate("/dashboard/staff-management");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc("failedToUpdateStaffMember")
      );
    },
  });
};

const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ staffId, reason }) => {
      return axiosInstance.delete(`/business/staff/${staffId}`, {
        data: { reason }
      });
    },
    onSuccess: () => {
      toast.success(tc("staffMemberDeletedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc("failedToDeleteStaffMember")
      );
    },
  });
};

/**
 * @typedef {Object} BreakPeriod
 * @property {string} start
 * @property {string} end
 * @property {string} [description]
 */

/**
 * @typedef {Object} Shift
 * @property {string} start - HH:mm
 * @property {string} end - HH:mm
 * @property {BreakPeriod[]} [breaks]
 */

/**
 * @typedef {Object} WorkingHoursDay
 * @property {string} day - lowercase day name (e.g., 'monday')
 * @property {boolean} enabled
 * @property {Shift[]} shifts
 * @property {string[]} [availableSlots] - optional list of HH:mm slots
 */

/**
 * @typedef {Object} StaffWorkingHours
 * @property {string} _id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} timeInterval
 * @property {WorkingHoursDay[]} workingHours
 */

/**
 * Get working hours and available slots for a staff member.
 * - GET /business/staff/:staffId/working-hours
 * - Query params: date (YYYY-MM-DD, optional), serviceId (optional)
 * - Returns { staff: StaffWorkingHours }
 *
 * @param {{ staffId: string, date?: string | Date, serviceId?: string }} params
 * @returns {import("@tanstack/react-query").UseQueryResult<StaffWorkingHours>}
 */
const useGetWorkingHours = ({ staffId, date, serviceId }) => {
  const { tc } = useBatchTranslation();

  const safeFormatYmd = (d) => {
    if (!d) return undefined;
    if (typeof d === "string") return d;
    try {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return undefined;
    }
  };

  return useQuery({
    queryKey: ["workingHours", staffId, date ? safeFormatYmd(date) : undefined, serviceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      const ymd = safeFormatYmd(date);
      if (ymd) params.set("date", ymd);
      if (serviceId) params.set("serviceId", serviceId);
      const url = `/business/staff/${staffId}/working-hours${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await axiosInstance.get(url);
      return res.data?.data?.staff || res.data?.data;
    },
    enabled: !!staffId,
    staleTime: 60_000,
    onError: (error) => {
      toast.error(error?.response?.data?.message || tc("failedToFetchWorkingHours"));
    },
  });
};

/**
 * Replicate a staff member's schedule from one day to multiple target days.
 * - POST /business/staff/:staffId/replicate-schedule
 * - Body: { sourceDay: string, targetDays: string[], overwriteExisting?: boolean }
 *
 * @param {string} staffId
 * @returns {import("@tanstack/react-query").UseMutationResult<any, unknown, { sourceDay: string, targetDays: string[], overwriteExisting?: boolean }>}
 */
const useReplicateSchedule = (staffId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ sourceDay, targetDays, overwriteExisting = false }) => {
      return axiosInstance.post(`/business/staff/${staffId}/replicate-schedule`, {
        sourceDay,
        targetDays,
        overwriteExisting,
      });
    },
    onSuccess: () => {
      toast.success(tc("scheduleReplicatedSuccessfully"));
      // Invalidate staff list and any working-hours queries for this staff
      queryClient.invalidateQueries({ queryKey: ["getStaff"] });
      queryClient.invalidateQueries({ queryKey: ["workingHours"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc("failedToReplicateSchedule")
      );
    },
  });
};

export { useGetStaff, useGetStaffById, useAddStaff, useUpdateStaff, useDeleteStaff, useGetWorkingHours, useReplicateSchedule };