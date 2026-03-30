import React, { useState, useEffect } from 'react';
import { Button, TextInput, PasswordInput } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { clientForgotPassword, clientResetPassword } from '../../services/clientAPI';

const ForgotPasswordModal = ({ show, onClose, onBackToSignIn, service }) => {
  const { tc } = useBatchTranslation();
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    resetToken: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!show) {
      // Reset form when modal closes
      setStep('request');
      setFormData({
        email: '',
        resetToken: '',
        password: '',
        confirmPassword: ''
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

  const validateRequestForm = () => {
    if (!formData.email.trim()) {
      toast.error(tc('emailRequired') || 'Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(tc('invalidEmailFormat') || 'Invalid email format');
      return false;
    }
    
    return true;
  };

  const validateResetForm = () => {
    if (!formData.resetToken.trim()) {
      toast.error(tc('resetTokenRequired') || 'Reset token is required');
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
    
    return true;
  };

  const handleRequestReset = async () => {
    if (!validateRequestForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
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

      await clientForgotPassword({
        email: formData.email.trim().toLowerCase(),
        businessId: publicBusinessId
      });

      toast.success(tc('resetTokenSent') || 'Password reset token has been sent to your email');
      setStep('reset');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || tc('errorSendingResetToken') || 'Error sending reset token';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
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

      await clientResetPassword({
        email: formData.email.trim().toLowerCase(),
        businessId: publicBusinessId,
        passwordResetToken: formData.resetToken.trim(),
        password: formData.password
      });

      toast.success(tc('passwordResetSuccessfully') || 'Password reset successfully');
      onBackToSignIn();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || tc('errorResettingPassword') || 'Error resetting password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {step === 'request' 
            ? (tc('forgotPassword') || 'Forgot Password')
            : (tc('resetPassword') || 'Reset Password')}
        </h2>
        <p className="text-gray-600 text-sm">
          {step === 'request'
            ? (tc('enterEmailToReceiveResetToken') || 'Enter your email to receive a password reset token')
            : (tc('enterResetTokenAndNewPassword') || 'Enter the reset token sent to your email and your new password')}
        </p>
      </div>

      {step === 'request' ? (
        <div className="space-y-4">
          <TextInput
            label={tc('email') || 'Email'}
            placeholder={tc('enterEmail') || 'Enter your email'}
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={handleRequestReset}
              color="dark"
              fullWidth
              loading={isLoading}
            >
              {isLoading ? (tc('sending') || 'Sending...') : (tc('sendResetToken') || 'Send Reset Token')}
            </Button>
            
            <Button
              onClick={onBackToSignIn}
              variant="outline"
              color="gray"
              fullWidth
              disabled={isLoading}
            >
              {tc('backToSignIn') || 'Back to Sign In'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <TextInput
            label={tc('email') || 'Email'}
            type="email"
            value={formData.email}
            disabled
            className="opacity-60"
          />

          <TextInput
            label={tc('resetToken') || 'Reset Token'}
            placeholder={tc('enterResetToken') || 'Enter the 6-digit token'}
            value={formData.resetToken}
            onChange={(e) => handleInputChange('resetToken', e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            disabled={isLoading}
            maxLength={6}
          />

          <PasswordInput
            label={tc('newPassword') || 'New Password'}
            placeholder={tc('enterNewPassword') || 'Enter new password (min 6 characters)'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={isLoading}
          />

          <PasswordInput
            label={tc('confirmPassword') || 'Confirm Password'}
            placeholder={tc('confirmPassword') || 'Confirm your new password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={handleResetPassword}
              color="dark"
              fullWidth
              loading={isLoading}
            >
              {isLoading ? (tc('resetting') || 'Resetting...') : (tc('resetPassword') || 'Reset Password')}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              {tc('didntReceiveToken') || "Didn't receive the token? "}
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-[#556b2f] hover:underline font-medium"
                disabled={isLoading}
              >
                {tc('resendToken') || 'Resend Token'}
              </button>
            </div>
            
            <Button
              onClick={onBackToSignIn}
              variant="outline"
              color="gray"
              fullWidth
              disabled={isLoading}
            >
              {tc('backToSignIn') || 'Back to Sign In'}
            </Button>
          </div>
        </div>
      )}
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

export default ForgotPasswordModal;

