import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../configs/axios.config.js";
import { isClientAuthenticated, isBarberAuthenticated, isAdminAuthenticated } from "../utils/authUtils";

const fetchNotifications = async (userType = null) => {
  const { data } = await api.get("/notifications");
  
  // Filter notifications based on user type (barber/client)
  let filteredNotifications = data.data.notifications || [];
  if (userType) {
    filteredNotifications = filteredNotifications.filter(notification => 
      notification.type === userType
    );
  }
  
  return {
    ...data.data,
    notifications: filteredNotifications
  };
};

const markAllAsRead = async () => {
  const { data } = await api.patch("/notifications/mark-all-read");
  return data.data;
};

export const useNotifications = (userType = null, options = {}) => {
  const queryClient = useQueryClient();

  // Unified auth detection across contexts.
  // We allow fetching notifications if ANY auth relevant for the requested userType exists.
  // Strict auth checks
  const tokens = {
    client: isClientAuthenticated(),
    admin: isAdminAuthenticated(),
    barber: isBarberAuthenticated(),
  };

  // Loose client detection: if on /client or /barber/profile path and clientId exists, treat as quasi client for notification access
  let clientLoose = false;
  try {
    const path = window.location?.pathname || '';
    const clientId = localStorage.getItem('clientId');
    if (!tokens.client && clientId && (path.startsWith('/client') || path.startsWith('/barber/profile/') || path.startsWith('/barber/'))) {
      clientLoose = true;
    }
  } catch {
    /* noop */
  }

  // If a specific userType requested but its auth is missing, we fallback to any available auth
  // so that notifications still load (they will be filtered client-side by type below).
  const anyAuth = tokens.client || tokens.admin || tokens.barber;
  let enabled = anyAuth; // default allow if ANY auth exists
  let enableReason = 'any-auth';
  if (userType) {
    if (tokens[userType] || (userType === 'client' && clientLoose)) {
      enabled = true;
      enableReason = userType + (tokens[userType] ? '-auth' : '-loose');
    } else if (!anyAuth) {
      enabled = false;
      enableReason = 'no-auth';
    } else {
      // userType auth missing but some other auth present; still enable with fallback
      enabled = true;
      enableReason = 'fallback-other-auth';
    }
  }

  // Expose a normalized authStates object where client reflects loose mode
  const normalizedAuthStates = {
    ...tokens,
    client: tokens.client || clientLoose,
  };

  const { data: notificationsData, isLoading: isLoadingNotifications, refetch, ...rest } = useQuery({
    queryKey: ["notifications", userType],
    queryFn: () => fetchNotifications(userType),
    enabled: enabled && (options.enabled ?? true),
    ...options,
  });

  const { mutate: markAllRead, isLoading: isMarkingAsRead } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notifications", userType] });
    },
  });

  return {
    notifications: notificationsData?.notifications || [],
    pagination: notificationsData?.pagination,
    isLoadingNotifications,
    markAllRead,
    isMarkingAsRead,
    refetch,
    enableReason,
    enabled,
    clientLoose,
    authStates: normalizedAuthStates,
    ...rest,
  };
}; 
