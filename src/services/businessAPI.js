import axios from "../configs/axios.config";

// Business API service for all business-related API calls
export const businessAPI = {
  // Client Notes, Suggestions, and Reports
  
  // Get note counts for badges
  getClientNoteCounts: () => axios.get("/business/clients/note-counts"),
  
  // Client Suggestions
  addClientSuggestion: (clientId, data) => 
    axios.post(`/business/clients/${clientId}/suggestions`, data),
  getClientSuggestions: (params) => 
    axios.get("/business/clients/suggestions", { params }),
  
  // Client Reports
  addClientReport: (clientId, data) => 
    axios.post(`/business/clients/${clientId}/reports`, data),
  getClientReports: (params) => 
    axios.get("/business/clients/reports", { params }),
  updateReportStatus: (reportId, data) => 
    axios.put(`/business/clients/reports/${reportId}`, data),
  
  // Client Notes Response
  respondToClientNote: (noteId, data) => 
    axios.post(`/business/clients/notes/${noteId}/respond`, data),
  
  // Client Management (existing endpoints)
  getClients: (params) => axios.get("/business/clients", { params }),
  getClientById: (clientId) => axios.get(`/business/clients/${clientId}`),
  addClient: (data) => axios.post("/business/clients", data),
  updateClient: (clientId, data) => axios.put(`/business/clients/${clientId}`, data),
  updateClientPrivateNotes: (clientId, data) => 
    axios.put(`/business/clients/${clientId}/private-notes`, data),
  deleteClient: (clientId) => axios.delete(`/business/clients/${clientId}`),
  
  // Client Invitation
  getInvitationLink: (clientId) => 
    axios.get(`/business/clients/${clientId}/invitation-link`),
  updateInvitationToken: (clientId) => 
    axios.post(`/business/clients/${clientId}/update-link`),
  resendInvitation: (clientId) => 
    axios.post(`/business/clients/${clientId}/resend-invitation`),
  
  // Client Phone & Messaging
  getClientPhones: () => axios.get("/business/clients/phones-simple"),
  sendCustomMessageToClients: (data) => 
    axios.post("/business/clients/messages", data),

  // Business Profile APIs
  getUserBusiness: () => axios.get("/business"),

  // Subscription & Payment APIs
  startFreeTrial: () => axios.post("/business/start-trial"),
  getSubscriptionStatus: () => axios.get("/business/subscription-status"),
  createStripeSubscription: (payload) => axios.post("/business/create-subscription", payload),

  // Gallery Management
  uploadHaircutImage: (clientId, formData) => 
    axios.post(`/business/clients/${clientId}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getClientGallery: (clientId) => 
    axios.get(`/business/clients/${clientId}/gallery`),
  addSuggestion: (galleryId, formData) => 
    axios.post(`/business/gallery/${galleryId}/suggestions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateSuggestion: (galleryId, suggestionId, data) => {
    const isFormData = data instanceof FormData;
    return axios.put(`/business/gallery/${galleryId}/suggestions/${suggestionId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
  },
  reportImage: (galleryId, formData) => 
    axios.post(`/business/gallery/${galleryId}/reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getReportedImages: () => 
    axios.get('/business/gallery/reports'),
  reviewReport: (galleryId, reportId, data) => 
    axios.put(`/business/gallery/reports/${galleryId}/${reportId}`, data),
  deleteGalleryImage: (galleryId) => 
    axios.delete(`/business/gallery/${galleryId}`),
};