import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "../configs/axios.config";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

// Helper function to extract error message from response
// Handles both string messages and object messages (e.g., MULTIPLE_DISCOUNTS_WARNING)
const getErrorMessage = (error, fallbackMessage) => {
  const errorMessage = error?.response?.data?.message;
  
  // If message is a string, return it
  if (typeof errorMessage === 'string') {
    return errorMessage;
  }
  
  // If message is an object with a message property, extract it
  if (errorMessage && typeof errorMessage === 'object' && errorMessage.message) {
    return errorMessage.message;
  }
  
  // Fallback to default message
  return fallbackMessage;
};

const useCreateFlashSale = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await axiosInstance.post("/flash-sales", payload);
        return data;
      } catch (error) {
        // Check if it's a promotion overlap warning
        const errorData = error?.response?.data;
        const messageData = errorData?.message;

        // Check if message is an object with PROMOTION_OVERLAP_WARNING code
        if (messageData && typeof messageData === 'object' && messageData.code === "PROMOTION_OVERLAP_WARNING") {
          // Create a custom error object that React Query can handle
          const customError = new Error(messageData.message || "Promotion overlap detected");
          customError.isPromotionOverlap = true;
          customError.promotionData = messageData;
          customError.response = error.response; // Preserve original response
          throw customError;
        }
        throw new Error(
          getErrorMessage(error, tc("failedToCreateFlashSale"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("flashSaleCreatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
    },
    onError: (error) => {
      // Don't show toast for promotion overlap - component will handle it
      if (!error.isPromotionOverlap) {
        toast.error(error.message);
      }
    },
  });
};

const useGetFlashSales = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["flash-sales"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/flash-sales");
        // Handle both response structures: { success: true, data: { flashSales: [...] } }
        // and direct { flashSales: [...] }
        const flashSales = data?.data?.flashSales || data?.flashSales || [];
        return Array.isArray(flashSales) ? flashSales : [];
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchFlashSales"))
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      try {
        const { data } = await axiosInstance.put(`/flash-sales/${id}`, payload);
        return data;
      } catch (error) {
        // Check if it's a promotion overlap warning
        const errorData = error?.response?.data;
        const messageData = errorData?.message;

        // Check if message is an object with PROMOTION_OVERLAP_WARNING code
        if (messageData && typeof messageData === 'object' && messageData.code === "PROMOTION_OVERLAP_WARNING") {
          // Create a custom error object that React Query can handle
          const customError = new Error(messageData.message || "Promotion overlap detected");
          customError.isPromotionOverlap = true;
          customError.promotionData = messageData;
          customError.flashSaleId = id;
          customError.response = error.response; // Preserve original response
          throw customError;
        }
        throw new Error(
          getErrorMessage(error, tc("failedToUpdateFlashSale"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("flashSaleUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-stats"] });
    },
    onError: (error) => {
      // Don't show toast for promotion overlap - component will handle it
      if (!error.isPromotionOverlap) {
        toast.error(error.message);
      }
    },
  });
};

const useDeleteFlashSale = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (id) => {
      try {
        const { data } = await axiosInstance.delete(`/flash-sales/${id}`);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToDeleteFlashSale"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("flashSaleDeletedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-stats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useToggleFlashSaleStatus = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ id, applyBothDiscounts }) => {
      try {
        const payload = applyBothDiscounts !== undefined ? { applyBothDiscounts } : {};
        const { data } = await axiosInstance.patch(`/flash-sales/${id}/toggle`, payload);
        return data;
      } catch (error) {
        // Check if it's a promotion overlap warning
        const errorData = error?.response?.data;
        const messageData = errorData?.message;

        // Check if message is an object with PROMOTION_OVERLAP_WARNING code
        if (messageData && typeof messageData === 'object' && messageData.code === "PROMOTION_OVERLAP_WARNING") {
          // Create a custom error object that React Query can handle
          const customError = new Error(messageData.message || "Promotion overlap detected");
          customError.isPromotionOverlap = true;
          customError.promotionData = messageData;
          customError.flashSaleId = id;
          customError.response = error.response; // Preserve original response
          throw customError;
        }
        throw new Error(
          getErrorMessage(error, tc("failedToToggleFlashSaleStatus"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("flashSaleStatusUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-stats"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] }); // Invalidate promotions to refresh applyBothDiscounts
    },
    onError: (error) => {
      // Don't show toast for promotion overlap - component will handle it
      if (!error.isPromotionOverlap) {
        toast.error(error.message);
      }
    },
  });
};

