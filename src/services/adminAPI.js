import axios, { formAxios } from "../configs/axios.config";

// Admin API service for all admin-related API calls
export const adminAPI = {
  // Auth
  login: (credentials) => axios.post("/auth/login", credentials),
  getAdminProfile: () => axios.get("/auth/me"),
  updateAdminProfile: (profileData) =>
    formAxios.put("/auth/profile-settings", profileData),
  updateAdminPassword: (passwordData) =>
    axios.put("/auth/updatePassword", passwordData),
  updateAdminNotificationSettings: (settings) =>
    axios.patch("/auth/notification-settings", settings),
  
  // Admin dashboard stats
  getUserStats: () => axios.get("/admin/user-stats"),
  getRecipientGroups: () => axios.get("/admin/recipient-groups"),
  
  // Email functionality
  sendEmailToUsers: (data) => axios.post("/admin/send-email", data),
  
  // Backup functionality
  createManualBackup: (data) => axios.post("/admin/backup", data),
  getAllBackups: () => axios.get("/admin/backup"),
  getBackupStats: () => axios.get("/admin/backup/stats"),
  getBackupById: (id) => axios.get(`/admin/backup/${id}`),
  getBackupDownloadUrl: (id) => axios.get(`/admin/backup/${id}/download`),
  restoreBackup: (id) => axios.post(`/admin/backup/${id}/restore`, { confirm: true }),
  uploadAndRestore: (formData) => axios.post("/admin/backup/upload-restore", formData),
  deleteBackup: (id) => axios.delete(`/admin/backup/${id}`),
  cleanupBackups: () => axios.post("/admin/backup/cleanup"),
  
  // Stats
  getMonthlyAppointmentTrends: () => axios.get("/admin/stats/appointments-trend"),
  getTopBarberTrend: () => axios.get("/admin/stats/top-barbers"),
  getRevenueProjection: (params) => axios.get("/admin/stats/revenue-projection", { params }),
  
  // User management
  getBarbers: (params) => axios.get("/auth/barbers", { params }),
  updateBarberStatus: (id, status) => axios.patch(`/auth/barbers/${id}/status`, { status }),
  getBarberById: (id) => axios.get(`/auth/barbers/${id}`),
  deleteBarber: (id) => axios.delete(`/auth/barbers/${id}`),
  
  // Client Management
  getAllClients: (params) => axios.get('/client/all', { params }),
  updateClientByAdmin: (id, data) => axios.put(`/admin/clients/${id}`, data),
  updateClientStatus: (id, status) => axios.patch(`/admin/clients/${id}/status`, { status }),
  deleteClientByAdmin: (id) => axios.delete(`/admin/clients/${id}`),
  // Client Gallery (admin view-only access)
  getClientGallery: (clientId) => axios.get(`/admin/clients/${clientId}/gallery`),
  
  // Sub-admin management
  createSubadmin: (data) => axios.post("/auth/subadmins", data),
  getAllSubadmins: () => axios.get("/auth/subadmins"),
  getSubadminById: (id) => axios.get(`/auth/subadmins/${id}`),
  updateSubadmin: (id, data) => axios.put(`/auth/subadmins/${id}`, data),
  deleteSubadmin: (id) => axios.delete(`/auth/subadmins/${id}`),
  
  // Audit logs management
  getAuditLogs: (params) => axios.get("/admin/audit-logs", { params }),
  deleteAuditLog: (logId) => axios.delete(`/admin/audit-logs/${logId}`),
};
