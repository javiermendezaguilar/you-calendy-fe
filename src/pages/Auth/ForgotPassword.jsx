import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import Footer from "../../components/home/landing/Footer";
import { HeaderLogo } from "../../components/common/Svgs";
import { useForgotPassword } from "../../hooks/useForgotPassword";
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const { mutateAsync: forgotPassword, isLoading } = useForgotPassword();
  const { tc } = useBatchTranslation();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address"),
    },
  });

  const handleSubmit = async (values) => {
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
      // Navigate to reset password page with email
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  if (emailSent) {
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
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-[#323334] text-center text-2xl sm:text-3xl font-bold leading-tight">
                  Check your email
                </h1>
                <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
                  We've sent a password reset code to your email address
                </p>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  color="#323334"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(form.values.email)}`)}
                  styles={{
                    root: {
                      height: '45px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                    }
                  }}
                >
                  Continue to Reset Password
                </Button>
                
                <div className="mt-4 text-center">
                  <Text size="sm" c="#565656">
                    Didn't receive the email?{" "}
                    <button 
                      onClick={() => setEmailSent(false)}
                      className="text-[#2F70EF] font-medium hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Try again
                    </button>
                  </Text>
                </div>
                
                <div className="mt-2 text-center">
                  <Link to="/login" className="text-[#323334] text-sm font-medium hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {tc('backToLogin')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                Forgot your password?
              </h1>
              <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
                Enter your email address and we'll send you a reset code
              </p>
            </div>
            
            <form onSubmit={form.onSubmit(handleSubmit)} className="w-full">
              <div className="flex flex-col gap-3 w-full">
                <TextInput
                  placeholder="Email"
                  radius="md"
                  size="md"
                  aria-label="Email input"
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
                
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  color="#323334"
                  leftSection={<Mail className="mr-2 h-4 w-4" />}
                  aria-label="Send reset code"
                  type="submit"
                  mt="xs"
                  loading={isLoading}
                  styles={{
                    root: {
                      height: '45px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                    }
                  }}
                >
                  Send Reset Code
                </Button>
                
                <div className="mt-4 text-center">
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
      <Footer />
    </div>
  );
};

export default ForgotPassword;