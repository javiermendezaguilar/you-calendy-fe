import React, { Suspense, lazy, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@mantine/core';
import { toast } from 'sonner';
import { BatchTranslationContext } from '../../contexts/BatchTranslationContext';
import { getBarberProfileByLink } from '../../services/businessPublicAPI';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import LanguageSelectionModal from '../../components/barber/LanguageSelectionModal';
import Home from './Home';
import Gallery from './Gallery';
import Header from './Header';
import ClientProfile from './ClientProfile';
import Footer from '../../components/home/landing/Footer';

const SignInModal = lazy(() => import('./SignInModal'));
const SignUpModal = lazy(() => import('./SignUpModal'));
const ForgotPasswordModal = lazy(() => import('./ForgotPasswordModal'));
const MotionDiv = motion.div;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const PublicBarberProfile = () => {
  const { linkToken } = useParams();
  const [activeTab, setActiveTab] = useState("appointments");
  
  // Safe context usage
  const context = useContext(BatchTranslationContext);
  
  // Fallback tc function if context is not available
  const tc = context?.tc || ((key) => key);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show language selection modal on initial load, but avoid showing on page refresh
  useEffect(() => {
    const navigationEntry = window?.performance?.getEntriesByType?.('navigation')?.[0];
    const isReload = navigationEntry?.type === 'reload';
    const hasShownThisSession = sessionStorage.getItem('youCalendy_languageModalShown') === 'true';

    if (isReload || hasShownThisSession) return;

    // Small delay to ensure the modal renders properly
    const timer = setTimeout(() => {
      setShowLanguageModal(true);
      sessionStorage.setItem('youCalendy_languageModalShown', 'true');
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Listen for sign in modal trigger from Header
  useEffect(() => {
    const handleOpenSignInModal = () => {
      setShowSignInModal(true);
      document.body.style.overflow = "hidden";
    };

    window.addEventListener('openSignInModal', handleOpenSignInModal);
    return () => {
      window.removeEventListener('openSignInModal', handleOpenSignInModal);
    };
  }, []);

  // Modal handlers
  const handleSignInSuccess = (clientInfo) => {
    void clientInfo;
    setShowSignInModal(false);
    document.body.style.overflow = "auto";
    // Navigate to profile after successful sign in
    handleTabChange("profile");
  };

  const handleSignUpSuccess = (clientInfo) => {
    void clientInfo;
    setShowSignUpModal(false);
    document.body.style.overflow = "auto";
    // Navigate to profile after successful sign up
    handleTabChange("profile");
  };

  const handleSwitchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
    setShowForgotPasswordModal(false);
    setShowSignInModal(true);
  };

  const handleSwitchToForgotPassword = () => {
    setShowSignInModal(false);
    setShowForgotPasswordModal(true);
  };

  const closeSignInModal = () => {
    setShowSignInModal(false);
    document.body.style.overflow = "auto";
  };

  const closeSignUpModal = () => {
    setShowSignUpModal(false);
    document.body.style.overflow = "auto";
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    // Ensure scrolling is enabled
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    const fetchBarberProfile = async () => {
      try {
        setLoading(true);
        
        if (!linkToken) {
          throw new Error('Invalid barber link');
        }

        // Fetch barber profile data using the link token
        const profileData = await getBarberProfileByLink(linkToken);
        
        if (profileData && profileData.business) {
          // Store business data in localStorage for the Home component to use
          localStorage.setItem('publicBusinessId', profileData.business._id);
          localStorage.setItem('publicBarberData', JSON.stringify(profileData));
        } else {
          throw new Error('Failed to load barber profile');
        }
        
      } catch (err) {
        setError(err.message);
        toast.error(tc('failedToLoadBarberProfile') + ': ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberProfile();
    
    // Cleanup function to restore original overflow settings
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [linkToken]);


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton height={60} width="60%" mb="md" />
            <Skeleton height={24} width="40%" mb="xl" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <Skeleton height={400} radius="lg" />
            </div>
            <div className="space-y-6">
              <Skeleton height={32} width="80%" />
              <Skeleton height={20} width="100%" />
              <Skeleton height={20} width="90%" />
              <Skeleton height={20} width="95%" />
              <Skeleton height={48} width="60%" mt="lg" />
            </div>
          </div>
          
          <div className="mb-8">
            <Skeleton height={40} width="30%" mb="md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton height={24} width="70%" mb="sm" />
                  <Skeleton height={20} width="50%" mb="sm" />
                  <Skeleton height={16} width="40%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{tc('unableToLoadBarberProfile')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {tc('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <BatchTranslationLoader>
      {/* Language Selection Modal - shows on first visit */}
      <LanguageSelectionModal 
        isOpen={showLanguageModal} 
        onClose={() => setShowLanguageModal(false)} 
      />
      
      <div 
        className="min-h-screen overflow-y-auto"
        style={{ 
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <MotionDiv 
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Header */}
        <Header onTabChange={handleTabChange} activeTab={activeTab} />
        
        {/* Main Content */}
        <div>
          <AnimatePresence mode="wait">
            {activeTab === "appointments" ? (
              <MotionDiv
                key="appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="w-full">
                  <Home />
                </div>
                <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[78%] mx-auto">
                  <Gallery />
                </div>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <ClientProfile />
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
        
        <Footer />
        </MotionDiv>
      </div>
      
      {/* Authentication Modals */}
      {showSignInModal ? (
        <Suspense fallback={null}>
          <SignInModal
            show={showSignInModal}
            onClose={closeSignInModal}
            onSignInSuccess={handleSignInSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            service={null}
          />
        </Suspense>
      ) : null}
      
      {showSignUpModal ? (
        <Suspense fallback={null}>
          <SignUpModal
            show={showSignUpModal}
            onClose={closeSignUpModal}
            onSignUpSuccess={handleSignUpSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
            service={null}
          />
        </Suspense>
      ) : null}
      
      {showForgotPasswordModal ? (
        <Suspense fallback={null}>
          <ForgotPasswordModal
            show={showForgotPasswordModal}
            onClose={closeForgotPasswordModal}
            onBackToSignIn={handleSwitchToSignIn}
            service={null}
          />
        </Suspense>
      ) : null}
    </BatchTranslationLoader>
  );
};

export default PublicBarberProfile;
