import axios from "../configs/axios.config";

export const supportAPI = {
  // Admin Support Tickets
  getAllTickets: (params = {}) => axios.get("/support", { params }),
  updateTicketPriority: (id, priority) =>
    axios.put(`/support/${id}/priority`, { priority }),
  updateTicketStatus: (id, status) =>
    axios.put(`/support/${id}/status`, { status }),

  // Barber Support Tickets
  getMyTickets: (params = {}) => axios.get("/support/my-tickets", { params }),
  createTicket: (data) => axios.post("/support", data),
  getTicketById: (id) => axios.get(`/support/${id}`),
  updateTicket: (id, data) => axios.put(`/support/${id}`, data),
  deleteTicket: (id) => axios.delete(`/support/${id}`),
  addReply: (id, message) => axios.post(`/support/${id}/replies`, { message }),
};