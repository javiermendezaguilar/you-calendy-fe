import React, { useState, useEffect } from 'react';
import { Button, TextInput, PasswordInput } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { clientSignIn } from '../../services/clientAPI';

const SignInModal = ({ show, onClose, onSignInSuccess, onSwitchToSignUp, onSwitchToForgotPassword, service }) => {
  const { tc } = useBatchTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (!show) {
      // Reset form when modal closes
      setFormData({
        email: '',
        password: ''
      });
    } else {
      // Try to pre-fill email from localStorage
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
          if (obj.email) {
            setFormData(prev => ({ ...prev, email: obj.email }));
          }
        } catch {}
      }
    }
  }, [show]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error(tc('emailRequired') || 'Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      toast.error(tc('passwordRequired') || 'Password is required');
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

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSigningIn(true);
      
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

      // Sign in using email and password
      const signInData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        businessId: publicBusinessId
      };

      const result = await clientSignIn(signInData);

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
        
        // Save email for future use
        try {
          const savedKey = `clientAutoFill:${publicBusinessId}`;
          const existing = localStorage.getItem(savedKey);
          const savedData = existing ? JSON.parse(existing) : {};
          localStorage.setItem(savedKey, JSON.stringify({
            ...savedData,
            email: signInData.email
          }));
        } catch {}
        
        toast.success(tc('signInSuccessful') || 'Signed in successfully');
        onSignInSuccess(clientInfo);
      } else {
        toast.error(tc('signInFailed') || 'Failed to sign in');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || tc('errorSigningIn') || 'Error signing in';
      toast.error(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  const modalContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {tc('signIn') || 'Sign In'}
        </h2>
        <p className="text-gray-600 text-sm">
          {tc('signInToYourAccount') || 'Sign in to your account to continue'}
        </p>
      </div>

      <div className="space-y-4">
        <TextInput
          label={tc('email') || 'Email'}
          placeholder={tc('enterEmail') || 'Enter your email'}
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={isSigningIn}
        />

        <div className="space-y-1">
          <PasswordInput
            label={tc('password') || 'Password'}
            placeholder={tc('enterPassword') || 'Enter your password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={isSigningIn}
          />
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-[#556b2f] hover:underline text-left"
            disabled={isSigningIn}
          >
            {tc('forgotPassword') || 'Forgot Password?'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <Button
          onClick={handleSignIn}
          color="dark"
          fullWidth
          loading={isSigningIn}
        >
          {isSigningIn ? (tc('signingIn') || 'Signing in...') : (tc('signIn') || 'Sign In')}
        </Button>
        
        <div className="text-center text-sm text-gray-600">
          {tc('dontHaveAnAccount') || "Don't have an account? "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[#556b2f] hover:underline font-medium"
            disabled={isSigningIn}
          >
            {tc('signUp') || 'Sign Up'}
          </button>
        </div>
        
        <Button
          onClick={onClose}
          variant="outline"
          color="gray"
          fullWidth
          disabled={isSigningIn}
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
          minHeight: "400px",
        }
      }}
    />
  );
};

export default SignInModal;

