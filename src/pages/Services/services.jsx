import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronDown, X, PenSquare, AlertCircle } from 'lucide-react';
import LazyFooter from '../../components/home/landing/LazyFooter';
import { Button, TextInput, NumberInput, Select, Checkbox, Text, LoadingOverlay } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderLogo } from "../../components/common/Svgs";
import { setServices, prevStep } from '../../store/registrationSlice';
import { useRegister } from '../../hooks/useRegister';
import CommonModal from '../../components/common/CommonModal';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import { currencyOptions, getCurrencySymbol } from '../../constants/currencyOptions';

// Currency options now imported from shared constants to prevent duplicates

const Services = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const initialServices = useSelector((state) => state.registration.services);
  const registrationData = useSelector((state) => state.registration);
  const { mutateAsync: registerUser, isPending: isLoading } = useRegister();

  const [localServices, setLocalServices] = useState(initialServices);

  useEffect(() => {
    setLocalServices(initialServices);
  }, [initialServices]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: '', type: '', price: '', currency: 'USD', isFromEnabled: false });
  const [validationErrors, setValidationErrors] = useState({});

  const handleBack = () => {
    dispatch(prevStep());
    navigate('/business-hours');
  };

  const handleAddService = () => {
    setEditingService(null);
    setNewService({ name: '', type: '', price: '', currency: 'USD', isFromEnabled: false });
    setValidationErrors({});
    setModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    
    setNewService({
      name: service.name,
      type: service.type || '',
      price: service.price.toString(),
      currency: service.currency || 'USD',
      isFromEnabled: service.isFromEnabled || false
    });
    setValidationErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMantineChange = (name, value) => {
    setNewService(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateService = () => {
    const errors = {};
    if (!newService.name.trim()) errors.name = tc('serviceNameRequired');
    if (!newService.type.trim()) errors.type = tc('typeOfServiceRequired');
    if (newService.price === '' || isNaN(parseFloat(newService.price)) || parseFloat(newService.price) < 0) {
      errors.price = "Price must be a valid non-negative number";
    }
    
    return errors;
  };

  const handleDeleteService = () => {
    if (editingService) {
      const updatedServices = localServices.filter(service => service.id !== editingService.id);
      setLocalServices(updatedServices);
      handleCloseModal();
    }
  };

  const handleKeepSection = () => {
    const errors = validateService();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const servicePayload = {
      name: newService.name,
      price: parseFloat(newService.price) || 0,
      currency: newService.currency,
      type: newService.type,
      isFromEnabled: newService.isFromEnabled
    };

    let updatedServices;
    if (editingService) {
      updatedServices = localServices.map(service =>
        service.id === editingService.id ? { ...service, ...servicePayload } : service
      );
    } else {
      const newId = localServices.length > 0 ? Math.max(...localServices.map(s => s.id)) + 1 : 1;
      updatedServices = [...localServices, { id: newId, ...servicePayload }];
    }
    setLocalServices(updatedServices);
    handleCloseModal();
  };

  const handleContinue = async () => {
    dispatch(setServices(localServices));

    try {
      const finalRegistrationData = {
        ...registrationData,
        services: localServices,
      };

      await registerUser(finalRegistrationData);
      navigate('/welcome');
    } catch (error) {
      console.error("Final registration submission failed:", error);
    }
  };

  const formatPrice = (price, currency = 'USD') => `${getCurrencySymbol(currency)}${price.toFixed(2)}`;
  const getServiceInitial = (name) => name.charAt(0);

  const inputStyles = {
    input: {
      height: '45px',
      color: '#323334',
      fontSize: '14px', 
      backgroundColor: 'white',
      paddingLeft: '12px',
      paddingRight: '12px',
      borderRadius: '0.5rem',
      borderColor: '#E0E0E0',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
      '&:focus': {
        borderColor: '#2F70EF', 
        boxShadow: '0 0 0 2px rgba(47, 112, 239, 0.2)',
      },
    },
    wrapper: {
      width: '100%',
    }
  };

  const buttonStyles = {
    root: {
      height: '45px',
      width: '100%',
      borderRadius: '8px',
      fontWeight: 500,
      fontSize: '15px',
    }
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-y-auto relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <main className="flex-grow flex flex-col items-center bg-[linear-gradient(180deg,#F4F6F8_0%,#F4F6F8_22.5%,#FFF_100%)] p-[10px] sm:p-[15px] border-[3px_solid_#FCFFFF] max-md:p-6 max-sm:p-4">
        <div className="w-full flex justify-start items-start mb-8">
          <div className="flex flex-col">
            <div className="mb-5">
              <div className="flex justify-center items-center">
                <Link to="/" className="cursor-pointer">
                  <HeaderLogo />
                </Link>
              </div>
            </div>
            <Button
              onClick={handleBack}
              variant="subtle"
              p={0}
              top={50}
              styles={{ 
                root: { color: '#323334' },
                label: { fontSize: '1rem', fontWeight: 500 }
              }}
              classNames={{
                root: '!bg-transparent'
              }}
              leftSection={<ArrowLeft className="mr-1 h-4 w-4" />}
              aria-label="Go back"
            >
              {tc('back')}
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[450px] h-2 bg-[#E0E7FF] mb-6 rounded-full relative">
          <div className="w-[calc(100%/4*3)] h-2 bg-[#2F70EF] absolute left-0 top-0 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-[#2F70EF] rounded-full left-[calc(100%/8-4px)] -top-0"></div> 
          <div className="absolute w-2 h-2 bg-[#2F70EF] rounded-full left-[calc(100%/4*1+100%/8-4px)] -top-0"></div>
          <div className="absolute w-2 h-2 bg-[#2F70EF] rounded-full left-[calc(100%/4*2+100%/8-4px)] -top-0"></div>
          <div className="absolute w-2 h-2 bg-white border-2 border-[#A8BBFF] rounded-full left-[calc(100%/4*3+100%/8-4px)] -top-0"></div>
        </div>
        
        <div className="flex flex-col items-center w-full max-w-[400px] mt-10 mb-30 mx-auto max-md:w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col items-center w-full mb-4 max-md:w-full px-2">
              <h1 className="text-[#323334] text-center text-3xl font-bold max-md:text-2xl max-sm:text-xl">
                Start listing your services
              </h1>
              <p className="text-[#7898AB] text-center text-sm font-normal mt-2 max-md:text-sm max-sm:text-xs">
                You must add at least one service now. You can add more services, details and group service into categories later.
              </p>
            </div>

            <div className="flex flex-col w-full gap-4">
              {localServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between w-full bg-white rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.08)] px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-[28px] h-[28px] bg-[#FFE8E8] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-[#FFD6D6] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalServices(localServices.filter(s => s.id !== service.id));
                      }}
                    >
                      <Trash2 size={14} className="text-[#FF5757]" />
                    </div>
                    <div>
                      <p className="text-[#323334] font-medium text-sm">{service.name}</p>
                      <p className="text-[#8D98A5] text-xs">{service.type || tc('service')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#323334] font-medium text-sm">{formatPrice(service.price, service.currency)}</span>
                    <div 
                      className="w-[28px] h-[28px] bg-[#F4F6F8] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#E9ECEF] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditService(service);
                      }}
                    >
                      <PenSquare size={14} className="text-[#8D98A5]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleAddService}
              leftSection={<Plus size={16} />}
              radius="md"
              styles={{
                ...buttonStyles,
                root: {
                  ...buttonStyles.root,
                  borderRadius: '8px',
                  backgroundColor: '#7C9940',
                  borderColor: '#7C9940',
                  marginTop: '6px',
                  marginBottom: '6px',
                  '&:hover': {
                    backgroundColor: '#556B2F',
                    borderColor: '#556B2F',
                  }
                }
              }}
            >
              Add Service
            </Button>

            <Button
              onClick={handleContinue}
              radius="md"
              styles={{
                ...buttonStyles,
                root: {
                  ...buttonStyles.root,
                  borderRadius: '8px',
                  backgroundColor: '#323334',
                  '&:hover': {
                    backgroundColor: '#444',
                  }
                }
              }}
            >
              Continue
            </Button>
          </div>
        </div>

        <CommonModal
          opened={modalOpen}
          onClose={handleCloseModal}
          size="auto"
          styles={{
            content: {
              width: '90%',
              maxWidth: '480px', 
              borderRadius: '1.25rem',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }
          }}
          content={
            <div className="p-6">
              <div className="pb-6 relative">
                <h2 className="text-[24px] font-bold text-[#323334] mb-2">
                  {editingService ? tc('editService') : tc('startAddingServices')}
                </h2>
                <p className="text-[#5F85B0] text-sm leading-relaxed">
                  {editingService 
                    ? tc('updateServiceDetailsBelow')
                    : tc('youMustAddAtLeastOneService')}
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <TextInput
                    name="name"
                    placeholder={tc('nameOfService')}
                    value={newService.name}
                    onChange={(event) => handleMantineChange("name", event.currentTarget.value)}
                    error={validationErrors.name}
                    styles={{
                      ...inputStyles,
                      input: {
                        ...inputStyles.input,
                        height: '48px',
                        backgroundColor: '#F6F7F9',
                        fontSize: '14px',
                        borderColor: validationErrors.name ? '#FF5757' : 'transparent',
                        '&:focus': {
                          borderColor: '#2F70EF',
                          boxShadow: 'none',
                        }
                      },
                      error: {
                        fontSize: '12px',
                        color: '#FF5757',
                        marginTop: '4px'
                      }
                    }}
                  />
                </div>
                <div>
                  <TextInput
                    name="type"
                    placeholder={tc('typeOfService')}
                    value={newService.type}
                    onChange={(event) => handleMantineChange("type", event.currentTarget.value)}
                    error={validationErrors.type}
                    styles={{
                      ...inputStyles,
                      input: {
                        ...inputStyles.input,
                        height: '48px',
                        backgroundColor: '#F6F7F9',
                        fontSize: '14px',
                        borderColor: validationErrors.type ? '#FF5757' : 'transparent',
                        '&:focus': {
                          borderColor: '#2F70EF',
                          boxShadow: 'none',
                        }
                      },
                      error: {
                        fontSize: '12px',
                        color: '#FF5757',
                        marginTop: '4px'
                      }
                    }}
                  />
                </div>

                <div className="pb-4">
                  <p className="text-[#323334] font-medium text-sm mb-3">Currency & Price</p>
                  <div className="space-y-3">
                    <div>
                      <Select
                        value={newService.currency}
                        onChange={(value) => handleMantineChange("currency", value)}
                        data={currencyOptions}
                        placeholder="Select currency"
                        searchable
                        styles={{
                          input: {
                            height: '48px',
                            backgroundColor: '#F6F7F9',
                            fontSize: '14px',
                            borderColor: 'transparent',
                            '&:focus': {
                              borderColor: '#2F70EF',
                              boxShadow: 'none',
                            }
                          },
                          dropdown: {
                            maxHeight: '200px',
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className={`flex items-center h-[48px] bg-[#F6F7F9] rounded-md px-3 shadow-[0_2px_5px_rgba(0,0,0,0.08)] ${validationErrors.price ? 'border border-[#FF5757]' : ''}`}>
                          <p className="text-[#323334] mr-2 font-medium">{getCurrencySymbol(newService.currency)}</p>
                          <input
                            type="text"
                            name="price"
                            value={newService.price}
                            placeholder="10.00"
                            className="flex-1 bg-transparent border-none outline-none text-[14px] font-normal"
                            onChange={(event) => handleMantineChange("price", event.currentTarget.value)}
                          />
                        </div>
                        {validationErrors.price && (
                          <p className="text-[#FF5757] text-xs mt-1">{validationErrors.price}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="from-checkbox"
                          checked={newService.isFromEnabled}
                          onChange={(event) => handleMantineChange("isFromEnabled", event.currentTarget.checked)}
                          color="blue"
                          size="sm"
                          classNames={{
                            root: "flex items-center",
                            input: "w-4 h-4 border-[#C0C7D0]"
                          }}
                        />
                        <label 
                          htmlFor="from-checkbox" 
                          className="text-[#8D98A5] text-sm cursor-pointer"
                          onClick={() => handleMantineChange("isFromEnabled", !newService.isFromEnabled)}
                        >
                          From
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <Button
                  onClick={handleDeleteService}
                  radius="md"
                  styles={{
                    root: {
                      width: '100%',
                      height: '48px',
                      backgroundColor: '#FFD6D6',
                      color: '#FF5757',
                      fontWeight: 500,
                      fontSize: '14px',
                      borderRadius: '0.75rem',
                      '&:hover': {
                        backgroundColor: '#FFBDBD'
                      }
                    }
                  }}
                >
                  {tc('delete')}
                </Button>
                <Button
                  onClick={handleKeepSection}
                  radius="md"
                  styles={{
                    root: {
                      width: '100%',
                      height: '48px',
                      backgroundColor: '#323334',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '14px',
                      borderRadius: '0.75rem',
                      '&:hover': {
                        backgroundColor: '#444'
                      }
                    }
                  }}
                >
                  {editingService ? tc('saveChanges') : tc('keepThisSection')}
                </Button>
              </div>
            </div>
          }
        />
      </main>
      <LazyFooter />
    </div>
  );
};

const ServicesWithTranslation = () => (
  <BatchTranslationLoader>
    <Services />
  </BatchTranslationLoader>
);

export default ServicesWithTranslation;
