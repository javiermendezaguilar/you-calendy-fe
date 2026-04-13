import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { Button, PasswordInput, Text, PinInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import LazyFooter from "../../components/home/landing/LazyFooter";
import { HeaderLogo } from "../../components/common/Svgs";
import { useResetPassword } from "../../hooks/useForgotPassword";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

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
    <div className="w-[76px] h-3 bg-[#2F70EF] relative rounded-lg">
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full left-[25px] top-1.5" />
      <div className="absolute w-1 h-1 bg-[#023A8C] rounded-full left-9 top-1.5" />
    </div>
    <div className="absolute w-2 h-2 bg-white border border-[#C3D4EE] rounded-full left-[20%] top-[2px]"></div>
    <div className="absolute w-2 h-2 bg-white border border-[#C3D4EE] rounded-full left-[40%] top-[2px]"></div>
    <div className="absolute w-2 h-2 bg-white border border-[#C3D4EE] rounded-full left-[60%] top-[2px]"></div>
    <div className="absolute w-2 h-2 bg-white border border-[#C3D4EE] rounded-full left-[80%] top-[2px]"></div>
  </div>
);

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resetCode, setResetCode] = useState('');
  const { mutateAsync: resetPassword, isLoading } = useResetPassword();
  const { tc } = useBatchTranslation();

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "Please confirm your password";
        if (value !== values.password) return "Passwords do not match";
        return null;
      },
    },
  });

  const handleSubmit = async (values) => {
    if (!resetCode || resetCode.length !== 6) {
      return;
    }

    try {
      await resetPassword({
        email,
        passwordResetToken: resetCode,
        password: values.password
      });
      
      // Navigate to login page after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  // Redirect to forgot password if no email is provided
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  return (
    <div className="h-screen overflow-y-auto">
      <main className="flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-5 sm:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection />
        <div className="mb-10" />
        <ProgressBar />
        
        <div className="flex flex-col items-center w-full max-w-[450px] mt-10 mb-10">
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col items-center w-full">
              <div className="w-16 h-16 bg-[#2F70EF] rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-[#323334] text-center text-2xl sm:text-3xl font-bold leading-tight">
                Reset your password
              </h1>
              <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            
            <form onSubmit={form.onSubmit(handleSubmit)} className="w-full">
              <div className="flex flex-col gap-4 w-full">
                {/* OTP Input */}
                <div className="flex flex-col gap-2">
                  <Text size="sm" fw={500} c="#323334">
                    Verification Code
                  </Text>
                  <Group justify="center">
                    <PinInput
                      length={6}
                      value={resetCode}
                      onChange={setResetCode}
                      size="lg"
                      radius="md"
                      placeholder="○"
                      styles={{
                        input: {
                          width: '50px',
                          height: '50px',
                          fontSize: '18px',
                          fontWeight: 600,
                          textAlign: 'center',
                          border: '2px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                          '&:focus': {
                            borderColor: '#2F70EF',
                            boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
                          }
                        }
                      }}
                    />
                  </Group>
                </div>
                
                {/* New Password */}
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  radius="md"
                  size="md"
                  aria-label="New password input"
                  styles={{
                    label: {
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#323334',
                      marginBottom: '8px'
                    },
                    input: {
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                      '&:focus': {
                        boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
                      }
                    }
                  }}
                  {...form.getInputProps('password')}
                />
                
                {/* Confirm Password */}
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  radius="md"
                  size="md"
                  aria-label="Confirm password input"
                  styles={{
                    label: {
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#323334',
                      marginBottom: '8px'
                    },
                    input: {
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                      '&:focus': {
                        boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
                      }
                    }
                  }}
                  {...form.getInputProps('confirmPassword')}
                />
                
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  color="#323334"
                  leftSection={<Lock className="mr-2 h-4 w-4" />}
                  aria-label="Reset password"
                  type="submit"
                  mt="md"
                  loading={isLoading}
                  disabled={!resetCode || resetCode.length !== 6}
                  styles={{
                    root: {
                      height: '45px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                    }
                  }}
                >
                  Reset Password
                </Button>
                
                <div className="mt-4 text-center">
                  <Text size="sm" c="#565656">
                    Didn't receive the code?{" "}
                    <Link to="/forgot-password" className="text-[#2F70EF] font-medium hover:underline">
                      Resend code
                    </Link>
                  </Text>
                </div>
                
                <div className="mt-2 text-center">
                  <Link to="/login" className="text-[#323334] text-sm font-medium hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {tc('backToLogin')}
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default ResetPassword;
