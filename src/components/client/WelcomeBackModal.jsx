import React from 'react';
import { Button } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { useNavigate } from 'react-router-dom';

const WelcomeBackModal = ({ show, onClose }) => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();

  if (!show) return null;

  const handleContinue = () => {
    // Navigate to profile tab
    navigate('/client/profile');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex flex-col p-8 text-center">
          <h2 className="text-3xl font-bold text-[#323334] mb-6">
            Welcome Back!
          </h2>
          
          <p className="text-gray-700 mb-8 leading-relaxed text-base">
            Thanks for coming back! Congratulations, you now have a profile that gives you access to new features. You'll find it right at the top under the tab called 'My Profile'.
          </p>
          
          <Button
            onClick={handleContinue}
            className="!w-full !py-3 !rounded-lg !font-medium !bg-[#323334] !text-white hover:!bg-[#212121] !transition-colors"
            size="md"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;

