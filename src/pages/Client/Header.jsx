import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User } from "lucide-react";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { useNavigate, useLocation } from "react-router-dom";
import { useClientProfile } from "../../hooks/useClientProfile";
import { Skeleton } from "@mantine/core";
import ClientNotifications from "../../components/client/ClientNotifications";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchLanguageSelector from "../../components/barber/BatchLanguageSelector";

const Header = ({ onTabChange }) => {
  const { tc } = useBatchTranslation();
  const [activeTab, setActiveTab] = useState("appointments");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isProfilePage = location.pathname === "/client/profile";
  
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
    if (isProfilePage) {
      setActiveTab("profile");
    } else {
      setActiveTab("appointments");
    }
  }, [isProfilePage]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleLogoClick = () => {
    navigate("/client");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (onTabChange) {
      onTabChange(tab);
    }
    
    if (tab === "appointments") {
      navigate("/client");
    } else if (tab === "profile") {
      navigate("/client/profile");
    }
  };

  const handleProfileClick = () => {
    navigate("/client/profile");
    setShowDropdown(false);
  };

  return (
    <div className="fixed w-screen bg-[#1B1D21] flex justify-between items-center p-3 lg:px-6 shadow-md z-50">
      <div onClick={handleLogoClick} className="cursor-pointer">
        <HeaderLogoLight />
      </div>
      
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
            onClick={() => handleTabChange("profile")}
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
        
        <ClientNotifications />
        
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
                  onClick={() => navigate("/client")}
                >
                  <User size={16} />
                  <span>{tc('dashboard')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;