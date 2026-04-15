import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
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

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;

const EmailLoginSection = ({ values, errors, onChange, loading }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div>
        <input
          name="email"
          type="email"
        placeholder="Email"
        aria-label="Email input"
          value={values.email}
          onChange={onChange}
          className="h-[42px] w-full rounded-md border border-[#D9E0E7] bg-white px-3 text-sm text-[#323334] shadow-[0_2px_5px_rgba(0,0,0,0.08)] outline-none transition focus:border-[#2F70EF] focus:ring-2 focus:ring-[rgba(47,112,239,0.2)]"
        />
        <FieldError message={errors.email} />
      </div>
      <div>
        <input
          name="password"
          type="password"
        placeholder="Password"
        aria-label="Password input"
          value={values.password}
          onChange={onChange}
          className="mt-1 h-[42px] w-full rounded-md border border-[#D9E0E7] bg-white px-3 text-sm text-[#323334] shadow-[0_2px_5px_rgba(0,0,0,0.08)] outline-none transition focus:border-[#2F70EF] focus:ring-2 focus:ring-[rgba(47,112,239,0.2)]"
        />
        <FieldError message={errors.password} />
      </div>
      <button
        className="mt-1 flex h-[45px] w-full items-center justify-center rounded-[8px] bg-[#323334] px-4 text-[15px] font-medium text-white transition hover:bg-[#1f2021] disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Login with email"
        type="submit"
        disabled={loading}
      >
        <Mail className="mr-2 h-4 w-4" />
        Login With Email
      </button>
      
      <div className="mt-3 text-center">
        <Link to="/forgot-password" className="text-[#2F70EF] text-sm font-medium hover:underline">
          Forgot Password?
        </Link>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-[#565656]">
          Don't have an account?{" "}
          <Link to="/registration" className="text-[#323334] font-medium hover:underline">
            Sign up
          </Link>
        </p>
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
    <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-2">
      <input
        id="acceptTerms"
        name="acceptTerms"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border border-[#D1D5DB] accent-[#2F70EF]"
        aria-labelledby="terms-label"
      />
      <span className="text-xs text-[#565656]">
        I accept the{" "}
        <a href="#" className="font-medium text-[#323334] hover:underline">
          Terms Conditions
        </a>{" "}
        and confirm that I have read the{" "}
        <a href="#" className="font-medium text-[#323334] hover:underline">
          Privacy Policy
        </a>
        .
      </span>
    </label>
    <FieldError message={error} />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: 'barber@gmail.com',
    password: 'Password123',
    acceptTerms: true,
  });
  const [errors, setErrors] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    email: false,
    // google: false,
    // facebook: false
  });

  const { mutateAsync: login } = useLogin();
  // const { mutateAsync: socialLogin } = useSocialLogin(); // disabled social login

  const validateForm = () => {
    const nextErrors = {};

    if (!/^\S+@\S+$/.test(values.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!values.password) {
      nextErrors.password = "Password is required";
    } else if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!values.acceptTerms) {
      nextErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, email: true }));

      const response = await login({ ...values, userType: 'user' });

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
              <p className="mt-2 text-center text-sm font-normal leading-normal text-[#7898AB]">
                You can always change them later
              </p>
            </div>
            <form onSubmit={handleLoginSubmit} className="w-full">
              <div className="flex flex-col items-center gap-2 w-full">
                <EmailLoginSection
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  loading={loadingStates.email}
                />

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
                    checked={values.acceptTerms}
                    onChange={handleChange}
                    error={errors.acceptTerms}
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
