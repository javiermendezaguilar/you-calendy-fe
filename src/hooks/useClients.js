import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../configs/axios.config";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

// Ensure phone numbers are sent with a leading '+' (e.g., +923152923202)
const normalizePhoneNumber = (phone) => {
  if (!phone && phone !== 0) return phone;
  const stringPhone = String(phone).trim();
  const startsWithPlus = stringPhone.startsWith("+");
  const cleaned = stringPhone.replace(/\D/g, "");
  return startsWithPlus ? `+${cleaned}` : `+${cleaned}`; // Ensure leading plus for backend
};

// Hook to get all clients for a business
const useGetClients = (params = {}) => {
  return useQuery({
    queryKey: ["getClients", params],
    queryFn: () => {
      return axiosInstance.get("/business/clients", { params });
    },
    select: (data) => {
      // Handle the response structure from backend
      const responseData = data.data?.data;
      if (responseData && responseData.clients && responseData.pagination) {
        return responseData;
      }
      // Fallback for old response structure
      return data.data?.data || data.data;
    },
  });
};

const useGetClientsCount = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["getClientsCount", params],
    queryFn: () => {
      return axiosInstance.get("/business/clients/count", { params });
    },
    select: (data) => {
      const responseData = data.data?.data;
      return responseData?.pagination || responseData || data.data;
    },
    ...options,
  });
};

// Hook to add a new client
const useAddClient = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (clientData) => {
      const payload = {
        ...clientData,
        phone: normalizePhoneNumber(clientData?.phone),
      };
      return axiosInstance.post("/business/clients", payload);
    },
    onSuccess: (data, variables) => {
      // Check if SMS was not sent due to insufficient credits
      const responseData = data?.data?.data;
      const smsNotSent = responseData?.smsStatus && !responseData.smsStatus.sent;
      
      // Only show success toast if SMS was sent successfully
      if (!smsNotSent) {
        toast.success(tc('clientAddedSuccessfully'));
      }
      
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
      if (variables.onSuccess) {
        variables.onSuccess(data);
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || tc('failedToAddClient');
      if (errorMessage.includes("already exists for this business")) {
        toast.error(tc('clientAlreadyExists'));
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

// Hook to update a client's details
const useUpdateClient = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (clientData) => {
      const payload = {
        ...clientData,
        phone: normalizePhoneNumber(clientData?.phone),
      };
      return axiosInstance.put(`/business/clients/${clientId}`, payload);
    },
    onSuccess: () => {
      toast.success(tc('clientUpdatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
      queryClient.invalidateQueries({ queryKey: ["getClient", clientId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUpdateClient')
      );
    },
  });
};

// Hook to update a client's status (business side)
export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ id, status }) => {
      const payload = { status, isActive: status === 'activated' };
      return axiosInstance.put(`/business/clients/${id}`, payload);
    },
    onSuccess: () => {
      // Reuse existing success wording to avoid adding new i18n keys
      toast.success(tc('clientUpdatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || tc('failedToUpdateClient'));
    },
  });
};

// Hook to delete a client
const useDeleteClient = (options = {}) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ clientId, reason }) => {
      return axiosInstance.delete(`/business/clients/${clientId}`, {
        data: { reason }
      });
    },
    onSuccess: () => {
      toast.success(tc('clientDeletedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToDeleteClient')
      );
    },
  });
};

// Hook to get a single client by ID
const useGetClientById = (clientId) => {
  return useQuery({
    queryKey: ["getClient", clientId],
    queryFn: () => {
      return axiosInstance.get(`/business/clients/${clientId}`);
    },
    enabled: !!clientId, // Only run this query if clientId is available
  });
};


// Hook to update a client's private notes
const useUpdateClientNotes = (clientId) => {
    const queryClient = useQueryClient();
    const { tc } = useBatchTranslation();
    return useMutation({
        mutationFn: (notesData) => {
            return axiosInstance.put(`/business/clients/${clientId}/private-notes`, notesData);
        },
        onSuccess: () => {
            toast.success(tc('clientNotesUpdatedSuccessfully'));
            queryClient.invalidateQueries({ queryKey: ["getClient", clientId] });
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message || tc('failedToUpdateClientNotes')
            );
        },
    });
};

