import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../services/adminAPI";
import { toast } from "sonner";

// Admin stats queries
export const useAdminUserStats = () => {
  return useQuery({
    queryKey: ["admin", "user-stats"],
    queryFn: adminAPI.getUserStats,
    select: (data) => data.data,
    onError: (error) => {
      toast.error("Failed to fetch user statistics");
    },
  });
};

export const useAdminRecipientGroups = () => {
  return useQuery({
    queryKey: ["admin", "recipient-groups"],
    queryFn: adminAPI.getRecipientGroups,
    select: (data) => data.data,
    onError: (error) => {
      console.error("Error fetching recipient groups:", error);
      toast.error("Failed to fetch recipient groups");
    },
  });
};

export const useAdminAppointmentTrends = () => {
  return useQuery({
    queryKey: ["admin", "appointments-trend"],
    queryFn: adminAPI.getMonthlyAppointmentTrends,
    select: (data) => data.data,
    onError: (error) => {
      toast.error("Failed to fetch appointment trends");
    },
  });
};

export const useAdminTopBarbers = () => {
  return useQuery({
    queryKey: ["admin", "top-barbers"],
    queryFn: adminAPI.getTopBarberTrend,
    select: (data) => data.data,
    onError: (error) => {
      toast.error("Failed to fetch top barbers data");
    },
  });
};

export const useAdminRevenueProjection = (params = {}) => {
  return useQuery({
    queryKey: ["admin", "revenue-projection", params],
    queryFn: () => adminAPI.getRevenueProjection(params),
    select: (data) => data.data,
    onError: (error) => {
      toast.error("Failed to fetch revenue projection data");
    },
  });
};

// Barber management queries
export const useAdminBarbers = (params) => {
  return useQuery({
    queryKey: ["admin", "barbers", params],
    queryFn: () => adminAPI.getBarbers(params),
    select: (res) => res.data.data,
    onError: (error) => {
      console.error("Error fetching barbers:", error);
      toast.error("Failed to fetch barbers");
    },
  });
};

export const useAdminBarberById = (id) => {
  return useQuery({
    queryKey: ["admin", "barber", id],
    queryFn: () => adminAPI.getBarberById(id),
    select: (res) => res.data.data,
    enabled: !!id,
    onError: (error) => {
      console.error("Error fetching barber:", error);
      toast.error("Failed to fetch barber details");
    },
  });
};

// Barber management mutations
export const useUpdateBarberStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => adminAPI.updateBarberStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin", "barbers"]);
      queryClient.invalidateQueries(["admin", "user-stats"]);
      toast.success("Barber status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating barber status:", error);
      toast.error(error.response?.data?.message || "Failed to update barber status");
    },
  });
};

export const useDeleteBarber = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAPI.deleteBarber,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["admin", "barbers"]);
      queryClient.invalidateQueries(["admin", "user-stats"]);
      
      // Only show default toast if no custom onSuccess callback is provided
      if (!options.onSuccess) {
        toast.success("Barber deleted successfully");
      }
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      console.error("Error deleting barber:", error);
      toast.error(error.response?.data?.message || "Failed to delete barber");
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

// Email functionality
export const useSendEmailToUsers = () => {
  return useMutation({
    mutationFn: adminAPI.sendEmailToUsers,
    onSuccess: (data) => {
      const result = data.data;
      toast.success(`Email sent successfully to ${result.totalRecipients} users`);
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.message || "Failed to send email");
    },
  });
};

// Client management
export const useAdminClients = (params) => {
  return useQuery({
    queryKey: ["admin", "clients", params],
    queryFn: () => adminAPI.getAllClients(params),
    select: (data) => data.data.data,
    onError: (error) => {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    },
  });
};

export const useUpdateClientByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateClientByAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "clients"]);
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast.error(error.response?.data?.message || "Failed to update client");
    },
  });
};

export const useDeleteClientByAdmin = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId) => adminAPI.deleteClientByAdmin(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "clients"]);
      toast.success("Client deleted successfully");
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast.error(error.response?.data?.message || "Failed to delete client");
    },
  });
};

export const useUpdateClientStatusByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => adminAPI.updateClientStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "clients"]);
      toast.success("Client status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating client status:", error);
      toast.error(error.response?.data?.message || "Failed to update client status");
    },
  });
};

// Sub-admin management
export const useAdminSubadmins = () => {
  return useQuery({
    queryKey: ["admin", "subadmins"],
    queryFn: adminAPI.getAllSubadmins,
    select: (data) => data.data,
    onError: (error) => {
      console.error("Error fetching subadmins:", error);
      toast.error("Failed to fetch sub-admins");
    },
  });
};

export const useCreateSubadmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAPI.createSubadmin,
    onSuccess: () => {
      toast.success("Sub-admin created successfully");
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'subadmins'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] });
      }, 500); // 500ms delay
    },
    onError: (error) => {
      console.error("Error creating subadmin:", error);
      toast.error(error.response?.data?.message || "Failed to create sub-admin");
    },
  });
};

