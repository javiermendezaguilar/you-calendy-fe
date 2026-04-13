import React, { Suspense, lazy, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Home } from "./Home";
import { motion, AnimatePresence } from "framer-motion";
import { getClientByInvitationToken } from '../../services/clientAPI';
import { clearInvitationToken } from '../../utils/invitationUtils';
import { toast } from 'sonner';
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const MotionDiv = motion.div;

const Footer = lazy(() => import("../../components/home/landing/Footer"));
const Gallery = lazy(() => import("./Gallery"));
const LazyClientProfile = lazy(() => import("./ClientProfile"));
const ProfileCompletionModal = lazy(() => import('../../components/client/ProfileCompletionModal'));
const WelcomeBackModal = lazy(() => import('../../components/client/WelcomeBackModal'));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

const Homepage = () => {
  const { tc } = useBatchTranslation();
  const [activeTab] = useOutletContext();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [hasProcessedInvitation, setHasProcessedInvitation] = useState(false);
  


  // Handle invitation token processing on mount
  useEffect(() => {
    const processInvitationToken = async () => {
      // Prevent duplicate processing
      if (hasProcessedInvitation) {
        return;
      }
      
      try {
        // Get invitation token and business ID from localStorage (stored by App.jsx) or URL parameters as fallback
        let invitationToken = localStorage.getItem('client_invitation_token') || localStorage.getItem('invitationToken');
        let businessId = localStorage.getItem('client_business_id') || localStorage.getItem('businessId');
        
        // Fallback to URL parameters if not in localStorage
        if (!invitationToken || !businessId) {
          const urlParams = new URLSearchParams(window.location.search);
          invitationToken = invitationToken || urlParams.get('invitation_token');
          businessId = businessId || urlParams.get('business');
        }
        
        // Check if we have valid data before processing
        if (!invitationToken || !businessId) {
          // No invitation data available, skip processing
          return;
        }
        
        // Check if invitation was already processed in this session
        // BUT only skip if we have the required client data in localStorage
        // This allows reprocessing if localStorage was cleared
        const invitationProcessed = sessionStorage.getItem('invitationProcessed');
        const storedClientId = localStorage.getItem('clientId');
        
        if (invitationProcessed && storedClientId) {
          // Already processed and we have client data, skip
          setHasProcessedInvitation(true);
          return;
        }
        
        // If we have an invitation token but no clientId, we need to process it
        // This handles the case where localStorage was cleared but sessionStorage still has the flag
        if (invitationProcessed && !storedClientId) {
          // Clear the flag to allow reprocessing
          sessionStorage.removeItem('invitationProcessed');
        }
        
        // Fetch client data using invitation token
        const fetchedClientData = await getClientByInvitationToken(invitationToken);
        
        if (fetchedClientData && fetchedClientData.client) {
          const client = fetchedClientData.client;
          const clientId = client._id;
          
          // Store in localStorage (only essential IDs, not tokens)
          localStorage.setItem('clientId', clientId);
          localStorage.setItem('businessId', businessId);
          localStorage.setItem('client_business_id', businessId);
          
          // Store invitation token temporarily (will be cleared after profile completion)
          // Note: This is needed for initial setup but should be removed after profile is complete
          localStorage.setItem('client_invitation_token', invitationToken);
          
          setClientData(client);
          
          // Check if profile is complete
          if (!client.isProfileComplete) {
            // Show profile completion modal
            setShowProfileModal(true);
          } else {
            // Profile is complete - clear invitation token for security
            // No need to keep it after profile is complete
            clearInvitationToken();
            localStorage.removeItem('invitationToken'); // Clear duplicate key too
            
            // Only show welcome modal if not already shown in this session
            // and if this is a returning user (not just completed profile)
            const hasShownWelcome = sessionStorage.getItem('hasShownWelcomeToast');
            const justCompletedProfile = sessionStorage.getItem('justCompletedProfile');
            
            if (!hasShownWelcome && !justCompletedProfile) {
              setShowWelcomeModal(true);
              sessionStorage.setItem('hasShownWelcomeToast', 'true');
            }
            
            // Clear the just completed flag if it exists
            if (justCompletedProfile) {
              sessionStorage.removeItem('justCompletedProfile');
            }
          }
          

          
          // Clean up URL
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } else {
          toast.error(tc('failedToLoadClientInformation'));
        }
        
        // Mark as processed to prevent duplicate calls
        setHasProcessedInvitation(true);
        sessionStorage.setItem('invitationProcessed', 'true');
      } catch (error) {
        console.error('Error processing invitation token on homepage:', error);
        toast.error(tc('failedToProcessInvitation') + ': ' + error.message);
      }
    };

    processInvitationToken();
  }, [hasProcessedInvitation]);

  const handleProfileComplete = (profileData) => {
    
    // Prevent multiple toasts by checking if we already showed the completion toast
    const hasShownCompletionToast = sessionStorage.getItem('hasShownCompletionToast');
    
    if (!hasShownCompletionToast) {
      // Show completion toast only once
      toast.success(tc('welcomeProfileCompletedSuccessfully'));
      sessionStorage.setItem('hasShownCompletionToast', 'true');
      sessionStorage.setItem('justCompletedProfile', 'true');
    }
    
    // Update client data to reflect completed profile
    if (clientData) {
      const updatedClientData = {
        ...clientData,
        ...profileData,
        isProfileComplete: true
      };
      setClientData(updatedClientData);
    }
    
    // Close the modal
    setShowProfileModal(false);
  };

  const handleModalClose = () => {
    // Only show warning if profile is incomplete and modal is actually visible
    // Also check that we haven't just completed the profile to avoid race conditions
    const justCompletedProfile = sessionStorage.getItem('justCompletedProfile');
    
    if (clientData && !clientData.isProfileComplete && showProfileModal && !justCompletedProfile) {
      toast.warning(tc('pleaseCompleteProfileToContinue'));
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {activeTab === "appointments" && (
          <MotionDiv
            key="appointments"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageVariants.transition}
          >
            <div className="w-full">
              <Home />
            </div>
            <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[78%] mx-auto">
              <Suspense fallback={null}>
                <Gallery />
              </Suspense>
            </div>
          </MotionDiv>
        )}

        {activeTab === "profile" && (
          <MotionDiv
            key="profile"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageVariants.transition}
          >
            <Suspense fallback={null}>
              <LazyClientProfile />
            </Suspense>
          </MotionDiv>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      
      {showProfileModal ? (
        <Suspense fallback={null}>
          <ProfileCompletionModal
            show={showProfileModal}
            onClose={handleModalClose}
            onComplete={handleProfileComplete}
          />
        </Suspense>
      ) : null}
      
      {showWelcomeModal ? (
        <Suspense fallback={null}>
          <WelcomeBackModal
            show={showWelcomeModal}
            onClose={() => setShowWelcomeModal(false)}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Homepage;
