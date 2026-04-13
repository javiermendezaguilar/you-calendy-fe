import React, { useContext, useEffect, useState, useRef } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { useNavigate, useLocation } from "react-router-dom";
import { BatchTranslationContext } from "../../contexts/BatchTranslationContext";
import BatchLanguageSelector from "../../components/barber/BatchLanguageSelector";
import { useClientProfile } from "../../hooks/useClientProfile";
import { Skeleton } from "@mantine/core";
import { clientLogin } from "../../services/clientAPI";

const Header = ({ onTabChange, activeTab: externalActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessLogo, setBusinessLogo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Safe context usage
  const context = useContext(BatchTranslationContext);
  
  // Fallback tc function if context is not available
  const tc = context?.tc || ((key) => key);

  // Check if user is on profile page
  const isProfilePage = externalActiveTab === "profile";
  
  // Get client data from API
  const clientId = localStorage.getItem('clientId');
  const { data: clientProfile, isLoading: profileLoading } = useClientProfile(clientId);
  
  // Extract client name and email with fallbacks
  const clientName = clientProfile 
    ? `${clientProfile.firstName || ''} ${clientProfile.lastName || ''}`.trim() 
    : '';
  const clientEmail = clientProfile?.email || '';
  
  // Get initials for profile image fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    // Active state is driven by the parent via externalActiveTab.
  }, [isProfilePage]);

  useEffect(() => {
    // Get business logo from localStorage
    const publicBarberData = localStorage.getItem('publicBarberData');
    if (publicBarberData) {
      try {
        const barberData = JSON.parse(publicBarberData);
        const logo = barberData?.business?.profileImages?.logo;
        if (logo) {
          setBusinessLogo(logo);
        }
      } catch {
        // Silently handle parse error
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = ({ target }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for appointment booking events to refresh profile state
  useEffect(() => {
    const handleAppointmentBooked = () => {
      // When an appointment is booked, the profile should now be accessible
      // The profile check will work on next click since appointments now exist
    };

    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
    };
  }, []);

  const handleLogoClick = () => {
    // If we're on a barber profile page, stay on the same page (scroll to top)
    if (location.pathname.startsWith("/barber/profile/")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (onTabChange) {
        onTabChange("appointments");
      }
      return;
    }
    // Otherwise, navigate to client page
    navigate("/client");
  };

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Check if client has any appointments
  const checkClientHasAppointments = async () => {
    try {
      const clientId = localStorage.getItem('clientId');
      if (!clientId) {
        return false;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.groomnest.com';
      
      // Try to login first to get cookie
      try {
        await clientLogin(clientId);
      } catch {
        // Continue anyway - might already be logged in
      }

      // Fetch appointments for the client (add timestamp to bypass cache)
      const response = await fetch(`${API_BASE_URL}/appointments?limit=1&_t=${Date.now()}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        cache: 'no-cache', // Ensure we get fresh data
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      
      // Check if client has any appointments
      const hasAppointments = result?.data?.appointments?.length > 0 || 
                             result?.appointments?.length > 0 ||
                             (Array.isArray(result?.data) && result.data.length > 0);
      
      return hasAppointments;
    } catch {
      return false;
    }
  };

  const handleProfileClick = async () => {
    // Check if client is logged in first
    const clientId = localStorage.getItem('clientId');
    
    if (!clientId) {
      // Client is not logged in - trigger sign in modal
      window.dispatchEvent(new CustomEvent('openSignInModal', { 
        detail: { source: 'profileClick' } 
      }));
      setShowDropdown(false);
      return;
    }
    
    // Check if client has appointments before allowing profile access
    const hasAppointments = await checkClientHasAppointments();
    
    if (!hasAppointments) {
      // Client is logged in but has no appointments - still allow access or show sign in
      // For now, we'll allow access since they're logged in
      // Alternatively, we could show the sign in modal here too
      handleTabChange("profile");
      setShowDropdown(false);
      return;
    }
    
    // Client has appointments, allow access to profile
    handleTabChange("profile");
    setShowDropdown(false);
  };

  const handleSignOut = async () => {
    try {
      // Clear clientToken cookie specifically with various path combinations
      const cookiesToClear = ['clientToken', 'token', 'clientId'];
      const paths = ['/', '/barber', '/barber/profile', ''];
      
      cookiesToClear.forEach(cookieName => {
        paths.forEach(path => {
          // Clear with path
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}`;
          // Clear with domain variations
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'};domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'};domain=.${window.location.hostname}`;
        });
      });
      
      // Also clear all cookies generically
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Clear localStorage items related to client session
      localStorage.removeItem('clientId');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('publicStaffId');
      localStorage.removeItem('publicStaffInfo');
      
      // Clear any clientAutoFill data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('clientAutoFill:')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload the page to reset the state
      window.location.reload();
    } catch {
      // Silently handle error and still reload
      window.location.reload();
    }
  };
  
  // Check if client is logged in (has clientId)
  const isClientLoggedIn = !!clientId;

  return (
    <div className="fixed w-screen bg-[#1B1D21] flex justify-between items-center p-3 lg:px-6 shadow-md z-50">
      <div onClick={handleLogoClick} className="cursor-pointer">
        {businessLogo ? (
          <img 
            src={businessLogo} 
            alt="Business Logo" 
            className="h-10 w-auto object-contain max-w-[150px]"
          />
        ) : (
          <HeaderLogoLight />
        )}
      </div>
      
      {/* Navigation Tabs - Desktop */}
      <div className="hidden md:flex items-center">
        <div className="flex gap-6">
          <button 
            className={`px-4 py-2 text-sm font-medium cursor-pointer ${
              !isProfilePage
                ? "bg-[#93B45A] text-black rounded-md" 
                : "text-white"
            }`}
            onClick={() => handleTabChange("appointments")}
          >
            {tc('appointments')}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium cursor-pointer ${
              isProfilePage
                ? "bg-[#93B45A] text-black rounded-md" 
                : "text-white"
            }`}
            onClick={handleProfileClick}
          >
            {tc('myProfile')}
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Selector - Mobile Compact */}
        <div className="md:hidden">
          <BatchLanguageSelector
            variant="menu"
            size="sm"
            showFlag={true}
            showLabel={true}
            placement="bottom-end"
            className="bg-slate-200 hover:bg-slate-300 rounded-full border border-slate-300"
            darkMode={false}
            mobileCompact={true}
          />
        </div>

        {/* Language Selector - Desktop */}
        <div className="hidden md:block">
          <BatchLanguageSelector
            variant="dropdown"
            size="sm"
            showFlag={true}
            showLabel={false}
            placement="bottom-end"
            className=""
            darkMode={false}
          />
        </div>
        
        {/* User Profile Dropdown */}
        <div 
          className="relative flex items-center gap-2 text-white cursor-pointer hover:bg-gray-800 rounded-md px-2 py-1"
          onClick={() => setShowDropdown(!showDropdown)}
          ref={dropdownRef}
        >
          <div className="w-8 h-8 rounded-full bg-[#B68D7C] flex items-center justify-center overflow-hidden">
            {clientProfile?.profileImage ? (
              <img 
                src={clientProfile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-sm font-medium">${getInitials(clientName)}</div>`;
                }}
              />
            ) : profileLoading ? (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                <Skeleton height={14} width="100%" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} color="white" />
              </div>
            )}
          </div>
          
          <div className="hidden md:block">
            <div className="text-sm font-medium">
              {profileLoading ? (
                <Skeleton height={14} width="120px" />
              ) : (
                clientName || tc('user')
              )}
            </div>
            <div className="text-xs text-gray-400">
              {profileLoading ? (
                <Skeleton height={12} width="150px" />
              ) : (
                clientEmail || tc('emailNotAvailable')
              )}
            </div>
          </div>
          
          <ChevronDown size={16} color="white" />
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#2A2D35] rounded-md shadow-lg py-1 z-50">
              {!isProfilePage && (
                <div 
                  className="px-4 py-2 flex items-center gap-2 hover:bg-[#3A3D45] cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <User size={16} />
                  <span>{tc('myProfile')}</span>
                </div>
              )}
              {isProfilePage && (
                <div 
                  className="px-4 py-2 flex items-center gap-2 hover:bg-[#3A3D45] cursor-pointer"
                  onClick={() => {
                    handleTabChange("appointments");
                    setShowDropdown(false);
                  }}
                >
                  <User size={16} />
                  <span>{tc('dashboard')}</span>
                </div>
              )}
              
              {/* Sign Out Button - Only show when client is logged in */}
              {isClientLoggedIn && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-600 my-1"></div>
                  
                  <div 
                    className="px-4 py-2 flex items-center gap-2 hover:bg-[#3A3D45] cursor-pointer text-red-400"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} />
                    <span>{tc('signOut')}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
