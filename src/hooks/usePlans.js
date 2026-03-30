import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansAPI } from '../services/plansAPI';
import { toast } from 'sonner';
import { useBatchTranslation } from '../contexts/BatchTranslationContext';

// Hook to get all active plans (public)
export const useGetPlans = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ['plans'],
    queryFn: plansAPI.getPlans,
    select: (response) => response.data.data, // Extract data from { success: true, data: [...] }
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToFetchPlans'));
    },
  });
};

// Hook to get a single plan by ID (public)
export const useGetPlanById = (id) => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => plansAPI.getPlanById(id),
    select: (response) => response.data.data, // Extract data from { success: true, data: {...} }
    enabled: !!id,
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToFetchPlanDetails'));
    },
  });
};

// Hook to get all plans including inactive (admin only)
export const useGetAllPlans = () => {
  const { tc } = useBatchTranslation();
  return useQuery({
    queryKey: ['plans', 'admin', 'all'],
    queryFn: plansAPI.getAllPlans,
    select: (response) => response.data.data, // Extract data from { success: true, data: [...] }
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToFetchAllPlans'));
    },
  });
};

// Hook to create a new plan (admin only)
export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: plansAPI.createPlan,
    onSuccess: (response) => {
      toast.success(tc('planCreatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'admin', 'all'] });
      return response.data.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToCreatePlan'));
    },
  });
};

// Hook to update a plan (admin only)
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: ({ id, planData }) => plansAPI.updatePlan(id, planData),
    onSuccess: (response, variables) => {
      toast.success(tc('planUpdatedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'admin', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
      return response.data.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdatePlan'));
    },
  });
};

// Hook to delete a plan (admin only)
export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: plansAPI.deletePlan,
    onSuccess: (response, planId) => {
      toast.success(tc('planDeletedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'admin', 'all'] });
      queryClient.removeQueries({ queryKey: ['plan', planId] });
      return response.data.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToDeletePlan'));
    },
  });
};

// Hook to add a feature to a plan
export const useAddFeatureToPlan = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: ({ id, features }) => {
      // This will use the update plan API with the new features array
      return plansAPI.updatePlan(id, { features });
    },
    onSuccess: (response, variables) => {
      toast.success(tc('featureAddedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'admin', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToAddFeature'));
    },
  });
};

// Hook to remove a feature from a plan
export const useRemoveFeatureFromPlan = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: ({ id, features }) => {
      // This will use the update plan API with the updated features array
      return plansAPI.updatePlan(id, { features });
    },
    onSuccess: (response, variables) => {
      toast.success(tc('featureRemovedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', 'admin', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToRemoveFeature'));
    },
  });
};