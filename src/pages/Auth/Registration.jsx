import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Mail } from 'lucide-react';
import { TextInput, PasswordInput, Button, Text, Anchor, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import LazyFooter from '../../components/home/landing/LazyFooter';
import { HeaderLogo } from "../../components/common/Svgs";
import { setAuthDetails, nextStep, resetRegistration } from '../../store/registrationSlice';

const LogoSection = ({ onBackClick }) => (
  <div className="w-full flex justify-start items-start mb-5 px-2 sm:px-0">
    <div className="flex flex-col">
      <div className="mb-3">
        <Link to="/" className="cursor-pointer">
          <HeaderLogo />
        </Link>
      </div>
      <Button
        onClick={onBackClick}
        variant="subtle"
        p={0}
        styles={{
          root: {
            color: '#323334',
            position: 'relative',
            top: 40,
          },
          label: { fontSize: '1rem', fontWeight: 500 }
        }}
        className="!bg-transparent sm:!top-[40px] !top-[20px]"
        leftSection={<ArrowLeft className="mr-1 h-4 w-4" />}
        aria-label="Go back"
      >
        Back
      </Button>
    </div>
  </div>
);

const FormHeader = () => (
  <div className="flex flex-col items-center w-full mb-4 px-2 sm:px-0">
    <h1 className="text-[#323334] text-center text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
      Create Your Account
    </h1>
    <p className="text-[#7898AB] text-center text-xs sm:text-sm font-normal leading-normal mt-2">
      Sign up to start managing your appointments.
    </p>
  </div>
);

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

const Registration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Clear any existing registration data when component mounts
  useEffect(() => {
    dispatch(resetRegistration());
  }, [dispatch]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      acceptTerms: false,
    },
    
    validate: {
      email: (value) => (!value || !/^\S+@\S+$/.test(value) ? "Please enter a valid email address" : null),
      password: (value) => (!value ? "Password is required" : value.length < 6 ? "Password must be at least 6 characters" : null),
      acceptTerms: (value) => (!value ? "You must accept the terms and conditions" : null),
    },
  });

  const inputStyles = {
    input: {
      height: '40px',
      color: '#000000',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      paddingLeft: '16px',
      paddingRight: '16px',
      borderRadius: '0.5rem',
      borderColor: '#E0E0E0',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
      '&:focus': {
        borderColor: '#2F70EF',
        boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
      },
    },
  };
  
  const handleSubmit = (values) => {
    dispatch(setAuthDetails({ email: values.email, password: values.password }));
    dispatch(nextStep());
    navigate('/details');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto relative">
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-3 sm:p-5 md:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection onBackClick={handleBack} />

        <div className="flex flex-col items-center w-full max-w-[450px] mt-5 sm:mt-10 mb-6 sm:mb-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <FormHeader />

            <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col items-center gap-3 w-full px-2 sm:px-0">
              <TextInput
                name="email"
                placeholder="Email Address"
                styles={inputStyles}
                aria-label="Email Address"
                w="100%"
                size="sm"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                name="password"
                placeholder="Password"
                styles={inputStyles}
                aria-label="Password"
                w="100%"
                size="sm"
                {...form.getInputProps('password')}
              />

              <Button
                fullWidth
                mt="md"
                size="md"
                radius="md"
                type="submit"
                leftSection={<Mail className="h-4 w-4" />}
                styles={{
                  root: {
                    backgroundColor: '#323334',
                    height: '45px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '15px',
                    '&:hover': {
                      backgroundColor: '#444',
                    },
                  }
                }}
                aria-label="Next Step"
              >
                Next Step
              </Button>

              <div className="mt-4 text-center">
                <Text size="sm" c="#565656">
                  Already have an account?{" "}
                  <Anchor href="/login" c="#323334" fw={500} underline="hover">
                    Login
                  </Anchor>
                </Text>
              </div>

              <TermsCheckbox 
                checked={form.values.acceptTerms}
                onChange={(e) => form.setFieldValue('acceptTerms', e.currentTarget.checked)}
                error={form.errors.acceptTerms}
              />
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default Registration; 
