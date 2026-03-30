import { useMutation } from "@tanstack/react-query";
import custAxios from "../configs/axios.config";
import { toast } from "sonner";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";

export const useForgotPassword = () => {
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: async (email) => {
      const res = await custAxios.post("/auth/forgotPassword", { email });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(tc("Password reset token sent to your email") || "Password reset token sent to your email");
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.message || "Failed to send reset token";
      toast.error(tc(errorMessage) || errorMessage);
    },
  });
};

export const useResetPassword = () => {
  const { tc } = useBatchTranslation();
  
  return useMutation({
    mutationFn: async ({ email, passwordResetToken, password }) => {
      const res = await custAxios.put("/auth/resetPassword", {
        email,
        passwordResetToken,
        password
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(tc("Password reset successfully") || "Password reset successfully");
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      toast.error(tc(errorMessage) || errorMessage);
    },
  });
};