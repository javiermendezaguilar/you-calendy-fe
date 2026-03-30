import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { businessAPI } from "../services/businessAPI";
import { adminAPI } from "../services/adminAPI";
import { clientAPI } from "../services/clientAPI";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

// Business-side gallery hooks

// Hook to upload haircut image for a client
export const useUploadHaircutImage = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (formData) => businessAPI.uploadHaircutImage(clientId, formData),
    onSuccess: () => {
      toast.success(tc('haircutImageUploadedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["clientGallery", clientId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUploadHaircutImage')
      );
    },
  });
};

// Hook to get client gallery
export const useGetClientGallery = (clientId) => {
  return useQuery({
    queryKey: ["clientGallery", clientId],
    queryFn: () => businessAPI.getClientGallery(clientId),
    enabled: !!clientId,
    select: (data) => data.data,
  });
};

// Context-aware gallery fetcher (admin vs business)
// Prefer this in shared components where isAdmin prop may differ
export const useGetClientGalleryContext = (clientId, { isAdmin, enabled } = {}) => {
  const shouldEnable = enabled !== undefined ? enabled : !!clientId;
  return useQuery({
    queryKey: [isAdmin ? 'adminClientGallery' : 'clientGallery', clientId, isAdmin],
    enabled: shouldEnable && !!clientId,
    queryFn: async () => {
      if (!isAdmin) {
        return businessAPI.getClientGallery(clientId);
      }
      try {
        // Try admin route first
        return await adminAPI.getClientGallery(clientId);
      } catch (err) {
        const status = err?.response?.status;
        // If admin route not implemented or forbidden, fallback silently to business route
        if (status === 404 || status === 403) {
          return await businessAPI.getClientGallery(clientId);
        }
        throw err; // rethrow other errors
      }
    },
    select: (data) => data.data,
  });
};

// Hook to add suggestion to gallery image
export const useAddSuggestion = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => businessAPI.addSuggestion(galleryId, formData),
    onSuccess: (data, variables) => {
      toast.success(tc('suggestionAddedSuccessfully'));
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["clientGallery"] });
      queryClient.invalidateQueries({ queryKey: ["galleryImage", variables.galleryId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToAddSuggestion')
      );
    },
  });
};

// Hook to update suggestion
export const useUpdateSuggestion = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, suggestionId, formData }) => 
      businessAPI.updateSuggestion(galleryId, suggestionId, formData),
    onSuccess: (data, variables) => {
      toast.success(tc('suggestionUpdatedSuccessfully'));
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["clientGallery"] });
      queryClient.invalidateQueries({ queryKey: ["galleryImage", variables.galleryId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUpdateSuggestion')
      );
    },
  });
};

// Hook to report image
export const useReportImage = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => businessAPI.reportImage(galleryId, formData),
    onSuccess: () => {
      toast.success(tc('imageReportedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["reportedImages"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToReportImage')
      );
    },
  });
};

// Hook to get reported images
export const useGetReportedImages = () => {
  return useQuery({
    queryKey: ["reportedImages"],
    queryFn: () => businessAPI.getReportedImages(),
    select: (data) => data.data,
  });
};

// Hook to review report
export const useReviewReport = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, reportId, data }) => 
      businessAPI.reviewReport(galleryId, reportId, data),
    onSuccess: () => {
      toast.success(tc('reportReviewedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["reportedImages"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToReviewReport')
      );
    },
  });
};

// Hook to delete gallery image
export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (galleryId) => businessAPI.deleteGalleryImage(galleryId),
    onSuccess: () => {
      toast.success(tc('galleryImageDeletedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["clientGallery"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToDeleteGalleryImage')
      );
    },
  });
};

// Client-side gallery hooks

// Hook to get client's own gallery
export const useGetClientOwnGallery = (clientId) => {
  return useQuery({
    queryKey: ["clientOwnGallery", clientId],
    queryFn: () => clientAPI.getGallery(clientId),
    enabled: !!clientId,
    select: (data) => data.data,
  });
};

// Hook to upload haircut image (client-side)
export const useUploadHaircutImageByClient = (clientId) => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: (formData) => clientAPI.uploadHaircutImage(clientId, formData),
    onSuccess: () => {
      toast.success(tc('haircutImageUploadedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["clientOwnGallery", clientId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToUploadHaircutImage')
      );
    },
  });
};

// Hook to add suggestion (client-side)
export const useAddSuggestionByClient = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => clientAPI.addSuggestion(galleryId, formData),
    onSuccess: () => {
      toast.success(tc('suggestionAddedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["clientOwnGallery"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToAddSuggestion')
      );
    },
  });
};

// Hook for client to report image
export const useReportImageByClient = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: ({ galleryId, formData }) => clientAPI.reportImage(galleryId, formData),
    onSuccess: () => {
      toast.success(tc('imageReportedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: ["clientOwnGallery"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || tc('failedToReportImage')
      );
    },
  });
};