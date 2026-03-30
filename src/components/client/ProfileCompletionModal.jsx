import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { toast } from 'sonner';
import { completeClientProfile } from '../../services/clientAPI';
import { getInvitationToken, clearInvitationToken } from '../../utils/invitationUtils';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const ProfileCompletionModal = ({ show, onClose, onComplete }) => {
  const { tc } = useBatchTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = tc('firstNameRequired');
    }

    if (!email) {
      newErrors.email = tc('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = tc('emailInvalid');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if there's an invitation token stored
      const invitationToken = getInvitationToken();

      if (invitationToken) {
        // Complete the client profile using the invitation token
        await completeClientProfile(invitationToken, {
          firstName: firstName,
          lastName: lastName,
          email: email,
          profileImage: profileImage,
          // Note: phone is already associated with the invitation
        });

        // Clear the invitation token after successful completion
        clearInvitationToken();

        // Call onComplete callback if provided (this will show the welcome toast)
        if (onComplete) {
          onComplete({ firstName, lastName, email });
        }

        // Close the modal
        if (onClose) {
          onClose();
        }
      } else {
        toast.error(tc('noInvitationTokenFound'));
      }
    } catch (error) {
      console.error("Error completing client profile:", error);
      toast.error(tc('failedToCompleteProfile') + ": " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex flex-col p-5 md:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              {tc('completeYourProfile')}
            </h2>

            <p className="text-gray-500 max-w-md text-sm md:text-base">
              {tc('completeProfileDescription')}
            </p>
          </div>


          <div className="w-full max-w-md mx-auto">
            {/* Profile Photo Upload Section */}
            <div className="mb-6 flex flex-col items-center">
              <label className="block text-gray-600 text-sm font-medium mb-3 text-center">
                {tc('profilePhotoOptional')}
              </label>
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 overflow-hidden bg-gray-25"
                  onClick={() => document.getElementById('profile-image-upload').click()}
                >
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2">
                      <span className="text-xs text-gray-500 text-center leading-tight">{tc('addPhoto')}</span>
                    </div>
                  )}
                </div>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfileImage(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setProfileImagePreview(e.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={isSubmitting}
                />
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileImage(null);
                      setProfileImagePreview(null);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-md"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                {tc('firstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: '' });
                  }
                }}
                placeholder={tc('enterYourFirstName')}
                className={`w-full py-3 px-4 bg-gray-50 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400`}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                {tc('lastName')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={tc('enterYourLastName')}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                {tc('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                placeholder={tc('enterYourEmailAddress')}
                className={`w-full py-3 px-4 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="!w-full !py-0 !rounded-md !font-medium !bg-[#323334] !text-white hover:!bg-black !transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? tc('completingProfile') : tc('completeProfile')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;