const useGetFlashSaleById = (id) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["flash-sale", id],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(`/flash-sales/${id}`);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchFlashSale"))
        );
      }
    },
    enabled: !!id,
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useGetFlashSaleStats = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["flash-sale-stats"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/flash-sales/stats");
        // Handle both response structures: { success: true, data: {...} }
        // and direct object
        return data?.data || data || {};
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchFlashSaleStats"))
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Public hooks for client-side (no authentication required)
const useGetActiveFlashSales = (businessId) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["active-flash-sales", businessId],
    queryFn: async () => {
      try {
        if (!businessId) return [];
        const { data } = await axiosInstance.get(`/flash-sales/active?businessId=${businessId}`);
        // Handle both response structures: { success: true, data: { flashSales: [...] } }
        // and direct { flashSales: [...] }
        const flashSales = data?.data?.flashSales || data?.flashSales || [];
        return Array.isArray(flashSales) ? flashSales : [];
      } catch (error) {
        // Don't show error toast for public endpoints, just return empty array
        console.error('Error fetching active flash sales:', error.response?.data || error.message);
        return [];
      }
    },
    enabled: !!businessId,
    retry: 1, // Retry once on failure
  });
};

const useGetActivePromotions = (businessId, selectedDate = null) => {
  const { tc } = useBatchTranslation();
  
  // Calculate day of week from selected date if provided
  const dayOfWeek = selectedDate 
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    : null;
  
  return useQuery({
    queryKey: ["active-promotions", businessId, dayOfWeek],
    queryFn: async () => {
      try {
        if (!businessId) return [];
        
        // Build query string
        let queryString = `businessId=${businessId}`;
        if (dayOfWeek) {
          queryString += `&dayOfWeek=${dayOfWeek}`;
        }
        
        const { data } = await axiosInstance.get(`/promotions/active?${queryString}`);
        // Handle both response structures: { success: true, data: { promotions: [...] } }
        // and direct { promotions: [...] }
        const promotions = data?.data?.promotions || data?.promotions || [];
        return Array.isArray(promotions) ? promotions : [];
      } catch (error) {
        // Don't show error toast for public endpoints, just return empty array
        console.error('Error fetching active promotions:', error);
        return [];
      }
    },
    enabled: !!businessId && !!dayOfWeek, // Only fetch when we have both businessId and dayOfWeek
  });
};

const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await axiosInstance.post("/promotions", payload);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToCreatePromotion"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("promotionCreatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useGetPromotions = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/promotions");
        // Handle both response structures: { success: true, data: { promotions: [...] } } 
        // and direct { promotions: [...] }
        return data?.data?.promotions || data?.promotions || [];
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchPromotions"))
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      try {
        const { data } = await axiosInstance.put(`/promotions/${id}`, payload);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToUpdatePromotion"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("promotionUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async ({ id, applyBothDiscounts }) => {
      try {
        const payload = applyBothDiscounts !== undefined ? { applyBothDiscounts } : {};
        const { data } = await axiosInstance.patch(`/promotions/${id}/toggle`, payload);
        return data;
      } catch (error) {
        // Check if it's a flash sale overlap warning
        // ErrorHandler returns: { success: false, message: { message: "...", code: "...", ... } }
        const errorData = error?.response?.data;
        const messageData = errorData?.message;
        
        // Check if message is an object with FLASH_SALE_OVERLAP_WARNING code
        if (messageData && typeof messageData === 'object' && messageData.code === "FLASH_SALE_OVERLAP_WARNING") {
          // Create a custom error object that React Query can handle
          const customError = new Error(messageData.message || "Flash sale overlap detected");
          customError.isFlashSaleOverlap = true;
          customError.flashSaleData = messageData;
          customError.promotionId = id;
          customError.response = error.response; // Preserve original response
          throw customError;
        }
        throw new Error(
          getErrorMessage(error, tc("failedToTogglePromotionStatus"))
        );
      }
    },
    onSuccess: () => {
      toast.success(tc("promotionStatusUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => {
      // Don't show toast for flash sale overlap - component will handle it
      if (!error.isFlashSaleOverlap) {
        toast.error(error.message);
      }
    },
  });
};

// Message Blast hooks
const useSendEmailBlast = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await axiosInstance.post("/business/message-blast/email", payload);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToSendEmailBlast"))
        );
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || tc("emailBlastSentSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["message-blast-stats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useGetRecipientGroups = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["recipient-groups"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/business/message-blast/recipient-groups");
        return data?.data || [];
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchRecipientGroups"))
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useGetMessageBlastStats = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["message-blast-stats"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/business/message-blast/stats");
        return data || {};
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToFetchMessageBlastStats"))
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useSendSMSBlast = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await axiosInstance.post("/business/sms-campaigns", payload);
        return data;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, tc("failedToCreateSMSCampaign"))
        );
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || tc("smsCampaignCreatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["message-blast-stats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { 
  useCreateFlashSale, 
  useGetFlashSales,
  useUpdateFlashSale,
  useDeleteFlashSale,
  useToggleFlashSaleStatus,
  useGetFlashSaleById,
  useGetFlashSaleStats,
  useGetActiveFlashSales,
  useCreatePromotion, 
  useGetPromotions,
  useUpdatePromotion,
  useTogglePromotionStatus,
  useGetActivePromotions,
  useSendEmailBlast,
  useGetRecipientGroups,
  useGetMessageBlastStats,
  useSendSMSBlast
};