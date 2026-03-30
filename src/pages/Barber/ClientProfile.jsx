import React, { useState, useRef, useEffect } from 'react'
import { Button, Switch, Textarea, Skeleton, Popover, ActionIcon } from '@mantine/core'
import CommonModal from '../../components/common/CommonModal'
import { UploadImageIcon, UploadPhotoIcon, UploadSvgIcon, StartIcon } from '../../components/common/Svgs'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { User, Info, Trash2 } from 'lucide-react'
import { useBatchTranslation } from '../../contexts/BatchTranslationContext'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useParams } from 'react-router-dom'
import {
  useClientProfile,
  useClientGallery,
  useUploadHaircutImage,
  useAddSuggestion,
  useReportImage,
  useNotificationPreferences,
  useToggleNotifications,
  useDeleteClientProfile,
  useDeleteClientGalleryImage,
  useUpdateClientProfile
} from '../../hooks/useClientProfile'
import { getClientByInvitationToken } from '../../services/clientAPI'
import haircut1 from '../../assets/haircut1.png'
import bg from '../../assets/backbg.png'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const ClientProfile = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { linkToken } = useParams();
  // State for client authentication
  const [clientId, setClientId] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize client data from localStorage
  // On barber side, we use publicBusinessId and publicBarberData
  useEffect(() => {
    const initializeClient = async () => {
      try {
        // Get client data from localStorage
        const storedClientId = localStorage.getItem('clientId');
        
        // Check for businessId from multiple sources (barber side uses publicBusinessId)
        let storedBusinessId = localStorage.getItem('businessId') || 
                               localStorage.getItem('client_business_id') ||
                               localStorage.getItem('publicBusinessId');
        
        // Fallback: try to get businessId from publicBarberData
        if (!storedBusinessId) {
          const publicBarberData = localStorage.getItem('publicBarberData');
          if (publicBarberData) {
            try {
              const barberData = JSON.parse(publicBarberData);
              storedBusinessId = barberData?.business?._id || barberData?.businessId;
            } catch (e) {
              // Silently handle parse error
            }
          }
        }
        
        const storedInvitationToken = localStorage.getItem('invitationToken') || localStorage.getItem('client_invitation_token');
        
        if (storedClientId && storedBusinessId) {
          // Use stored client data
          setClientId(storedClientId);
          setBusinessId(storedBusinessId);
          setIsInitialized(true);

        } else if (storedInvitationToken && storedBusinessId) {
          // Try to get client data using invitation token

          try {
            const clientData = await getClientByInvitationToken(storedInvitationToken);
            
            if (clientData && clientData.client) {
              const clientId = clientData.client._id;
              
              // Store the client ID for future use
              localStorage.setItem('clientId', clientId);
              
              setClientId(clientId);
              setBusinessId(storedBusinessId);
              setIsInitialized(true);

            } else {
              setIsInitialized(true); // Still initialize to show error state
            }
          } catch (error) {
            setIsInitialized(true); // Still initialize to show error state
          }
        } else {
          setIsInitialized(true); // Still initialize to show error state
        }
      } catch (error) {
        setIsInitialized(true); // Still initialize to show error state
      }
    };

    initializeClient();
  }, []);

  // Listen for appointment booking events to refresh client data
  useEffect(() => {
    const handleAppointmentBooked = (event) => {
      console.log('Appointment booked, refreshing client profile:', event.detail);
      const storedClientId = localStorage.getItem('clientId');
      if (storedClientId) {
        // Invalidate and refetch client profile queries
        queryClient.invalidateQueries(['client-profile', storedClientId]);
        queryClient.invalidateQueries(['client-gallery', storedClientId]);
        queryClient.invalidateQueries(['client-notifications', storedClientId]);
        // Refetch the queries
        queryClient.refetchQueries(['client-profile', storedClientId]);
      }
    };

    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
    };
  }, [queryClient]);
  
  // API hooks - only initialize after clientId is available and component is initialized
  const { data: clientProfile, isLoading: profileLoading, error: profileError } = useClientProfile(isInitialized ? clientId : null);
  const { data: galleryData, isLoading: galleryLoading } = useClientGallery(isInitialized ? clientId : null);
  const { data: notificationPrefs, isLoading: notificationLoading } = useNotificationPreferences(isInitialized ? clientId : null);
  
  // Check if client is logged in
  const isLoggedIn = !!(clientId && businessId);

  
  // Mutations
  const uploadImageMutation = useUploadHaircutImage(clientId);
  const addSuggestionMutation = useAddSuggestion();
  const reportImageMutation = useReportImage();
  const toggleNotificationsMutation = useToggleNotifications();
  const deleteProfileMutation = useDeleteClientProfile();
  const deleteGalleryImageMutation = useDeleteClientGalleryImage(clientId);
  const updateProfileMutation = useUpdateClientProfile(clientId);

  // State management
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showAddSuggestionModal, setShowAddSuggestionModal] = useState(false);
  const [showViewSuggestionModal, setShowViewSuggestionModal] = useState(false);
  const [showViewReportModal, setShowViewReportModal] = useState(false);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const profileImageInputRef = useRef(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [reportIssueFile, setReportIssueFile] = useState(null);
  const [suggestionFile, setSuggestionFile] = useState(null);
  const [reportNote, setReportNote] = useState('');
  const [suggestionNote, setSuggestionNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const reportFileInputRef = useRef(null);
  const suggestionFileInputRef = useRef(null);

  // Event handlers
  const handleAddProfilePhoto = () => {
    if (profileImageInputRef.current) {
      profileImageInputRef.current.click();
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      updateProfileMutation.mutate(formData, {
        onSuccess: () => {
          // Reset input
          if (profileImageInputRef.current) {
            profileImageInputRef.current.value = '';
          }
        }
      });
    }
  };

  const handleRemovePhoto = () => {
    if (!isLoggedIn) {
      toast.error('User not found');
      return;
    }
    setShowRemovePhotoModal(true);
  };

  const confirmRemovePhoto = () => {
    if (!isLoggedIn) {
      toast.error('User not found');
      setShowRemovePhotoModal(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('removeProfileImage', 'true');
    
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setShowRemovePhotoModal(false);
      }
    });
  };

  const handleRemoveAccount = () => {
    if (!isLoggedIn) {
      toast.error('User not found');
      return;
    }
    setShowRemoveAccountModal(true);
  };

  const confirmRemoveAccount = () => {
    if (!isLoggedIn) {
      toast.error('User not found');
      setShowRemoveAccountModal(false);
      return;
    }
    deleteProfileMutation.mutate(undefined, {
      onSuccess: () => {
        setShowRemoveAccountModal(false);
        
        // Get the current barber profile link from the URL params
        // The URL format is: /barber/profile/:linkToken
        const barberProfileLink = linkToken 
          ? `/barber/profile/${linkToken}`
          : '/barber/profile';
        
        // Small delay to ensure all cleanup is complete before redirect
        setTimeout(() => {
          // Redirect to the same barber profile link (not home page)
          window.location.href = barberProfileLink;
        }, 500);
      }
    });
  };

  const handleNotificationToggle = () => {
    const newState = !notificationPrefs?.enabled;
    toggleNotificationsMutation.mutate(newState, {
      onSuccess: () => {
        // The hook will handle cache updates
      },
      onError: (error) => {
        // Error handling for notification toggle
      }
    });
  };

  const handleUploadPhoto = () => {
    setShowUploadModal(true);
  };

  const handleSaveToGallery = () => {
    if (!uploadedFile) {
      toast.error(tc('pleaseSelectFileFirst'));
      return;
    }

    const formData = new FormData();
    formData.append('image', uploadedFile);
    formData.append('title', 'New Haircut Photo'); // Add title to form data
    
    uploadImageMutation.mutate(formData, {
      onSuccess: () => {
        setShowUploadModal(false);
        setUploadedFile(null);
      },
      onError: (error) => {
        // Error toast is already handled in the hook
      }
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleReportIssue = (galleryItem) => {
    setSelectedGalleryItem(galleryItem);
    setReportIssueFile(null);
    setReportNote('');
    setFeedbackRating(0);
    setShowReportIssueModal(true);
  };

  const handleAddSuggestion = (galleryItem) => {
    setSelectedGalleryItem(galleryItem);
    setSuggestionFile(null);
    setSuggestionNote('');
    setShowAddSuggestionModal(true);
  };

  const handleViewSuggestion = (galleryItem) => {
    if (!galleryItem?.suggestions?.length) return;
    // Pick the most recent suggestion
    const latest = [...galleryItem.suggestions].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).pop();
    setSelectedGalleryItem(galleryItem);
    setSelectedSuggestion(latest);
    setShowViewSuggestionModal(true);
  };

  const handleViewReport = (galleryItem) => {
    if (!galleryItem?.reports?.length) return;
    const latest = [...galleryItem.reports].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).pop();
    setSelectedGalleryItem(galleryItem);
    setSelectedReport(latest);
    setShowViewReportModal(true);
  };

  const handleSubmitReportIssue = () => {
    if (!selectedGalleryItem || !reportNote.trim()) {
      toast.error(tc('pleaseAddNoteForReport'));
      return;
    }

    const formData = new FormData();
    formData.append('note', reportNote);
    formData.append('clientId', clientId);
    formData.append('reportType', 'quality_issue');
    
    if (feedbackRating > 0) {
      formData.append('rating', feedbackRating);
    }
    
    if (reportIssueFile) {
      formData.append('image', reportIssueFile);
    }

    reportImageMutation.mutate({
      galleryId: selectedGalleryItem._id,
      formData
    }, {
      onSuccess: () => {
        setShowReportIssueModal(false);
        setReportIssueFile(null);
        setReportNote('');
        setFeedbackRating(0);
      }
    });
  };

  const handleSubmitAddSuggestion = () => {
    if (!selectedGalleryItem || !suggestionNote.trim()) {
      toast.error(tc('pleaseAddNoteForSuggestion'));
      return;
    }

    const formData = new FormData();
    formData.append('note', suggestionNote);
    formData.append('clientId', clientId);
    
    if (suggestionFile) {
      formData.append('image', suggestionFile);
    }

    addSuggestionMutation.mutate({
      galleryId: selectedGalleryItem._id,
      formData
    }, {
      onSuccess: () => {
        setShowAddSuggestionModal(false);
        setSuggestionFile(null);
        setSuggestionNote('');
      }
    });
  };

  const handleReportFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReportIssueFile(file);
    }
  };

  const handleSuggestionFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSuggestionFile(file);
    }
  };

  const handleDeletePhoto = (galleryItem) => {
    setPhotoToDelete(galleryItem);
    setShowDeletePhotoModal(true);
  };

  const confirmDeletePhoto = () => {
    if (!photoToDelete || !isLoggedIn) {
      setShowDeletePhotoModal(false);
      setPhotoToDelete(null);
      return;
    }

    deleteGalleryImageMutation.mutate(photoToDelete._id, {
      onSuccess: () => {
        setShowDeletePhotoModal(false);
        setPhotoToDelete(null);
      },
      onError: () => {
        // Error toast is already handled in the hook
      }
    });
  };

  // Early return for initialization
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen pt-20">
        <div className="text-lg">{tc('initializingClientProfile')}</div>
      </div>
    );
  }

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen p-8" style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton height={40} width="60%" mb="md" />
            <Skeleton height={20} width="40%" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton height={80} width={80} radius="xl" />
                  <div className="flex-1">
                    <Skeleton height={24} width="70%" mb="sm" />
                    <Skeleton height={16} width="50%" />
                  </div>
                </div>
                <Skeleton height={40} width="40%" />
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton height={24} width="50%" mb="lg" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={20} width={40} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton height={20} width="55%" />
                    <Skeleton height={20} width={40} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton height={24} width="40%" />
                  <Skeleton height={36} width={120} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height={200} radius="md" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - only show if there's an actual error and we have a clientId
  if (profileError && clientId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error loading profile: {profileError.message}</div>
      </div>
    );
  }

  const uploadModalContent = (
    <div className="p-4 flex flex-col items-start">
      <h2 className="text-2xl font-bold text-[#323334] mb-2">{tc('uploadPhoto')}</h2>
      <p className="text-start text-sm text-[#939799] mb-12">
        {tc('profileVisibleToBarberMessage')}
      </p>

      <div
        className="w-full border-2 border-dashed border-[#93B45A] rounded-lg p-6 mb-12 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => document.getElementById('file-upload').click()}
      >
        <div className="w-16 h-16 rounded-lg bg-[#f1f5e9] flex items-center justify-center mb-4">
          <UploadPhotoIcon />
        </div>
        <p className="mb-1 text-center text-sm">
          <span className="text-[#93B45A] font-medium text-sm">{tc('dragAndDrop')}</span> {tc('clickTo')}
          <br />
          {tc('upload')} <span className="text-gray-500 text-sm">{tc('or')}</span>
        </p>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {uploadedFile && (
        <div className="text-sm text-[#556B2F] mb-4 flex items-center">
          <span className="mr-2">✓</span>
          {uploadedFile.name}
        </div>
      )}

      <Button
        onClick={handleSaveToGallery}
        fullWidth
        color="dark"
        radius="md"
        fz="sm"
        fw={500}
        loading={uploadImageMutation.isLoading}
        disabled={!uploadedFile}
      >
        {tc('saveToGallery')}
      </Button>
    </div>
  );

  const removePhotoModalContent = (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#323334] mb-2">{tc('areYouSure')}</h2>
      <p className="text-center text-sm text-[#939799] mb-8">
        {tc('removePhotoConfirmation')}
      </p>

      <div className="flex gap-3 w-full">
        <Button
          onClick={() => setShowRemovePhotoModal(false)}
          fullWidth
          variant="outline"
          color="gray"
          radius="md"
          fz="sm"
          fw={500}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={confirmRemovePhoto}
          fullWidth
          color="dark"
          radius="md"
          fz="sm"
          fw={500}
          loading={updateProfileMutation.isLoading}
          className="bg-[#323334]"
        >
          {tc('removePhoto')}
        </Button>
      </div>
    </div>
  );

  const removeAccountModalContent = (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#323334] mb-2">{tc('areYouSure')}</h2>
      <p className="text-center text-sm text-[#939799] mb-8">
        {tc('deleteProfileWarning')}
      </p>

      <div className="flex gap-3 w-full">
        <Button
          onClick={() => setShowRemoveAccountModal(false)}
          fullWidth
          variant="outline"
          color="gray"
          radius="md"
          fz="sm"
          fw={500}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={confirmRemoveAccount}
          fullWidth
          color="red"
          radius="md"
          fz="sm"
          fw={500}
          loading={deleteProfileMutation.isLoading}
          className="bg-red-500 hover:bg-red-600"
        >
          {tc('removeAccount')}
        </Button>
      </div>
    </div>
  );

  const deletePhotoModalContent = (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#323334] mb-2">{tc('areYouSure')}</h2>
      <p className="text-center text-sm text-[#939799] mb-8">
        {tc('deletePhotoConfirmation')}
      </p>

      <div className="flex gap-3 w-full">
        <Button
          onClick={() => {
            setShowDeletePhotoModal(false);
            setPhotoToDelete(null);
          }}
          fullWidth
          variant="outline"
          color="gray"
          radius="md"
          fz="sm"
          fw={500}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={confirmDeletePhoto}
          fullWidth
          color="red"
          radius="md"
          fz="sm"
          fw={500}
          loading={deleteGalleryImageMutation.isLoading}
          className="bg-red-500 hover:bg-red-600"
        >
          {tc('deletePhoto')}
        </Button>
      </div>
    </div>
  );

  const reportIssueModalContent = (
    <div className="p-4 flex flex-col items-start">
      <h2 className="text-2xl font-bold text-[#323334] mb-1">{tc('reportIssue')}</h2>
      <p className="text-start text-sm text-[#939799] mb-6">
        {tc('reportProblemWithHaircut')}
      </p>

      <label htmlFor="report-note" className="text-sm font-medium text-[#323334] mb-1">{tc('addNoteHere')}</label>
      <div className="relative w-full mb-4">
        <Textarea
          id="report-note"
          value={reportNote}
          onChange={(event) => setReportNote(event.currentTarget.value)}
          placeholder={tc('writeConsiderationsOrReportIssue')}
          minRows={5}
          styles={{
            input: {
              minHeight: '130px',
              height: '130px',
              maxHeight: '130px',
              backgroundColor: '#F8F8F8',
              paddingBottom: '50px',
              overflow: 'auto',
              border: '1px solid #E8EDF3',
              borderRadius: '0.375rem',
              '&:focus': {
                borderColor: '#93B45A'
              }
            }
          }}
          className="w-full"
        />
        <div className="absolute bottom-3 left-3 z-10">
          <input 
            type="file"
            ref={reportFileInputRef}
            onChange={handleReportFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <Button
            variant="filled"
            color="dark"
            radius="md"
            fz="xs"
            fw={500}
            leftSection={<UploadImageIcon />}
            className="!bg-[#323334] !text-white"
            styles={{ root: { '&:hover': { backgroundColor: '#4A4A4A' } } }}
            onClick={() => reportFileInputRef.current.click()}
          >
            {tc('uploadImage')}
          </Button>
        </div>
      </div>

      {reportIssueFile && (
        <div className="text-sm text-[#556B2F] mb-4 flex items-center">
          <span className="mr-2">✓</span>
          {reportIssueFile.name}
        </div>
      )}

      <p className="text-sm font-medium text-[#323334] mb-2">{tc('givePersonalFeedback')}</p>
      <div className="flex items-center gap-2 mb-8 p-0">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onClick={() => setFeedbackRating(starValue)}
            className="focus:outline-none cursor-pointer bg-transparent border-none p-0"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-8 h-8 ${starValue <= feedbackRating ? "fill-[#556B2F]" : "fill-[#D9D9D9]"}`}
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke={starValue <= feedbackRating ? "#556B2F" : "#D9D9D9"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 w-full mt-20">
        <Button
          onClick={() => setShowReportIssueModal(false)}
          variant="filled"
          color="gray"
          radius="md"
          fz="sm"
          fw={500}
          className="border-[#D0D5DD] text-[#344054]"
          styles={{ root: { '&:hover': { backgroundColor: '#f9fafb' } } }}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={handleSubmitReportIssue}
          color="dark"
          radius="md"
          fz="sm"
          fw={500}
          loading={reportImageMutation.isLoading}
          className="bg-[#323334]"
        >
          {tc('submit')}
        </Button>
      </div>
    </div>
  );

  const addSuggestionModalContent = (
    <div className="p-4 flex flex-col items-start">
      <h2 className="text-2xl font-bold text-[#323334] mb-1">{tc('addSuggestion')}</h2>
      <p className="text-start text-sm text-[#939799] mb-6">
        {tc('addSuggestionForHaircut')}
      </p>

      <label htmlFor="suggestion-note" className="text-sm font-medium text-[#323334] mb-1">{tc('addNoteHere')}</label>
      <div className="relative w-full mb-10">
        <Textarea
          id="suggestion-note"
          value={suggestionNote}
          onChange={(event) => setSuggestionNote(event.currentTarget.value)}
          placeholder={tc('writeConsiderationsOrReportIssue')}
          minRows={5}
          styles={{
            input: {
              minHeight: '130px',
              height: '130px',
              maxHeight: '130px',
              backgroundColor: '#F8F8F8',
              paddingBottom: '50px',
              overflow: 'auto',
              border: '1px solid #E8EDF3',
              borderRadius: '0.375rem',
              '&:focus': {
                borderColor: '#93B45A'
              }
            }
          }}
          className="w-full"
        />
        <div className="absolute bottom-3 left-3 z-10">
          <input 
            type="file"
            ref={suggestionFileInputRef}
            onChange={handleSuggestionFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <Button
            variant="filled"
            color="dark"
            radius="md"
            fz="xs"
            fw={500}
            leftSection={<UploadImageIcon />}
            className="!bg-[#323334] !text-white"
            styles={{ root: { '&:hover': { backgroundColor: '#4A4A4A' } } }}
            onClick={() => suggestionFileInputRef.current.click()}
          >
            {tc('uploadImage')}
          </Button>
        </div>
      </div>

      {suggestionFile && (
        <div className="text-sm text-[#556B2F] mb-4 flex items-center">
          <span className="mr-2">✓</span>
          {suggestionFile.name}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 w-full mt-20">
        <Button
          onClick={() => setShowAddSuggestionModal(false)}
          variant="filled"
          color="gray"
          radius="md"
          fz="sm"
          fw={500}
          className="border-[#D0D5DD] text-[#344054]"
          styles={{ root: { '&:hover': { backgroundColor: '#f9fafb' } } }}
        >
          {tc('cancel')}
        </Button>
        <Button
          onClick={handleSubmitAddSuggestion}
          color="dark"
          radius="md"
          fz="sm"
          fw={500}
          loading={addSuggestionMutation.isLoading}
          className="bg-[#323334]"
        >
          {tc('submit')}
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div 
      className="overflow-x-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <main className="max-w-full mx-4 sm:mx-8 lg:mx-20 mt-8 md:mt-16 min-h-screen p-4 md:p-8">
        <div className="flex flex-col gap-8 w-full lg:w-[50%]">
          <motion.header 
            className="flex flex-col gap-1 sm:items-start items-center"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <h1 className="font-medium text-xl md:text-2xl text-[#323334]">
                {tc('myProfile')}
              </h1>
              <Popover 
                width={350} 
                position="bottom-start" 
                shadow="md" 
                withArrow
                styles={{
                  dropdown: {
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#F8F9FA',
                    border: '1px solid #E8EDF3'
                  }
                }}
              >
                <Popover.Target>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="xl"
                    className="!bg-[#93B45A]/10 !hover:bg-[#93B45A]/20 !transition-all"
                    styles={{
                      root: {
                        color: '#93B45A',
                        '&:hover': {
                          backgroundColor: '#93B45A',
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <Info size={18} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#93B45A]/10 flex items-center justify-center">
                      <Info size={18} className="text-[#93B45A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {tc('profileTutorialMessage')}
                      </p>
                    </div>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
            <p className="font-normal text-sm md:text-md text-[#939799]">
              {tc('viewAndManageProfile')}
            </p>
          </motion.header>

          <motion.div 
            className="w-full bg-[#F8F8F8] border border-[#E8EDF3] rounded-lg overflow-hidden mb-0"
            variants={itemVariants}
          >
            <div className="w-full bg-white p-4 border-b border-[#E8EDF3]">
              <h2 className="font-bold text-xl md:text-xl text-[#445163]">
                {profileLoading ? (
                  <Skeleton height={24} width="60%" />
                ) : (
                  `${clientProfile?.firstName || ''} ${clientProfile?.lastName || ''}`
                )}
              </h2>
              <p className="font-normal text-sm text-[#6A7A8F]">
                {profileLoading ? (
                  <Skeleton height={16} width="50%" />
                ) : (
                  clientProfile?.email || ''
                )}
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-3 border-[#93B45A] p-0 flex items-center justify-center bg-[#B68D7C] overflow-hidden">
                  {clientProfile?.profileImage ? (
                    <img
                      src={clientProfile.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-lg font-medium">${clientProfile?.firstName?.[0] || 'U'}${clientProfile?.lastName?.[0] || ''}</div>`;
                      }}
                    />
                  ) : profileLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-medium">
                      ...
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} color="white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddProfilePhoto}
                  loading={updateProfileMutation.isLoading}
                  color="#93B45A"
                  radius={10}
                  h={40}
                  fz="sm"
                  fw="normal"
                  variant="filled"
                  styles={{
                    root: {
                      border: '1px solid #4B6C8F',
                      '&:hover': {
                        backgroundColor: '#7d9a4b',
                      },
                      color: '#1B1D21'
                    }
                  }}
                >
                  {tc('addPhoto')}
                </Button>
                {clientProfile?.profileImage && (
                  <Button
                    onClick={handleRemovePhoto}
                    loading={updateProfileMutation.isLoading}
                    color="gray"
                    radius={10}
                    h={40}
                    fz="sm"
                    fw="normal"
                    variant="outline"
                    styles={{
                      root: {
                        border: '1px solid #D0D5DD',
                        '&:hover': {
                          backgroundColor: '#f9fafb',
                        },
                        color: '#344054'
                      }
                    }}
                  >
                    {tc('removePhoto')}
                  </Button>
                )}
              </div>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfileImageChange}
              />
            </div>
          </motion.div>

          {/* Remove Account Section */}
          <motion.div 
            className="w-full -mt-5"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600">
              {tc('doYouWantToRemoveAccount')}{' '}
              <button
                onClick={handleRemoveAccount}
                disabled={deleteProfileMutation.isLoading}
                className="text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {tc('removeAccount')}
              </button>
            </p>
          </motion.div>

        </div>

        {/* Haircut Gallery - Only show when logged in */}
        {isLoggedIn && (
          <motion.div className='mt-8 md:mt-10' variants={itemVariants}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold">{tc('haircutGallery')}</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleUploadPhoto}
                color="dark"
                radius="md"
                size="sm"
                loading={uploadImageMutation.isLoading}
                leftSection={
                  <UploadSvgIcon />
                }
                styles={{
                  root: {
                    backgroundColor: '#231F20',
                    '&:hover': {
                      backgroundColor: '#3c3a3b',
                    }
                  }
                }}
              >
                {tc('uploadPhoto')}
              </Button>
            </div>
          </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {galleryLoading ? (
                <div className="col-span-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-lg p-5">
                        <Skeleton height={200} width="100%" mb="md" radius="md" />
                        <div className="flex gap-2">
                          <Skeleton height={32} width="48%" />
                          <Skeleton height={32} width="48%" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : galleryData?.gallery?.length > 0 ? (
        galleryData.gallery.map((item, idx) => {
                  return (
                    <div
                      key={item._id || idx}
                      className="bg-white rounded-xl shadow-lg flex flex-col items-center p-5 w-full lg:w-[25rem]"
                    >
                      <div className="relative w-full mb-8">
                        <img
                          src={item.imageUrl || haircut1}
                          alt={item.title || `Haircut ${idx+1}`}
                          className="rounded-lg w-full h-[23rem] object-cover"
                          onError={(e) => {
                            e.target.src = haircut1;
                          }}
                        />
                        <button
                          onClick={() => handleDeletePhoto(item)}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 hover:bg-red-500 text-gray-700 hover:text-white flex items-center justify-center transition-all shadow-lg border border-gray-200 hover:border-red-500 z-10"
                          title={tc('deletePhoto')}
                        >
                          <Trash2 size={18} className="transition-colors" />
                        </button>
                      </div>
                      <div className="flex w-full gap-2">
                        <Button
                          fullWidth
                          className="bg-[#93B45A] text-white py-2 rounded-md font-medium hover:bg-[#7d9a4b] transition"
                          styles={{ root: { backgroundColor: '#93B45A', color: 'white', borderRadius: '0.375rem', fontWeight: 500, paddingTop: '0.5rem', paddingBottom: '0.5rem', '&:hover': { backgroundColor: '#7d9a4b' } } }}
                          onClick={() => (item?.suggestions?.length ? handleViewSuggestion(item) : handleAddSuggestion(item))}
                          loading={addSuggestionMutation.isLoading}
                        >
                          {item?.suggestions?.length ? tc('viewSuggestion') : tc('addSuggestion')}
                        </Button>
                        <Button
                          fullWidth
                          className="bg-[#232323] text-white py-2 rounded-md font-medium hover:bg-[#111] transition"
                          styles={{ root: { backgroundColor: '#232323', color: 'white', borderRadius: '0.375rem', fontWeight: 500, paddingTop: '0.5rem', paddingBottom: '0.5rem', '&:hover': { backgroundColor: '#111' } } }}
                          onClick={() => (item?.reports?.length ? handleViewReport(item) : handleReportIssue(item))}
                          loading={reportImageMutation.isLoading}
                        >
                          {item?.reports?.length ? tc('viewReport') : tc('reportIssue')}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-500">
                    {tc('noPhotosInGalleryYet')}
                    {galleryData && (
                      <div className="mt-2 text-xs">

                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
        </motion.div>
        )}
      </main>



      <CommonModal
        opened={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        content={uploadModalContent}
        size="md"
        styles={{
          body: { 
            minHeight: "500px"
          },
          content: {
            maxHeight: "90vh"
          }
        }}
      />

      <CommonModal
        opened={showRemovePhotoModal}
        onClose={() => setShowRemovePhotoModal(false)}
        content={removePhotoModalContent}
        size="md"
        styles={{
          body: { 
            minHeight: "200px"
          }
        }}
      />

      <CommonModal
        opened={showRemoveAccountModal}
        onClose={() => setShowRemoveAccountModal(false)}
        content={removeAccountModalContent}
        size="md"
        styles={{
          body: { 
            minHeight: "200px"
          }
        }}
      />

      <CommonModal
        opened={showReportIssueModal}
        onClose={() => {
          setShowReportIssueModal(false);
          setReportIssueFile(null);
        }}
        content={reportIssueModalContent}
        size="lg"
        styles={{
          body: { 
            minHeight: "570px"
          },
          content: {
            maxHeight: "90vh"
          }
        }}
      />

      <CommonModal
        opened={showAddSuggestionModal}
        onClose={() => {
          setShowAddSuggestionModal(false);
          setSuggestionFile(null);
        }}
        content={addSuggestionModalContent}
        size="lg"
        styles={{
          body: { 
            minHeight: "500px"
          },
          content: {
            maxHeight: "90vh"
          }
        }}
      />

      {/* View Suggestion Modal */}
      <CommonModal
        opened={showViewSuggestionModal}
        onClose={() => {
          setShowViewSuggestionModal(false);
          setSelectedSuggestion(null);
        }}
        size="lg"
        content={(
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{tc('suggestion')}</h3>
            {selectedSuggestion ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {selectedSuggestion.note}
                </div>
                {selectedSuggestion.imageUrl && (
                  <img src={selectedSuggestion.imageUrl} alt="Suggestion" className="w-32 h-32 object-cover rounded" />
                )}
                {selectedSuggestion.createdAt && (
                  <div className="text-xs text-gray-500">{new Date(selectedSuggestion.createdAt).toLocaleString()}</div>
                )}
                {selectedSuggestion.response && (
                  <div className="bg-[#EAF2D7] border border-[#dbe7be] p-3 rounded text-sm">
                    <div className="text-xs text-gray-600 mb-1">{tc('barberResponse')}</div>
                    <div>{selectedSuggestion.response}</div>
                    {selectedSuggestion.respondedAt && (
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(selectedSuggestion.respondedAt).toLocaleString()}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No suggestion data</div>
            )}
          </div>
        )}
      />

      {/* View Report Modal */}
      <CommonModal
        opened={showViewReportModal}
        onClose={() => {
          setShowViewReportModal(false);
          setSelectedReport(null);
        }}
        size="lg"
        content={(
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{tc('report')}</h3>
            {selectedReport ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {selectedReport.note}
                </div>
                {selectedReport.imageUrl && (
                  <img src={selectedReport.imageUrl} alt="Report" className="w-32 h-32 object-cover rounded" />
                )}
                {typeof selectedReport.rating === 'number' && (
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <StartIcon key={i} size={16} fill={i < selectedReport.rating ? '#FBBF24' : '#E5E7EB'} stroke={i < selectedReport.rating ? '#F59E0B' : '#D1D5DB'} />
                    ))}
                    <span className="text-xs text-gray-600">({selectedReport.rating}/5)</span>
                  </div>
                )}
                {selectedReport.status && (
                  <div className="text-xs"><span className="text-gray-500">Status:</span> {selectedReport.status}</div>
                )}
                {selectedReport.reviewNote && (
                  <div className="bg-[#EAF2D7] border border-[#dbe7be] p-3 rounded text-sm">
                    <div className="text-xs text-gray-600 mb-1">{tc('barberReview')}</div>
                    <div>{selectedReport.reviewNote}</div>
                    {selectedReport.reviewedAt && (
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(selectedReport.reviewedAt).toLocaleString()}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No report data</div>
            )}
          </div>
        )}
      />

      {/* Delete Photo Confirmation Modal */}
      <CommonModal
        opened={showDeletePhotoModal}
        onClose={() => {
          setShowDeletePhotoModal(false);
          setPhotoToDelete(null);
        }}
        content={deletePhotoModalContent}
        size="md"
        styles={{
          body: { 
            minHeight: "200px"
          }
        }}
      />
    </motion.div>
  )
}

export default ClientProfile