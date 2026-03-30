import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI, clientLogout } from '../services/clientAPI';
import { toast } from 'sonner';
import { useBatchTranslation } from '../contexts/BatchTranslationContext';

// Profile hooks
export const useClientProfile = (clientId) => {
  const storedClientId = localStorage.getItem('clientId');
  const finalClientId = clientId || storedClientId;
  
  return useQuery({
    queryKey: ['client-profile', finalClientId],
    queryFn: () => clientAPI.getPublicProfile(finalClientId),
    select: (data) => data.data?.data || data.data, // Handle both wrapped and unwrapped responses
    enabled: !!finalClientId && finalClientId !== 'null' && finalClientId !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const usePublicClientProfile = (clientId) => {
  return useQuery({
    queryKey: ['public-client-profile', clientId],
    queryFn: () => clientAPI.getPublicProfile(clientId),
    select: (data) => data.data,
    enabled: !!clientId,
  });
};

export const useUpdateClientProfile = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: (formData) => clientAPI.updateProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['client-profile', clientId]);
      queryClient.refetchQueries(['client-profile', clientId]);
      toast.success(tc('profileUpdatedSuccessfully') || 'Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdateProfile') || 'Failed to update profile');
    },
  });
};

export const useDeleteClientProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => clientAPI.deleteProfile(),
    onSuccess: async () => {
      queryClient.invalidateQueries(['client-profile']);
      
      // Clear client session by calling logout API (clears httpOnly cookie)
      try {
        await clientLogout();
      } catch (logoutError) {
        // Continue even if logout fails - we'll clear localStorage anyway
        console.error('Logout error during account deletion:', logoutError);
      }
      
      // Clear all localStorage items related to client
      localStorage.removeItem('clientId');
      localStorage.removeItem('businessId');
      localStorage.removeItem('invitationToken');
      localStorage.removeItem('client_invitation_token');
      localStorage.removeItem('client_business_id');
      localStorage.removeItem('client_staff_id');
      localStorage.removeItem('client_data');
      localStorage.removeItem('clientStaffId');
      localStorage.removeItem('token');
      localStorage.removeItem('publicBusinessId');
      localStorage.removeItem('publicBarberData');
      localStorage.removeItem('publicStaffId');
      localStorage.removeItem('pendingClientData');
      
      // Clear all sessionStorage items
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('clientJustCreated');
      sessionStorage.removeItem('clientCreatedTimestamp');
      sessionStorage.removeItem('clientCreatedId');
      
      // Clear React Query cache
      queryClient.clear();
      
      toast.success('Account deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });
};

// Gallery hooks
export const useClientGallery = (clientId) => {
  return useQuery({
    queryKey: ['client-gallery', clientId],
    queryFn: () => clientAPI.getGallery(clientId),
    select: (data) => {
      return data.data?.data || data.data;
    },
    enabled: !!clientId && clientId !== 'null' && clientId !== 'undefined',
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
    retry: 2,
    onError: (error) => {
      console.error('Gallery fetch error:', error);
    },
  });
};

export const useUploadHaircutImage = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: (formData) => clientAPI.uploadHaircutImage(clientId, formData),
    onSuccess: (data) => {
      // Force refetch the gallery data
      queryClient.invalidateQueries(['client-gallery', clientId]);
      queryClient.refetchQueries(['client-gallery', clientId]);
      toast.success(tc('photoUploadedSuccessfully'));
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || tc('failedToUploadPhoto'));
    },
  });
};

export const useDeleteClientGalleryImage = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: (galleryId) => clientAPI.deleteGalleryImage(galleryId),
    onSuccess: () => {
      // Force refetch the gallery data
      queryClient.invalidateQueries(['client-gallery', clientId]);
      queryClient.refetchQueries(['client-gallery', clientId]);
      toast.success(tc('photoDeletedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToDeletePhoto'));
    },
  });
};

export const useAddSuggestion = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => clientAPI.addSuggestion(galleryId, formData),
    onSuccess: () => {
      toast.success(tc('suggestionAddedSuccessfully'));
    // Refresh client gallery so UI reflects new suggestion
    queryClient.invalidateQueries({ queryKey: ['client-gallery'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToAddSuggestion'));
    },
  });
};

export const useReportImage = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => clientAPI.reportImage(galleryId, formData),
    onSuccess: () => {
      toast.success(tc('issueReportedSuccessfully'));
    // Refresh client gallery so UI reflects new report
    queryClient.invalidateQueries({ queryKey: ['client-gallery'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToReportIssue'));
    },
  });
};

// Notification hooks
export const useNotificationPreferences = (clientId) => {
  return useQuery({
    queryKey: ['client-notifications', clientId],
    queryFn: () => clientAPI.getNotificationPreferences(),
    select: (data) => data.data?.data || data.data, // Handle both wrapped and unwrapped responses
    enabled: !!clientId && clientId !== 'null' && clientId !== 'undefined', // Only run when clientId is available
    retry: 2,
  });
};

export const useToggleNotifications = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: (enabled) => clientAPI.toggleNotifications(enabled),
    onSuccess: (data) => {
      // Invalidate and refetch notification preferences
      queryClient.invalidateQueries(['client-notifications']);
      // Update the cache with the new data
      const newData = data.data?.data || data.data;
      queryClient.setQueryData(['client-notifications'], newData);
      toast.success(tc('notificationPreferencesUpdated'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || tc('failedToUpdateNotifications'));
    },
  });
};

// Business info hooks (for public access)
export const useBusinessDetails = (businessId) => {
  return useQuery({
    queryKey: ['business-details', businessId],
    queryFn: () => clientAPI.getBusinessDetails(businessId),
    select: (data) => data.data,
    enabled: !!businessId,
  });
};

export const useBusinessGallery = (businessId) => {
  return useQuery({
    queryKey: ['business-gallery', businessId],
    queryFn: () => clientAPI.getBusinessGallery(businessId),
    select: (data) => data.data,
    enabled: !!businessId,
  });
};
