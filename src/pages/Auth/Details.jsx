import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import LazyFooter from '../../components/home/landing/LazyFooter';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { HeaderLogo } from "../../components/common/Svgs";
import { setPersonalDetails, nextStep, prevStep } from '../../store/registrationSlice';

// Reusable components
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
          root: { color: '#323334', position: 'relative', top: 40, },
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

const ProgressBar = () => (
  <div className="w-full max-w-[250px] md:max-w-[450px] h-2 bg-[#E0E7FF] mb-6 rounded-full relative">
    <div className="w-[calc(100%/5*2)] h-2 bg-[#2F70EF] absolute left-0 top-0 rounded-full transition-all duration-300"></div>
  </div>
);

const FormHeader = () => (
  <div className="flex flex-col items-center w-full mb-4 px-2 sm:px-0">
    <h1 className="text-[#323334] text-center text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
      Business & Personal Detail
    </h1>
    <p className="text-[#7898AB] text-center text-xs sm:text-sm font-normal leading-normal mt-2">
      Tell us more about yourself and your business.
    </p>
  </div>
);

const PhoneNumberInput = ({ value, onChange, error }) => (
  <div className="w-full">
    <PhoneInput
      country={"us"}
      value={value}
      onChange={onChange}
      inputStyle={{
        width: "100%",
        height: "40px",
        backgroundColor: "white",
        border: error ? "1px solid #f03e3e" : "1px solid #E0E0E0",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#333",
        paddingLeft: "48px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
      }}
      buttonStyle={{
        backgroundColor: "white",
        border: error ? "1px solid #f03e3e" : "1px solid #E0E0E0",
        borderRadius: "8px 0 0 8px",
      }}
    />
    {error && <p className="text-xs text-[#f03e3e] mt-1 ml-1">{error}</p>}
  </div>
);

const Details = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const initialData = useSelector((state) => ({
    personalName: state.registration.personalName,
    surname: state.registration.surname,
    businessName: state.registration.businessName,
    phoneNumber: state.registration.phoneNumber,
  }));

  const form = useForm({
    initialValues: {
      businessName: initialData.businessName || '',
      personalName: initialData.personalName || '',
      surname: initialData.surname || '',
      phoneNumber: initialData.phoneNumber || '',
    },
    validate: {
      businessName: (value) => (!value ? "Business name is required" : null),
      personalName: (value) => (!value ? "Personal name is required" : null),
      surname: (value) => (!value ? "Surname is required" : null),
      phoneNumber: (value) => (!value || value.length < 10 ? "Valid phone number is required" : null),
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
      '&:focus': { borderColor: '#2F70EF', boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)', },
    },
  };
  
  const handleSubmit = (values) => {
    dispatch(setPersonalDetails(values));
    dispatch(nextStep());
    navigate('/configuration');
  };

  const handleBack = () => {
    dispatch(prevStep());
    navigate('/registration');
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto relative">
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-3 sm:p-5 md:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection onBackClick={handleBack} />
        <ProgressBar />

        <div className="flex flex-col items-center w-full max-w-[450px] mt-5 sm:mt-10 mb-6 sm:mb-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <FormHeader />

            <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col items-center gap-3 w-full px-2 sm:px-0">
              <TextInput
                name="businessName"
                placeholder="Business Name"
                styles={inputStyles}
                aria-label="Business Name"
                w="100%"
                size="sm"
                {...form.getInputProps('businessName')}
              />
              <TextInput
                name="personalName"
                placeholder="First Name"
                styles={inputStyles}
                aria-label="First Name"
                w="100%"
                size="sm"
                {...form.getInputProps('personalName')}
              />
              <TextInput
                name="surname"
                placeholder="Surname"
                styles={inputStyles}
                aria-label="Surname"
                w="100%"
                size="sm"
                {...form.getInputProps('surname')}
              />
              <PhoneNumberInput 
                value={form.values.phoneNumber}
                onChange={(phone) => form.setFieldValue('phoneNumber', phone)}
                error={form.errors.phoneNumber}
              />
              <Button
                fullWidth
                mt="md"
                size="md"
                radius="md"
                type="submit"
                aria-label="Next Step"
                styles={{
                  root: {
                    backgroundColor: '#323334',
                    height: '45px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '15px',
                    '&:hover': { backgroundColor: '#444', },
                  }
                }}
              >
                Next Step
              </Button>
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default Details;
