import { axiosInstance } from "../configs/axios.config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

// Hook to get the current user's business details
export const useGetBusiness = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const res = await axiosInstance.get("/business");
      return res.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToFetchBusinessDetails'));
    }
  });
};

// Hook to update business's general information
export const useUpdateBusinessInfo = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/business/info", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success(tc('businessInformationUpdatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdateBusinessInformation'));
    },
  });
};

// Hook to update business address
export const useUpdateBusinessAddress = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/business/address", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success(tc('businessAddressUpdatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdateBusinessAddress'));
    },
  });
};

// Hook to update business location
export const useUpdateBusinessLocation = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/business/location", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc('locationUpdatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["businessDetails"] });
    },
    onError: (error) => {
      console.error("Location update error:", error);
      toast.error(
        error.response?.data?.message || tc('failedToUpdateLocation')
      );
      throw error;
    },
  });
};

// Hook to update business hours
export const useUpdateBusinessHours = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/business/hours", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success(tc('businessHoursUpdatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdateBusinessHours'));
    },
  });
};

// Hook to update business settings (logo, workplace photos)
export const useUpdateBusinessSettings = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      // Expects formData for file uploads
      const res = await axiosInstance.put("/business/settings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all business-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["businessSettings"] });
      queryClient.invalidateQueries({ queryKey: ["businessDetails"] });
      // Don't show toast here - let the caller handle it for better control
    },
    onError: (error) => {
      console.error("Business settings update error:", error);
      toast.error(
        error.response?.data?.message || tc('failedToUpdateSettings')
      );
      throw error;
    },
  });
};

export const useUploadBusinessImages = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosInstance.put("/business/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success(tc('imagesUploadedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUploadImages'));
    },
  });
};

// Hook to get business settings (logo, workplace photos, gallery images)
export const useGetBusinessSettings = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["businessSettings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/business/settings");
      return res.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToFetchBusinessSettings'));
    }
  });
};