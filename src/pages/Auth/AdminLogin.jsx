import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button, TextInput, PasswordInput, Text } from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";
import LazyFooter from "../../components/home/landing/LazyFooter";
import { HeaderLogo } from "../../components/common/Svgs";
import { useMutation } from "@tanstack/react-query";
import custAxios from "../../configs/axios.config";
import { toast } from "sonner";
import { sanitizeAndStringifyUser } from "../../utils/userDataSanitizer";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const LogoSection = () => (
  <div className="w-full flex flex-col justify-start items-start">
    <div className="flex justify-center items-center">
      <Link to="/" className="cursor-pointer">
        <HeaderLogo />
      </Link>
    </div>
  </div>
);

const ProgressBar = () => (
  <div className="w-full max-w-[450px] h-3 bg-[#C3D4EE] mb-6 rounded-lg relative">
    <div className="w-full h-3 bg-[#2F70EF] relative rounded-lg">
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full left-[25px] top-1.5" />
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full left-9 top-1.5" />
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full left-[calc(50%-2px)] top-1.5" />
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full right-9 top-1.5" />
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full right-[25px] top-1.5" />
    </div>
  </div>
);

const AdminLoginSection = ({ form, loading }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <TextInput
        placeholder="Admin Email"
        radius="md"
        size="md"
        aria-label="Admin email input"
        styles={{
          input: {
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
            '&:focus': {
              boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
            }
          }
        }}
        {...form.getInputProps('email')}
      />
      <PasswordInput
        placeholder="Admin Password"
        radius="md"
        size="md"
        mt="xs"
        aria-label="Admin password input"
        styles={{
          input: {
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
            '&:focus': {
              boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
            }
          }
        }}
        {...form.getInputProps('password')}
      />
      <Button
        fullWidth
        size="md"
        radius="md"
        color="#323334"
        leftSection={<Shield className="mr-2 h-4 w-4" />}
        aria-label="Admin login"
        type="submit"
        mt="xs"
        loading={loading}
        styles={{
          root: {
            height: '45px',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '15px',
          }
        }}
      >
        Admin Login
      </Button>
      
      <div className="mt-4 text-center">
        <Text size="sm" c="#565656">
          Not an admin?{" "}
          <Link to="/login" className="text-[#323334] font-medium hover:underline">
            User Login
          </Link>
        </Text>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Custom admin login mutation without automatic success toast
  const { mutateAsync: login, isLoading } = useMutation({
    mutationFn: async (values) => {
      const res = await custAxios.post("/auth/login", values);
      return res.data;
    },
    onError: (error) => {
      console.error("Login error:", error);
      if (error.message && error.message.includes("Network Error")) {
        toast.error("Network error: Backend server not accessible");
      } else if (error.response) {
        toast.error(error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        toast.error("No response received from server");
      } else {
        toast.error(error.message || "Login failed");
      }
      throw error;
    },
  });

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Please enter a valid email address'),
      password: (value) => (!value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    try {
      const response = await login({...values, userType: 'admin'});
      
      // Check if the logged in user has admin or sub-admin role
      const user = response?.data?.user;
      const token = response?.data?.token;
      
      if (user && (user.role === "admin" || user.role === "sub-admin")) {
        // Note: adminToken is stored in httpOnly cookie automatically by backend
        // Store sanitized admin user data only (no sensitive data like password, tokens)
        const sanitizedUser = sanitizeAndStringifyUser(user);
        localStorage.setItem("adminUser", sanitizedUser);
        toast.success('Admin login successful');
        navigate("/admin/dashboard");
      } else {
        // If user is not admin/sub-admin, show error without storing credentials
        toast.error('Access denied. Admin credentials required.');
      }
    } catch (error) {
      // Error handling is already done in the mutation's onError callback
      console.error("Admin login error:", error);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <main className="flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-5 sm:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection />

        <div className="mb-10" />

        <ProgressBar />

        <div className="flex flex-col items-center w-full max-w-[450px] mt-10 mb-10">
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col items-center w-full">
              <h1 className="text-[#323334] text-center text-2xl sm:text-3xl font-bold leading-tight">
                Admin Access Portal
              </h1>
              <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
                Secure login for administrators only
              </p>
            </div>
            <form onSubmit={form.onSubmit(handleSubmit)} className="w-full">
              <div className="flex flex-col items-center gap-2 w-full">
                <AdminLoginSection form={form} loading={loading} />
              </div>
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default AdminLogin;