// Hook to upload clients via CSV
const useUploadClientsCSV = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (formData) => {
      return axiosInstance.post("/business/clients/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data) => {
      const response = data.data;
      if (response.errors && response.errors.length > 0) {
        toast.warning(
          tc('csvUploadedWithErrors').replace('{count}', response.errors.length)
        );
        console.log("CSV Upload Errors:", response.errors);
      } else {
        toast.success(tc('csvUploadedSuccessfully'));
      }
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUploadCSV')
      );
    },
  });
};

// Hook to resend invitation SMS for incomplete clients
const useResendInvitation = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (clientId) => {
      return axiosInstance.post(`/business/clients/${clientId}/resend-invitation`);
    },
    onSuccess: (data, variables) => {
      // Check if SMS was not sent due to insufficient credits
      const responseData = data?.data?.data;
      const smsNotSent = responseData?.smsStatus && !responseData.smsStatus.sent;
      
      // Check if custom onSuccess callback is provided
      if (variables && typeof variables === 'object' && variables.onSuccess) {
        variables.onSuccess(data);
      } else {
        // Only show success toast if SMS was sent successfully
        if (!smsNotSent) {
          toast.success(tc('invitationSmsSentSuccessfully'));
        }
      }
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClientsCount"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToSendInvitationSms')
      );
    },
  });
};

// Hook to get client phone numbers
const useGetClientPhones = () => {
  return useQuery({
    queryKey: ["getClientPhones"],
    queryFn: () => {
      return axiosInstance.get("/business/clients/phones-simple");
    },
    select: (data) => {
      return data.data?.data?.phones || [];
    },
  });
};

// Hook to send custom message to multiple clients
const useSendCustomMessage = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ clientIds, message }) => {
      return axiosInstance.post("/business/clients/messages", {
        clientIds,
        message,
      });
    },
    onSuccess: (data) => {
      const responseData = data?.data?.data;
      const summary = responseData?.summary || {};
      const emailSent = summary.emailSent || 0;
      const smsSent = summary.smsSent || 0;
      const total = summary.totalTargets || 0;
      
      toast.success(
        tc('messagesSentSummary')
          .replace('{emailSent}', emailSent)
          .replace('{smsSent}', smsSent)
          .replace('{total}', total)
      );
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToSendMessages')
      );
    },
  });
};

// Hook to create unregistered client (for walk-ins, phone bookings)
const useCreateUnregisteredClient = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (clientData) => {
      let payload = clientData;
      
      // If it's not FormData, normalize the phone number
      if (!(clientData instanceof FormData)) {
        payload = {
          ...clientData,
          phone: normalizePhoneNumber(clientData?.phone),
        };
      } else {
        // If it's FormData, normalize the phone number inside it if it exists
        const phone = clientData.get('phone');
        if (phone) {
          clientData.set('phone', normalizePhoneNumber(phone));
        }
      }
      
      const config = {};
      if (payload instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      
      return axiosInstance.post("/business/unregistered-client", payload, config);
    },
    onSuccess: (data) => {
      const isNew = data?.data?.data?.isNew;
      if (isNew) {
        toast.success(tc('unregisteredClientCreated'));
      } else {
        toast.info(tc('existingClientFound'));
      }
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToCreateUnregisteredClient')
      );
    },
  });
};

// Hook to unblock a client
const useUnblockClient = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (clientId) => {
      return axiosInstance.put(`/business/clients/${clientId}/unblock`);
    },
    onSuccess: (_, clientId) => {
      toast.success(tc('clientUnblockedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["getClients"] });
      queryClient.invalidateQueries({ queryKey: ["getClient", clientId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUnblockClient')
      );
    },
  });
};

export {
    useGetClients,
    useGetClientsCount,
    useAddClient,
    useUpdateClient, 
    useDeleteClient,
    useGetClientById,
    useUpdateClientNotes,
    useUploadClientsCSV,
    useResendInvitation,
    useGetClientPhones,
    useSendCustomMessage,
    useCreateUnregisteredClient,
    useUnblockClient
};
