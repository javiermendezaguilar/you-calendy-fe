import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessAPI } from "../services/businessAPI";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";
import { getCurrentUser } from "../utils/authUtils";

export const SUBSCRIPTION_STATUS_STALE_TIME = 60 * 1000;
export const getSubscriptionStatusQueryKey = (userId) => [
  "subscriptionStatus",
  userId || "unknown",
];
export const fetchSubscriptionStatus = async () => {
  const response = await businessAPI.getSubscriptionStatus();
  return response.data;
};

// Get subscription status
export const useSubscriptionStatus = () => {
  // Protected barber routes are gated by local auth state before mounting.
  // Hitting /auth/me without that state creates noisy auth/CORS failures in previews.
  const storedUser = getCurrentUser('barber');
  const userId = storedUser?._id || storedUser?.id || null;
  const user = storedUser || null;

  return useQuery({
    queryKey: getSubscriptionStatusQueryKey(userId),
    queryFn: fetchSubscriptionStatus,
    // Subscription does not change frequently enough to justify a hard block on every mount.
    staleTime: SUBSCRIPTION_STATUS_STALE_TIME,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
    onSuccess: () => {
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
    mutationFn: async ({ priceId }) => {
      try {
        const response = await businessAPI.createStripeSubscription({ priceId });
        return response.data;
      } catch (err) {
        const status = err?.response?.status;
        const message = err?.response?.data?.message || "";

        if (
          status === 400 &&
          typeof message === "string" &&
          message.toLowerCase().includes("start your free trial first")
        ) {
          await businessAPI.startFreeTrial();
          const retryResponse = await businessAPI.createStripeSubscription({ priceId });
          return retryResponse.data;
        }

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
