import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../configs/axios.config";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

const SERVICES_QUERY_KEY = "services";

// Hook to add a new service
export const useAddService = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (serviceData) => {
      const res = await axiosInstance.post("/business/services", serviceData);
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc("serviceAddedSuccessfully"));
      // Invalidate both services and business queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
    onError: (error) => {
      console.error("Add service error:", error);
      toast.error(error.response?.data?.message || tc("failedToAddService"));
      throw error;
    },
  });
};

// Hook to get all services
export const useGetServices = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY],
    queryFn: async () => {
      const res = await axiosInstance.get("/business/services");
      return res.data?.data || [];
    },
    onError: (error) => {
      console.error("Get services error:", error);
      toast.error(error.response?.data?.message || tc("failedToFetchServices"));
    },
  });
};

// Hook to update an existing service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ serviceId, serviceData }) => {
      const res = await axiosInstance.put(
        `/business/services/${serviceId}`,
        serviceData
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc("serviceUpdatedSuccessfully"));
      // Invalidate both services and business queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
    onError: (error) => {
      console.error("Update service error:", error);
      toast.error(error.response?.data?.message || tc("failedToUpdateService"));
      throw error;
    },
  });
};

// Hook to delete a service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ serviceId, reason }) => {
      const res = await axiosInstance.delete(`/business/services/${serviceId}`, {
        data: { reason }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc("serviceDeletedSuccessfully"));
      // Invalidate both services and business queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
    onError: (error) => {
      console.error("Delete service error:", error);
      toast.error(error.response?.data?.message || tc("failedToDeleteService"));
      throw error;
    },
  });
};