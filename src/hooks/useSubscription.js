import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessAPI } from "../services/businessAPI";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";
import { getCurrentUser } from "../utils/authUtils";
import custAxios from "../configs/axios.config";

// Get subscription status
export const useSubscriptionStatus = () => {
  // Resolve current user via local storage first, then fall back to /auth/me
  const storedUser = getCurrentUser('barber');

  const { data: meData } = useQuery({
    queryKey: ["me", !!storedUser],
    queryFn: async () => {
      const res = await custAxios.get("/auth/me");
      return res.data?.data; // backend wraps user under data
    },
    enabled: !!storedUser === false, // Only fetch if no stored user
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const userId = storedUser?._id || storedUser?.id || meData?._id || null;
  const user = storedUser || meData;

  return useQuery({
    queryKey: ["subscriptionStatus", userId || "unknown"],
    queryFn: async () => {
      const response = await businessAPI.getSubscriptionStatus();
      return response.data;
    },
    // Always refetch on mount/focus so new accounts get fresh status immediately
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    enabled: !!user, // only run when user data exists (authentication via cookies)
  });
};

// Start free trial mutation
export const useStartFreeTrial = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: async () => {
      const response = await businessAPI.startFreeTrial();
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(tc("freeTrialStartedSuccessfully"));
  // Invalidate subscription status to refetch
  queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || tc("failedToStartFreeTrial");
      toast.error(errorMessage);
    },
  });
};

// Create Stripe subscription mutation
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: async ({ priceId, skipToast = false }) => {
      try {
        const response = await businessAPI.createStripeSubscription({ priceId });
        return response.data;
      } catch (err) {
        const status = err?.response?.status;
        const message = err?.response?.data?.message || "";

        // If backend requires starting the trial first, do so and then retry subscription
        if (
          status === 400 &&
          typeof message === "string" &&
          message.toLowerCase().includes("start your free trial first")
        ) {
          // Attempt to start the free trial
          try {
            await businessAPI.startFreeTrial();
          } catch (startErr) {
            // If starting the trial fails (e.g., setup incomplete), bubble up that error
            throw startErr;
          }
          // Retry creating the subscription after starting the trial
          const retryResponse = await businessAPI.createStripeSubscription({ priceId });
          return retryResponse.data;
        }

        // For all other errors, bubble up
        throw err;
      }
    },
    onSuccess: (data, variables) => {
      // Only show toast if not skipped (for payment flow, we handle toasts in the components)
      // Also don't show toast if we're redirecting to checkout (requiresPayment: true)
      if (!variables.skipToast && !data.requiresPayment) {
        toast.success(tc("subscriptionCreatedSuccessfully"));
      }
  // Invalidate subscription status to refetch
  queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
    onError: (error, variables) => {
      // Only show toast if not skipped (for payment flow, we handle errors in the components)
      if (!variables.skipToast) {
        const errorMessage = error.response?.data?.message || tc("failedToCreateSubscription");
        toast.error(errorMessage);
      }
    },
  });
};