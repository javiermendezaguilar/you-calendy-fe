import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportAPI } from "../services/supportAPI";
import { adminAPI } from "../services/adminAPI";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

// Admin Support Hooks
// Fetch all support tickets (admin only)
export const useAllTickets = (params = {}) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["support", "tickets", params],
    queryFn: () => supportAPI.getAllTickets(params),
    select: (response) => response.data.data,
    onError: (error) => {
      toast.error(tc("failedToFetchSupportTickets"));
    },
  });
};

// Update ticket priority (admin only)
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ id, priority }) =>
      supportAPI.updateTicketPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "tickets"]);
      toast.success(tc("ticketPriorityUpdated"));
    },
    onError: (error) => {
      toast.error(tc("failedToUpdateTicketPriority"));
    },
  });
};

// Update ticket status (admin only)
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ id, status }) => supportAPI.updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "tickets"]);
      toast.success(tc("ticketStatusUpdated"));
    },
    onError: (error) => {
      toast.error(tc("failedToUpdateTicketStatus"));
    },
  });
};

// Add a single admin reply (admin only) and end communication
export const useAddSupportReply = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ id, message }) => supportAPI.addReply(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "tickets"]);
      toast.success(tc("replySentSuccessfully") || "Reply sent successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tc("failedToSendReply") || "Failed to send reply"
      );
    },
  });
};

// Send mass notifications (admin only)
export const useSendMassNotification = () => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: adminAPI.sendEmailToUsers,
    onSuccess: (data) => {
      toast.success(data.data.message || tc("notificationSentSuccessfully"));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tc("failedToSendNotification")
      );
    },
  });
};

// Barber Support Hooks
// Fetch barber's own support tickets
export const useMyTickets = (params = {}) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["support", "my-tickets", params],
    queryFn: () => supportAPI.getMyTickets(params),
    select: (response) => response.data.data,
    onError: (error) => {
      toast.error(tc("failedToFetchYourTickets"));
    },
  });
};

// Create a new support ticket
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: supportAPI.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "my-tickets"]);
      toast.success(tc("supportTicketCreatedSuccessfully"));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tc("failedToCreateSupportTicket")
      );
    },
  });
};

// Get a specific ticket by ID
export const useGetTicketById = (id) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ["support", "ticket", id],
    queryFn: () => supportAPI.getTicketById(id),
    select: (response) => response.data.data,
    enabled: !!id,
    onError: (error) => {
      toast.error(tc("failedToFetchTicketDetails"));
    },
  });
};

// Update a support ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ id, data }) => supportAPI.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "my-tickets"]);
      queryClient.invalidateQueries(["support", "ticket"]);
      toast.success(tc("ticketUpdatedSuccessfully"));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tc("failedToUpdateTicket")
      );
    },
  });
};

// Delete a support ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: supportAPI.deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries(["support", "my-tickets"]);
      toast.success(tc("ticketDeletedSuccessfully"));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tc("failedToDeleteTicket")
      );
    },
  });
};