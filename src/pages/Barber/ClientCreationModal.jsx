import React, { useState, useEffect } from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';
import CommonModal from '../../components/common/CommonModal';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ClientCreationModal = ({ show, onClose, onClientCreated, service }) => {
  const { tc } = useBatchTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
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
        setFormData({
          firstName: obj.firstName || '',
          lastName: obj.lastName || '',
          email: obj.email || '',
          phone: obj.phone || ''
        });
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
      toast.error(tc('firstNameRequired'));
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error(tc('lastNameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(tc('emailRequired'));
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(tc('phoneRequired'));
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(tc('invalidEmailFormat'));
      return false;
    }
    
    return true;
  };

  const handleCreateClient = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);
      
      // Get business ID from public barber data
      let publicBusinessId = localStorage.getItem('publicBusinessId');
      
      // Fallback: try to get from publicBarberData if publicBusinessId is not set
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
        toast.error(tc('businessInformationMissing'));
        return;
      }

      // Create client using the public client creation endpoint
      const clientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        businessId: publicBusinessId // Include business ID in the request
      };

      // Use the public client creation endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://you-calendy-be.up.railway.app'}/business/client-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for cross-origin requests
        body: JSON.stringify(clientData)
      });

      const result = await response.json();

      if (result.success && result.data && result.data.client) {
        // Create client information for the next modal
        const clientInfo = {
          _id: result.data.client._id,
          firstName: result.data.client.firstName,
          lastName: result.data.client.lastName,
          email: result.data.client.email,
          phone: result.data.client.phone
        };
        
        // Store client ID only - token is stored in httpOnly cookie by backend
        // DO NOT store tokens in localStorage (security risk)
        const finalClientId = result.data.clientId || result.data.client._id || clientInfo._id;
        if (finalClientId) {
          localStorage.setItem('clientId', finalClientId);
        }
        
        // CRITICAL: Mark that this client was just created in this session
        // This ensures the registration message appears after first appointment booking
        sessionStorage.setItem('clientJustCreated', 'true');
        sessionStorage.setItem('clientCreatedTimestamp', Date.now().toString());
        sessionStorage.setItem('clientCreatedId', finalClientId);
        
        try {
          const savedKey = `clientAutoFill:${publicBusinessId}`;
          localStorage.setItem(savedKey, JSON.stringify({
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            email: clientData.email,
            phone: clientData.phone,
            countryIso: defaultCountry
          }));
        } catch {}
        
        toast.success(tc('detailsSavedSuccessfully'));
        onClientCreated(clientInfo);
      } else {
        toast.error(result.message || tc('failedToSaveDetails'));
      }
    } catch (error) {
      toast.error(tc('errorSavingDetails'));
    } finally {
      setIsCreating(false);
    }
  };

  const modalContent = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {tc('enterDetails')}
        </h2>
        <p className="text-gray-600 text-sm">
          {tc('pleaseProvideYourInformation')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label={tc('firstName')}
            placeholder={tc('enterFirstName')}
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            disabled={isCreating}
          />
          <TextInput
            label={tc('lastName')}
            placeholder={tc('enterLastName')}
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
            disabled={isCreating}
          />
        </div>

        <TextInput
          label={tc('email')}
          placeholder={tc('enterEmail')}
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={isCreating}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {tc('phone')}
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
            disabled={isCreating}
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
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <Button
          onClick={handleCreateClient}
          color="dark"
          fullWidth
          loading={isCreating}
        >
          {isCreating ? tc('creating') : tc('continue')}
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          color="gray"
          fullWidth
          disabled={isCreating}
        >
          {tc('cancel')}
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

export default ClientCreationModal;
