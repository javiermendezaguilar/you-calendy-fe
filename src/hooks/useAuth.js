import custAxios, { formAxios } from "../configs/axios.config.js";
import { useMutation, useQuery } from "@tanstack/react-query";

const getProfileSettings = async () => {
    const response = await custAxios.get("/auth/profile-settings");
    return response.data;
};

export const useGetProfileSettings = (options = {}) => {
    // Check if user data exists (authentication via cookies)
    const user = localStorage.getItem("user") || localStorage.getItem("adminUser");
    const isAuthenticated = !!user;
    
    return useQuery({
        queryKey: ["profile-settings"],
        queryFn: getProfileSettings,
        enabled: isAuthenticated && (options.enabled ?? true), // Only run query if user is authenticated
        retry: 1,
        ...options,
    });
};

const updateProfileSettings = async (data) => {
    const formData = new FormData();
    if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
    }
    if (data.removeProfileImage) {
        formData.append("removeProfileImage", "true");
    }
    if (data.fullName) {
        const nameParts = data.fullName.trim().split(" ");
        const firstName = (nameParts[0] || "").trim();
        // Ensure we override any existing last name on the server even when user enters only one word
        let lastName = nameParts.slice(1).join(" ").trim();
        // Backend falls back to previous last name when an empty string is sent; send a single space to clear it
        if (lastName.length === 0) lastName = " ";
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
    }
    if (data.newPassword) {
        formData.append("currentPassword", data.currentPassword);
        formData.append("newPassword", data.newPassword);
        formData.append("confirmPassword", data.confirmPassword);
    }
    if (data.language) {
        formData.append("language", data.language);
    }
    
    const response = await formAxios.put("/auth/profile-settings", formData);
    return response.data;
};

export const useUpdateProfileSettings = () => {
    return useMutation({
        mutationFn: updateProfileSettings,
    });
};
