import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button, TextInput, PasswordInput, /* Divider, */ Text, Checkbox, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import LazyFooter from "../../components/home/landing/LazyFooter";
// Social login icons temporarily disabled
// import { GoogleIcon, FacebookIcon } from "../../components/common/Svgs";
import { HeaderLogo } from "../../components/common/Svgs";
// import { signInWithGoogle, signInWithFacebook } from "../../configs/firebase.config";
// import { toast } from "sonner";
import { useLogin /*, useSocialLogin */ } from "../../hooks/useLogin";

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

const EmailLoginSection = ({ form, loading }) => {
  return (
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
      <PasswordInput
        placeholder="Password"
        radius="md"
        size="md"
        mt="xs"
        aria-label="Password input"
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
        leftSection={<Mail className="mr-2 h-4 w-4" />}
        aria-label="Login with email"
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
        Login With Email
      </Button>
      
      <div className="mt-3 text-center">
        <Link to="/forgot-password" className="text-[#2F70EF] text-sm font-medium hover:underline">
          Forgot Password?
        </Link>
      </div>
      
      <div className="mt-4 text-center">
        <Text size="sm" c="#565656">
          Don't have an account?{" "}
          <Link to="/registration" className="text-[#323334] font-medium hover:underline">
            Sign up
          </Link>
        </Text>
      </div>
    </div>
  );
};

// const SocialLoginButtons = ({ onGoogleLogin, onFacebookLogin, loading }) => (
//   <div className="flex flex-col gap-2 w-full">
//     <Button
//       fullWidth
//       variant="default"
//       size="md"
//       radius="md"
//       className="bg-white"
//       leftSection={<GoogleIcon />}
//       aria-label="Login with Google"
//       onClick={onGoogleLogin}
//       loading={loading.google}
//       styles={{
//         root: {
//           height: '45px',
//           borderRadius: '8px',
//           fontWeight: 500,
//           fontSize: '15px',
//           boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
//         }
//       }}
//     >
//     </Button>
//     <Button
//       fullWidth
//       variant="default"
//       size="md"
//       radius="md"
//       className="bg-white"
//       leftSection={<FacebookIcon />}
//       aria-label="Login with Facebook"
//       onClick={onFacebookLogin}
//       loading={loading.facebook}
//       styles={{
//         root: {
//           height: '45px',
//           borderRadius: '8px',
//           fontWeight: 500,
//           fontSize: '15px',
//           boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
//         }
//       }}
//     >
//     </Button>
//   </div>
// );

const TermsCheckbox = ({ checked, onChange, error }) => (
  <div className="flex items-start sm:items-center w-full mt-3 bg-white p-3 rounded-lg">
    <Checkbox
      id="acceptTerms"
      name="acceptTerms"
      checked={checked}
      onChange={onChange}
      styles={{ 
        input: { 
          height: '1rem',
          width: '1rem',
          padding: '0.5rem',
          borderColor: '#D1D5DB',
          cursor: 'pointer'
        },
        label: { paddingLeft: '0.5rem' }
      }}
      color="#2F70EF"
      label={
        <Text size="xs" c="#565656">
          I accept the{' '}
          <Anchor href="#" c="#323334" fw={500} underline="hover" size="xs">
            Terms Conditions
          </Anchor>{' '}
          and confirm that I have read the{' '}
          <Anchor href="#" c="#323334" fw={500} underline="hover" size="xs">
            Privacy Policy
          </Anchor>
          .
        </Text>
      }
      aria-labelledby="terms-label"
      size="sm"
      error={error}
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState({
    email: false,
    // google: false,
    // facebook: false
  });

  const { mutateAsync: login } = useLogin();
  // const { mutateAsync: socialLogin } = useSocialLogin(); // disabled social login

  const form = useForm({
    initialValues: {
      email: 'barber@gmail.com',
      password: 'Password123',
      acceptTerms: true,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address"),
      password: (value) => (!value ? "Password is required" : value.length < 6 ? "Password must be at least 6 characters" : null),
      acceptTerms: (value) => (!value ? "You must accept the terms and conditions" : null),
    },
  });

  const handleLoginSubmit = async (values) => {
    try {
      setLoadingStates(prev => ({ ...prev, email: true }));

      const response = await login({...values, userType: 'user'});

      if (response?.data?.user) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, email: false }));
    }
  };

  // Social login handlers disabled
  // const handleGoogleLogin = async () => { /* ... */ };
  // const handleFacebookLogin = async () => { /* ... */ };

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
                Welcome! First things first
              </h1>
              <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
                You can always change them later
              </p>
            </div>
            <form onSubmit={form.onSubmit(handleLoginSubmit)} className="w-full">
              <div className="flex flex-col items-center gap-2 w-full">
                <EmailLoginSection form={form} loading={loadingStates.email} />

                {/* Social login temporarily removed */}
                {/* <Divider
                  label={
                    <Text size="sm" c="#494949">
                      or
                    </Text>
                  }
                  labelPosition="center"
                  my="xs"
                  className="w-full"
                />

                <SocialLoginButtons
                  onGoogleLogin={handleGoogleLogin}
                  onFacebookLogin={handleFacebookLogin}
                  loading={{
                    google: loadingStates.google,
                    facebook: loadingStates.facebook
                  }}
                /> */}
                
                <div className="w-full mt-2">
                  <TermsCheckbox 
                    checked={form.values.acceptTerms}
                    onChange={(e) => form.setFieldValue('acceptTerms', e.currentTarget.checked)}
                    error={form.errors.acceptTerms}
                  />
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

export default Login;
