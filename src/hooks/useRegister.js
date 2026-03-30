import custAxios from "../configs/axios.config";
import authManager from "../utils/authManager";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";
import { sanitizeAndStringifyUser } from "../utils/userDataSanitizer";

// This hook handles the complete user and business registration in a single step,
// as required by the backend API.
export const useRegister = () => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (userData) => {
      // The backend expects coordinates in [longitude, latitude] format (GeoJSON standard).
      // The frontend (Leaflet) uses [latitude, longitude]. We swap them here before sending.
      const coordinates = userData.location?.coordinates || [0, 0];
      const swappedCoordinates = [coordinates[1], coordinates[0]];

      // The backend /auth/register endpoint expects all data in one call.
      const registrationData = {
        email: userData.email,
        password: userData.password,
        personalName: userData.personalName,
        surname: userData.surname,
        phone: userData.phoneNumber,
        businessName: userData.businessName,
        address: userData.address,
        location: {
          ...userData.location,
          coordinates: swappedCoordinates,
        },
        businessHours: userData.businessHours,
        services: userData.services || [], // Make sure services array is included
        googlePlaceId: userData.location?.googlePlaceId,
      };

      console.log("Sending complete registration data to /auth/register:", registrationData);
      const res = await custAxios.post("/auth/register", registrationData);

      // Note: Tokens are stored in httpOnly cookies automatically by the backend
      // We only store sanitized user data in localStorage for frontend use (no tokens, no sensitive data)
      if (res.data?.data?.user) {
        // Sanitize user data - remove sensitive fields (password, tokens, etc.)
        const sanitizedUser = sanitizeAndStringifyUser(res.data.data.user);
        localStorage.setItem("user", sanitizedUser);
        if (res.data.data.business?.name) {
          localStorage.setItem("businessName", res.data.data.business.name);
        }
        // Dispatch login event so other parts of the app can react (e.g., clear caches)
        try { authManager.handleLogin(); } catch (_) {}
      }

      return res.data;
    },
    onSuccess: (data) => {
      toast.success(tc("registrationSuccessfulWelcome"));
    },
    onError: (error) => {
      console.error("Registration error:", error);

      if (error?.response?.status === 400) {
        toast.error(error.response?.data?.message || tc("pleaseCheckInformationTryAgain"));
      } else if (error?.message?.includes("Network Error")) {
        toast.error(tc("serverConnectionFailedCheckInternet"));
      } else {
        toast.error(error.response?.data?.message || tc("registrationFailedTryAgain"));
      }

      throw error;
    },
  });
};

export const useGetUserDetails = () => {
  const { data, ...rest } = useQuery({
    queryFn: async () => {
      const res = await custAxios.get("/auth/me");
      return res.data.data;
    },
    queryKey: ["userDetails"],
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  return { userDetails: data, ...rest };
};

export const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await custAxios.put("/auth/updateProfile", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc("profileUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["userDetails"] });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || tc("failedToUpdateProfile"));
      throw error;
    },
  });
};

export const useChangePassword = () => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (data) => {
      const res = await custAxios.put("/auth/updatePassword", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(tc("passwordChangedSuccessfully"));
    },
    onError: (error) => {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || tc("failedToChangePassword"));
      throw error;
    },
  });
};