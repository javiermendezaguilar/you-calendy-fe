import React, { useState, useEffect } from 'react';
import { Button, TextInput, PasswordInput } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { clientSignUp } from '../../services/clientAPI';

const SignUpModal = ({ show, onClose, onSignUpSuccess, onSwitchToSignIn, service }) => {
  const { tc } = useBatchTranslation();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [defaultCountry, setDefaultCountry] = useState('us');

  useEffect(() => {
    if (!show) return;
    let publicBusinessId = localStorage.getItem('publicBusinessId');
    if (!publicBusinessId) {
      const publicBarberData = localStorage.getItem('publicBarberData');
      if (publicBarberData) {
        try {
          const barberData = JSON.parse(publicBarberData);
          publicBusinessId = barberData?.business?._id || barberData?.businessId;
        } catch {}
      }
    }
    const savedKey = publicBusinessId ? `clientAutoFill:${publicBusinessId}` : 'clientAutoFill';
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          firstName: obj.firstName || '',
          lastName: obj.lastName || '',
          email: obj.email || '',
          phone: obj.phone || ''
        }));
        if (obj.countryIso) {
          setDefaultCountry(String(obj.countryIso).toLowerCase());
        }
      } catch {}
    } else {
      const detectCountryByIP = async () => {
        try {
          const r = await fetch('https://ipapi.co/json/');
          if (r.ok) {
            const j = await r.json();
            const cc = j && (j.country_code || j.countryCode || j.country);
            if (cc && typeof cc === 'string' && cc.length === 2) {
              setDefaultCountry(cc.toLowerCase());
              return;
            }
          }
        } catch {}
        try {
          const r2 = await fetch('https://ipwho.is/?fields=country_code');
          if (r2.ok) {
            const j2 = await r2.json();
            const cc2 = j2 && (j2.country_code || j2.countryCode);
            if (cc2 && typeof cc2 === 'string' && cc2.length === 2) {
              setDefaultCountry(cc2.toLowerCase());
              return;
            }
          }
        } catch {}
        const locale = navigator.language || (Array.isArray(navigator.languages) && navigator.languages[0]) || '';
        const parts = String(locale).split('-');
        const region = parts[1] || parts[0];
        if (region && region.length === 2) {
          setDefaultCountry(region.toLowerCase());
        } else {
          setDefaultCountry('us');
        }
      };
      detectCountryByIP();
    }
  }, [show]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error(tc('firstNameRequired') || 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error(tc('lastNameRequired') || 'Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(tc('emailRequired') || 'Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(tc('phoneRequired') || 'Phone number is required');
      return false;
    }
    if (!formData.password.trim()) {
      toast.error(tc('passwordRequired') || 'Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error(tc('passwordMinLength') || 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(tc('passwordsDoNotMatch') || 'Passwords do not match');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(tc('invalidEmailFormat') || 'Invalid email format');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSigningUp(true);
      
      // Get business ID from public barber data
      let publicBusinessId = localStorage.getItem('publicBusinessId');
      
      if (!publicBusinessId) {
        const publicBarberData = localStorage.getItem('publicBarberData');
        if (publicBarberData) {
          try {
            const barberData = JSON.parse(publicBarberData);
            publicBusinessId = barberData?.business?._id || barberData?.businessId;
          } catch (e) {
            // Silently handle parse error
          }
        }
      }
      
      if (!publicBusinessId) {
        toast.error(tc('businessInformationMissing') || 'Business information is missing');
        return;
      }

      // Sign up using email and password
      const signUpData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim().startsWith('+') ? formData.phone.trim() : `+${formData.phone.trim()}`,
        password: formData.password,
        businessId: publicBusinessId
      };

      const result = await clientSignUp(signUpData);

      if (result && result.client) {
        // Create client information for the next modal
        const clientInfo = {
          _id: result.client._id || result.clientId,
          firstName: result.client.firstName,
          lastName: result.client.lastName,
          email: result.client.email,
          phone: result.client.phone
        };
        
        // Store client ID
        const finalClientId = result.clientId || result.client._id || clientInfo._id;
        if (finalClientId) {
          localStorage.setItem('clientId', finalClientId);
        }
        
        // Mark that this client was just created in this session
        sessionStorage.setItem('clientJustCreated', 'true');
        sessionStorage.setItem('clientCreatedTimestamp', Date.now().toString());
        sessionStorage.setItem('clientCreatedId', finalClientId);
        
        // Save form data for future use
        try {
          const savedKey = `clientAutoFill:${publicBusinessId}`;
          localStorage.setItem(savedKey, JSON.stringify({
            firstName: signUpData.firstName,
            lastName: signUpData.lastName,
            email: signUpData.email,
            phone: signUpData.phone,
            countryIso: defaultCountry
          }));
        } catch {}
        
        toast.success(tc('accountCreatedSuccessfully') || 'Account created successfully');
        onSignUpSuccess(clientInfo);
      } else {
        toast.error(tc('failedToCreateAccount') || 'Failed to create account');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || tc('errorCreatingAccount') || 'Error creating account';
      toast.error(errorMessage);
    } finally {
      setIsSigningUp(false);
    }
  };

  const modalContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {tc('signUp') || 'Sign Up'}
        </h2>
        <p className="text-gray-600 text-sm">
          {tc('createAnAccountToContinue') || 'Create an account to continue'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label={tc('firstName') || 'First Name'}
            placeholder={tc('enterFirstName') || 'Enter first name'}
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            disabled={isSigningUp}
          />
          <TextInput
            label={tc('lastName') || 'Last Name'}
            placeholder={tc('enterLastName') || 'Enter last name'}
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
            disabled={isSigningUp}
          />
        </div>

        <TextInput
          label={tc('email') || 'Email'}
          placeholder={tc('enterEmail') || 'Enter your email'}
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={isSigningUp}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {tc('phone') || 'Phone'}
          </label>
          <PhoneInput
            country={defaultCountry}
            value={formData.phone}
            onChange={(phone, country) => {
              handleInputChange('phone', phone);
              if (country && country.countryCode) {
                setDefaultCountry(String(country.countryCode).toLowerCase());
              }
            }}
            disabled={isSigningUp}
            inputStyle={{
              width: '100%',
              height: '42px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              paddingLeft: '48px'
            }}
            buttonStyle={{
              border: '1px solid #d1d5db',
              borderRadius: '4px 0 0 4px'
            }}
          />
        </div>

        <PasswordInput
          label={tc('password') || 'Password'}
          placeholder={tc('enterPassword') || 'Enter password (min 6 characters)'}
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
          disabled={isSigningUp}
        />

        <PasswordInput
          label={tc('confirmPassword') || 'Confirm Password'}
          placeholder={tc('confirmPassword') || 'Confirm your password'}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          required
          disabled={isSigningUp}
        />
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <Button
          onClick={handleSignUp}
          color="dark"
          fullWidth
          loading={isSigningUp}
        >
          {isSigningUp ? (tc('creatingAccount') || 'Creating account...') : (tc('signUp') || 'Sign Up')}
        </Button>
        
        <div className="text-center text-sm text-gray-600">
          {tc('alreadyHaveAnAccount') || 'Already have an account? '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-[#556b2f] hover:underline font-medium"
            disabled={isSigningUp}
          >
            {tc('signIn') || 'Sign In'}
          </button>
        </div>
        
        <Button
          onClick={onClose}
          variant="outline"
          color="gray"
          fullWidth
          disabled={isSigningUp}
        >
          {tc('cancel') || 'Cancel'}
        </Button>
      </div>
    </div>
  );

  return (
    <CommonModal
      opened={show}
      onClose={onClose}
      content={modalContent}
      size="md"
      styles={{
        content: {
          maxWidth: "500px",
        },
        body: {
          minHeight: "500px",
        }
      }}
    />
  );
};

export default SignUpModal;

