import { useMutation } from "@tanstack/react-query";
import custAxios, { formAxios } from "../configs/axios.config";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";
import batchTranslationService from "../services/batchTranslationService";
import { sanitizeAndStringifyUser } from "../utils/userDataSanitizer";

export const useLogin = (userType = "user") => {
  const { tc, changeLanguage } = useBatchTranslation();
  return useMutation({
    mutationFn: async (values) => {
      const res = await custAxios.post("/auth/login", values);

      // Note: Tokens are stored in httpOnly cookies automatically by the backend
      // We only store user data in localStorage for frontend use (no tokens)
      if (res.data && res.data.data) {
        const user = res.data.data.user;
        
        if (user) {
          // Sanitize user data - remove sensitive fields (password, tokens, etc.)
          const sanitizedUser = sanitizeAndStringifyUser(user);
          
          if (userType === "admin") {
            // For admin login, store sanitized user data only (token is in cookie: adminToken)
            localStorage.setItem("adminUser", sanitizedUser);
          } else {
            // For regular user login, store sanitized user data only (token is in cookie: userToken)
            localStorage.setItem("user", sanitizedUser);
          }
        } else {
          console.warn("No user data in login response:", res.data);
        }
      } else {
        console.error("Invalid login response structure:", res.data);
      }

      return res.data;
    },
    onSuccess: (data) => {
      // Use language from API user object when available
      // Only allow 'en' or 'es' - filter out invalid languages like 'fr'
      const validLanguages = ['en', 'es'];
      const apiLanguage = data?.data?.user?.language;
      let selectedLanguage = 'en'; // Default to English
      
      if (apiLanguage && typeof apiLanguage === 'string') {
        const trimmedLang = apiLanguage.trim().toLowerCase();
        if (validLanguages.includes(trimmedLang)) {
          selectedLanguage = trimmedLang;
        } else {
          console.warn(`Invalid language "${apiLanguage}" from API, defaulting to "en"`);
          // If invalid language, save 'en' to API to fix it
          try {
            const formData = new FormData();
            formData.append("language", "en");
            formAxios.put("/auth/profile-settings", formData).catch(err => 
              console.warn('Failed to update invalid language in API:', err)
            );
          } catch {}
        }
      }

      try {
        localStorage.setItem('youCalendy_selectedLanguage', selectedLanguage);
      } catch {}
      
      // If user language is English (default), let the service handle browser detection
      // Otherwise, use the saved language preference
      if (selectedLanguage !== 'en') {
        try {
          changeLanguage(selectedLanguage);
        } catch {}
      }
      
      // Ensure translations are ready (instant, no delay needed - all texts are local)
      try { 
        batchTranslationService.ensureTranslationsForCurrentLanguage(); 
      } catch {}
      toast.success(tc("loginSuccessful"));
    },
    onError: (error) => {
      console.error("Login error:", error);
      if (error.message && error.message.includes("Network Error")) {
        toast.error(tc("networkErrorBackendNotAccessible"));
      } else if (error.response) {
        toast.error(error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        toast.error(tc("noResponseReceivedFromServer"));
      } else {
        toast.error(error.message || tc("loginFailed"));
      }
      throw error;
    },
  });
};

export const useSocialLogin = () => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async (socialData) => {
      const res = await custAxios.post("/auth/socialAuth", socialData);
      
      // Note: Tokens are stored in httpOnly cookies automatically by the backend
      // We only store sanitized user data in localStorage for frontend use (no tokens, no sensitive data)
      if (res.data && res.data.data && res.data.data.user) {
        // Sanitize user data - remove sensitive fields (password, tokens, etc.)
        const sanitizedUser = sanitizeAndStringifyUser(res.data.data.user);
        localStorage.setItem("user", sanitizedUser);
      } else {
        console.log("Response structure:", JSON.stringify(res.data));
      }
      
      return res.data;
    },
    onSuccess: (data) => {
      const provider = data?.data?.user?.provider || "social";
      toast.success(tc("loginSuccessfulWith", { provider }));
    },
    onError: (error) => {
      console.error("Social login error:", error);
      if (error.message && error.message.includes("Network Error")) {
        toast.error(tc("networkErrorBackendNotAccessible"));
      } else if (error.response) {
        toast.error(error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        toast.error(tc("noResponseReceivedFromServer"));
      } else {
        toast.error(error.message || tc("socialLoginFailed"));
      }
      throw error;
    },
  });
};

export const useLogout = (userType = "user") => {
  const { tc } = useBatchTranslation();
  return useMutation({
    mutationFn: async () => {
      try {
        // Call logout endpoint with userType to clear only the correct cookie
        // This allows multiple sides to be logged in simultaneously
        await custAxios.post("/auth/logout", { userType });
      } catch (error) {
        // Continue with local cleanup even if API call fails
      }
      
      // Clear all localStorage data on logout based on user type
      // Note: Tokens are stored in httpOnly cookies, cleared by backend
      if (userType === "admin") {
        // Clear admin-specific data
        localStorage.removeItem("adminUser");
      } else {
        // Clear barber/user-specific data
        localStorage.removeItem("user");
        localStorage.removeItem("businessName");
      }
      
      // Clear common auth-related data
      localStorage.removeItem("clientId");
      localStorage.removeItem("client_invitation_token");
      localStorage.removeItem("client_business_id");
      localStorage.removeItem("client_staff_id");
      localStorage.removeItem("client_data");
      localStorage.removeItem("invitationToken");
      localStorage.removeItem("businessId");
      localStorage.removeItem("clientStaffId");
      
      // Clear public profile data
      localStorage.removeItem("publicBusinessId");
      localStorage.removeItem("publicBarberData");
      localStorage.removeItem("publicStaffId");
      
      // Clear Google Analytics data
      localStorage.removeItem("ga_measurement_id");
      localStorage.removeItem("ga_connected");
      
      // Clear translation cache and language preference
      localStorage.removeItem("translationCache");
      localStorage.removeItem("batchTranslationCache");
      localStorage.removeItem("youCalendy_selectedLanguage");
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success(tc("logoutSuccessful"));
    },
  });
};