import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, TextInput, Select, LoadingOverlay, Skeleton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { currencyOptions, getCurrencySymbol } from "../../constants/currencyOptions";

import CommonModal from '../../components/common/CommonModal';
import DeleteServiceModal from '../../components/common/DeleteServiceModal';
import { useUpdateService, useDeleteService } from '../../hooks/useServices';
import { useGetStaff } from '../../hooks/useStaff';
import { useGetBusiness } from '../../hooks/useBusiness';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { IoArrowBackCircleOutline } from 'react-icons/io5';

const ServiceSetup = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: businessData, isLoading: isFetching } = useGetBusiness();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { data: staffApiData } = useGetStaff();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const { tc } = useBatchTranslation();

  // Currency options now imported from shared constants to prevent duplicates

  const form = useForm({
    initialValues: {
      name: '',
      type: '',
      price: '0.00',
      currency: 'USD',
      category: '',
    },
    validate: {
      name: (value) => (!value ? tc('serviceNameRequired') : null),
      type: (value) => (!value ? tc('serviceTypeRequired') : null),
      price: (value) => {
        if (!value) return tc('priceRequired');
        if (isNaN(value)) return tc('priceMustBeNumber');
        if (parseFloat(value) < 0) return tc('priceCannotBeNegative');
        return null;
      },
    },
  });

  const services = businessData?.data?.services || [];
  const staffList = staffApiData?.data?.data?.staff || [];

  const isServiceAssignedToAnyStaff = (service) => {
    const serviceId = service?._id || service?.id;
    if (!serviceId) return false;
    return staffList.some((staff) => {
      const list = Array.isArray(staff?.services) ? staff.services : [];
      return list.some((entry) => {
        const sid = typeof entry?.service === 'object' ? (entry?.service?._id || entry?.service?.id) : entry?.service;
        return String(sid) === String(serviceId);
      });
    });
  };

  const formatPrice = (price) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price.substring(1);
    }
    return price;
  };

  const handleAddNewService = () => {
    navigate('/dashboard/business-setting/add-service');
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    
    form.setValues({
      name: service.name,
      type: service.type,
      price: formatPrice(service.price),
      currency: service.currency || 'USD',
      category: service.category || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedService(null);
    form.reset();
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedService(null);
  };

  const handleSaveService = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const serviceData = {
      name: form.values.name,
      type: form.values.type,
      price: parseFloat(form.values.price),
      currency: form.values.currency,
      category: form.values.category,
    };

    updateService(
      { serviceId: selectedService._id, serviceData },
      { onSuccess: handleCloseModal }
    );
  };

  const handleDeleteService = () => {
    setModalOpen(false);
    setDeleteModalOpen(true);
  };

  const confirmDeleteService = (reason) => {
    if (!selectedService) return;
    deleteService(
      { serviceId: selectedService._id, reason },
      {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedService(null);
        },
      }
    );
  };

  return (
    <main className="h-[83vh] overflow-auto bg-white p-6 rounded-[18px] max-md:max-w-[991px]">
      <LoadingOverlay visible={isUpdating} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <Link to={-1} className="flex w-auto">
          <Button
            size="lg"
            className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:size-md max-md:!text-sm max-md:!py-2 max-md:!px-4"
          >
            <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
          </Button>
        </Link>

        <Button
          leftSection={<Plus size={20} />}
          styles={{
            root: {
              height: '45px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '15px',
              backgroundColor: '#323334',
              color: 'white',
              '&:hover': { backgroundColor: '#444' },
            },
          }}
          size="md"
          onClick={handleAddNewService}
        >
          {tc('addNewService')}
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl md:text-2xl font-medium text-[#323334] mb-2">{tc('addStartServices')}</h1>
        <p className="text-[#939799] text-sm max-w-full sm:max-w-[600px]">{tc('addAtLeastOneServiceNote')}</p>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {isFetching ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={60} radius="xl" className="w-full sm:w-[90%] md:w-[70%] lg:w-[40%]" />
          ))
        ) : (
          services.map((service) => {
            const assigned = isServiceAssignedToAnyStaff(service);
            return (
              <div
                key={service._id}
                className="flex flex-col w-full sm:w-[90%] md:w-[70%] lg:w-[40%] bg-white rounded-xl border border-[#EBEBEB] p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div>
                      <h3 className="text-[#323334] text-base sm:text-lg font-medium">{service.name}</h3>
                      <span className="text-[#929699] text-xs sm:text-sm">{service.type || tc('service')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6">
                    <span className="text-[#323334] text-base sm:text-lg font-medium">{service.price}</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#929699] cursor-pointer" />
                  </div>
                </div>
                {!assigned && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600">
                      {tc('serviceNotAssignedToAnyStaff')}. {tc('goToStaffManagementToAssignService')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CommonModal
        opened={modalOpen}
        onClose={handleCloseModal}
        content={
          selectedService && (
            <div className="p-5 max-w-md mx-auto">
              <div className="flex flex-col gap-5">
                <TextInput
                  placeholder={tc('nameOfTheService')}
                  {...form.getInputProps('name')}
                  className="w-full"
                  classNames={{ input: '!h-[46px] !border !border-[#EBEBEB] !rounded-[12px] !bg-[#F9F9F9]' }}
                />

                <TextInput
                  placeholder={tc('typeOfService')}
                  {...form.getInputProps('type')}
                  className="w-full"
                  classNames={{ input: '!h-[46px] !border !border-[#EBEBEB] !rounded-[12px] !bg-[#F9F9F9]' }}
                />

                <div className="h-[1px] bg-[#EBEBEB] my-1"></div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#929699] text-sm mb-2 block">Currency</label>
                    <Select
                      {...form.getInputProps('currency')}
                      data={currencyOptions}
                      placeholder="Select currency"
                      classNames={{ 
                        input: '!h-[46px] !border !border-[#EBEBEB] !rounded-[12px] !bg-[#F9F9F9]',
                        dropdown: '!border !border-[#EBEBEB] !rounded-[12px]'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative w-full">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-[#323334] font-medium">
                        {getCurrencySymbol(form.values.currency)}
                      </span>
                      <TextInput
                        placeholder={tc('pricePlaceholder')}
                        {...form.getInputProps('price')}
                        classNames={{ input: '!h-[46px] !border !border-[#EBEBEB] !rounded-[12px] !bg-[#F9F9F9] !pl-12' }}
                      />
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <input type="checkbox" className="w-5 h-5" />
                      <label className="text-[#323334]">{tc('from')}</label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteService}
                    size="md"
                    radius="md"
                    className="flex-1"
                    styles={{
                      root: {
                        backgroundColor: '#FF5252',
                        height: '42px',
                        minWidth: '120px',
                        '&:hover': { backgroundColor: '#E03131' },
                      },
                    }}
                  >
                    {tc('delete')}
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    size="md"
                    radius="md"
                    className="flex-1"
                    styles={{
                      root: {
                        backgroundColor: '#323334',
                        height: '42px',
                        minWidth: '120px',
                        '&:hover': { backgroundColor: '#2a2b2c' },
                      },
                    }}
                  >
                    {tc('save')}
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      />

      <CommonModal
        opened={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        content={
          selectedService && (
            <DeleteServiceModal
              onCancel={handleCloseDeleteModal}
              onConfirm={confirmDeleteService}
              isLoading={isDeleting}
              serviceName={selectedService.name}
            />
          )
        }
      />
    </main>
  );
};

export default ServiceSetup;