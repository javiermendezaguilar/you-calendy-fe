import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "../configs/axios.config";

const useCreateFeatureSuggestion = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await axiosInstance.post("/feature-suggestions", payload);
        return data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.message || "Failed to submit suggestion"
        );
      }
    },
    onSuccess: () => {
      toast.success("Feature suggestion submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { useCreateFeatureSuggestion }; 