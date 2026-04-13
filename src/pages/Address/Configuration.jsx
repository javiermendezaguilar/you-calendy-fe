import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import LazyFooter from '../../components/home/landing/LazyFooter';
import { HeaderLogo } from "../../components/common/Svgs";
import CityAutocomplete from '../../components/common/CityAutocomplete';
import { setAddress, nextStep, prevStep } from '../../store/registrationSlice';

const LogoSection = ({ onBackClick }) => (
  <div className="w-full flex justify-start items-start mb-5">
    <div className="flex flex-col">
      <div className="mb-3">
        <div className="flex justify-center items-center">
          <Link to="/" className="cursor-pointer">
            <HeaderLogo />
          </Link>
        </div>
      </div>
      <Button
        onClick={onBackClick}
        variant="subtle"
        p={0}
        top={40}
        styles={{ 
          root: { color: '#323334' },
          label: { fontSize: '1rem', fontWeight: 500 }
        }}
        classNames={{
          root: '!bg-transparent'
        }}
        leftSection={<ArrowLeft className="mr-1 h-4 w-4" />}
        aria-label="Go back"
      >
        Back
      </Button>
    </div>
  </div>
);

const ProgressBar = () => (
  <div className="w-full max-w-[450px] h-2 bg-[#E0E7FF] mb-6 rounded-full relative">
    <div className="w-[calc(100%/5*3)] h-2 bg-[#2F70EF] absolute left-0 top-0 rounded-full transition-all duration-300"></div>
  </div>
);

const FormHeader = () => (
  <div className="flex flex-col items-center w-full mb-4 mt-10">
    <h1 className="text-[#323334] text-center text-2xl sm:text-3xl font-bold leading-tight">
      Address Configuration
    </h1>
    <p className="text-[#7898AB] text-center text-sm font-normal leading-normal mt-2">
      Fine-Tune Your Address Settings for Seamless Navigation
    </p>
  </div>
);

const AddressForm = ({ form, styles }) => (
  <div className="flex flex-col items-center gap-3 w-full">
    <TextInput
      name="streetName"
      placeholder="Enter your street name"
      styles={styles}
      aria-label="Street Name"
      w="100%"
      size="sm"
      {...form.getInputProps('streetName')}
    />
    <TextInput
      name="houseNumber"
      placeholder="Enter your house/building number"
      styles={styles}
      aria-label="House/Building Number"
      w="100%"
      size="sm"
      {...form.getInputProps('houseNumber')}
    />
    <CityAutocomplete
      placeholder="Enter city name"
      value={form.values.city}
      onChange={(value) => form.setFieldValue('city', value)}
      onCitySelect={(cityData) => {
        // Store the selected city data if needed for coordinates or additional info
        form.setFieldValue('city', cityData.value);
        // You can also store additional data like coordinates if needed
        // form.setFieldValue('cityData', cityData);
      }}
      error={form.errors.city}
      styles={styles}
      aria-label="City"
      w="100%"
      size="sm"
      searchable
      clearable
      limit={15}
    />
    <TextInput
      name="postalCode"
      placeholder="Postal Code"
      styles={styles}
      aria-label="Postal Code"
      w="100%"
      size="sm"
      {...form.getInputProps('postalCode')}
    />
  </div>
);

const Configuration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const initialAddress = useSelector((state) => state.registration.address);

  const form = useForm({
    initialValues: {
      streetName: initialAddress.streetName || '',
      houseNumber: initialAddress.houseNumber || '',
      city: initialAddress.city || '',
      postalCode: initialAddress.postalCode || ''
    },
    validate: {
      streetName: (value) => (!value ? "Street name is required" : null),
      houseNumber: (value) => (!value ? "House/building number is required" : null),
      city: (value) => (!value ? "Please enter a city" : null),
      postalCode: (value) => (!value ? "Postal code is required" : null),
    }
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
      '&::placeholder': {
        color: '#8E8E8E',
      },
    },
    rightSection: {
      color: '#8E8E8E',
    }
  };

  const handleNext = (values) => {
    dispatch(setAddress(values));
    dispatch(nextStep());
    navigate('/location');
  };

  const handleBack = () => {
    dispatch(prevStep());
    navigate('/details');
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto">
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-5 sm:p-6 border-[3px_solid_#FCFFFF]">
        <LogoSection onBackClick={handleBack} />
        <ProgressBar />

        <div className="flex flex-col items-center w-full max-w-[450px]">
          <div className="flex flex-col items-center gap-4 w-full">
            <FormHeader />
            <form onSubmit={form.onSubmit(handleNext)} className="w-full">
              <AddressForm 
                form={form}
                styles={inputStyles}
              />

              <Button
                fullWidth
                mt="md"
                size="md"
                radius="md"
                type="submit"
                styles={{
                  root: {
                    backgroundColor: '#323334',
                    height: '45px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '15px',
                    marginBottom: '50px',
                    '&:hover': { backgroundColor: '#444' },
                  }
                }}
                aria-label="Next step"
              >
                Next
              </Button>
            </form>
          </div>
        </div>
      </main>
      <LazyFooter />
    </div>
  );
};

export default Configuration;