export const useUpdateSubadmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateSubadmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "subadmins"]);
      toast.success("Sub-admin updated successfully");
    },
    onError: (error) => {
      console.error("Error updating subadmin:", error);
      toast.error(error.response?.data?.message || "Failed to update sub-admin");
    },
  });
};

export const useDeleteSubadmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAPI.deleteSubadmin,
    onSuccess: () => {
      toast.success("Sub-admin deleted successfully");
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'subadmins'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] });
      }, 500); // 500ms delay
    },
    onError: (error) => {
      console.error("Error deleting subadmin:", error);
      toast.error(error.response?.data?.message || "Failed to delete sub-admin");
    },
  });
};

// Backup management
export const useAdminBackups = () => {
  return useQuery({
    queryKey: ["admin", "backups"],
    queryFn: adminAPI.getAllBackups,
    select: (data) => data.data,
    onError: (error) => {
      console.error("Error fetching backups:", error);
      toast.error("Failed to fetch backups");
    },
  });
};

export const useCreateManualBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => adminAPI.createManualBackup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
      toast.success("Manual backup created successfully!");
    },
    onError: (error) => {
      console.error("Error creating backup:", error);
      toast.error(error.response?.data?.message || "Failed to create backup");
    },
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (backupId) => adminAPI.restoreBackup(backupId),
    onSuccess: () => {
      toast.success("Backup restored successfully!");
      queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to restore backup.";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteBackup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (backupId) => adminAPI.deleteBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
      toast.success("Backup deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting backup:", error);
      toast.error(error.response?.data?.message || "Failed to delete backup");
    },
  });
};

// Safe restore (sanitize backup on client before uploading)
export const useSafeRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId) => {
      // 1) Get download URL for the backup JSON
      const dlRes = await adminAPI.getBackupDownloadUrl(backupId);
      const downloadUrl = dlRes?.data?.data?.downloadUrl || dlRes?.data?.downloadUrl;
      if (!downloadUrl) {
        throw new Error("Could not get backup download URL");
      }

      // 2) Fetch the backup content from Cloudinary
      const resp = await fetch(downloadUrl, { method: 'GET' });
      if (!resp.ok) {
        throw new Error(`Failed to download backup: ${resp.status} ${resp.statusText}`);
      }
      const backupData = await resp.json();

      // 3) Sanitize notifications: filter out invalid enum values for `type`
      const allowedNotificationTypes = new Set(["barber", "client", "admin"]);
      if (backupData?.collections?.notifications && Array.isArray(backupData.collections.notifications)) {
        const before = backupData.collections.notifications.length;
        backupData.collections.notifications = backupData.collections.notifications.filter(
          (n) => allowedNotificationTypes.has(n?.type)
        );
        const after = backupData.collections.notifications.length;
        const removed = before - after;
        if (removed > 0) {
          console.info(`Safe restore: removed ${removed} invalid notifications during sanitization.`);
        }
      }

      // 4) Upload sanitized backup to the upload-restore endpoint
      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const formData = new FormData();
      formData.append('backupFile', blob, 'sanitized-backup.json');
      formData.append('confirm', 'true');

      return adminAPI.uploadAndRestore(formData);
    },
    onSuccess: () => {
      toast.success("Backup restored successfully (sanitized)");
      queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Safe restore failed.";
      toast.error(message);
    },
  });
};

// Fetch admin profile data
export const useAdminProfile = (options = {}) => {
  return useQuery({
    queryKey: ["adminProfile"],
    queryFn: adminAPI.getAdminProfile,
    select: (data) => data.data.data, // Adjust based on actual API response structure
    enabled: options.enabled ?? true,
  });
};

// Update admin profile
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAPI.updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProfile"]);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    },
  });
};

// Update admin password
export const useUpdateAdminPassword = () => {
  return useMutation({
    mutationFn: adminAPI.updateAdminPassword,
    onSuccess: () => {
      toast.success("Password updated successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update password."
      );
    },
  });
};

// Update admin notification settings
export const useUpdateAdminNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAPI.updateAdminNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProfile"]);
      toast.success("Notification settings updated!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update notification settings."
      );
    },
  });
};

// Audit logs management
export const useAdminAuditLogs = (params) => {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminAPI.getAuditLogs(params),
    select: (data) => data.data,
    onError: (error) => {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    },
  });
};

export const useDeleteAuditLog = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAPI.deleteAuditLog,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["admin", "audit-logs"]);
      
      // Only show default toast if no custom onSuccess callback is provided
      if (!options.onSuccess) {
        toast.success("Audit log deleted successfully");
      }
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      console.error("Error deleting audit log:", error);
      toast.error(error.response?.data?.message || "Failed to delete audit log");
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};
