import axios from '../configs/axios.config';

// Plans API service for all plan-related API calls
export const plansAPI = {
  // Public routes
  getPlans: () => axios.get('/plans'),
  getPlanById: (id) => axios.get(`/plans/${id}`),
  
  // Admin routes (require authentication)
  createPlan: (planData) => axios.post('/plans', planData),
  updatePlan: (id, planData) => axios.put(`/plans/${id}`, planData),
  deletePlan: (id) => axios.delete(`/plans/${id}`),
  getAllPlans: () => axios.get('/plans/admin/all'),
};

export default plansAPI;