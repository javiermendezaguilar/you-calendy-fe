import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  TextInput,
  Select,
  Checkbox,
  NumberInput,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ChevronDown, ChevronUp } from "lucide-react";

import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useAddService } from "../../hooks/useServices";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { currencyOptions, getCurrencySymbol } from "../../constants/currencyOptions";
import CommonModal from "../../components/common/CommonModal";

const AddServices = () => {
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const { mutate: addService, isPending } = useAddService();
  const { tc } = useBatchTranslation();

  // Currency options now imported from shared constants to prevent duplicates

  const form = useForm({
    initialValues: {
      name: "",
      type: "",
      price: "10.00",
      currency: "USD",
      isFromEnabled: false,
    },

    validate: {
      name: (value) =>
        value.length < 2 ? tc('serviceTypeTooShort') : null,
      type: (value) =>
        value.length < 2 ? tc('serviceTypeTooShort') : null,
      price: (value) => {
        if (!value) return tc('priceRequired');
        if (isNaN(value)) return tc('priceMustBeNumber');
        if (parseFloat(value) < 0) return tc('priceCannotBeNegative');
        return null;
      },
    },
  });

  const handleSave = (values) => {
    const serviceData = {
      name: values.name,
      type: values.type,
      price: parseFloat(values.price),
      currency: values.currency,
      isFromEnabled: values.isFromEnabled,
    };
    addService(serviceData, {
      onSuccess: () => {
        setSuccessModalOpen(true);
      },
    });
  };

  const handleGoToStaffManagement = () => {
    setSuccessModalOpen(false);
    navigate("/dashboard/staff-management");
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate("/dashboard/business-setting/service-setup");
  };



  const exampleServices = [
    { name: tc('beardTrimming'), duration: "15 min", price: "$10.00", color: "#FF6B6B" },
      { name: tc('gentlemansCut'), duration: "15 min", price: "$10.00", color: "#FFB946" },
      { name: tc('shaven'), duration: "15 min", price: "$10.00", color: "#4D7CFE" },
  ];

  return (
    <main className="h-[83vh] overflow-auto bg-white p-4 md:p-6 rounded-xl" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div>
            <p className="text-xl sm:text-2xl text-slate-800 font-semibold">
              {tc('Add Start Services')}
            </p>
            <p className="text-[#929699] text-sm max-w-full sm:max-w-[600px]">
              {tc('You must add at least one service now. Later, you will be able to add more services, edit the details, and group the services by categories.')}
            </p>
          </div>
        </div>
        <Button
          styles={{
            root: {
              height: '45px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '15px',
              backgroundColor: '#323334',
              color: 'white',
              '&:hover': { backgroundColor: '#444' },
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
          }}
          size="md"
          onClick={form.onSubmit(handleSave)}
          loading={isPending}
        >
          {tc('Save')}
        </Button>
      </div>

      <form
        onSubmit={form.onSubmit(handleSave)}
        className="flex flex-col gap-4 sm:gap-6 w-full sm:max-w-[540px]"
      >


        <div>
          <TextInput
            placeholder={tc('Name of the service')}
            variant="filled"
            radius={10}
            size="md"
            className="w-full"
            styles={{
              root: {
                boxShadow: 'none'
              }
            }}
            classNames={{
              input: "!h-[45px] sm:!h-[50px]"
            }}
            {...form.getInputProps("name")}
          />
        </div>

        <div>
          <TextInput
            placeholder={tc('Type of service')}
            variant="filled"
            radius={10}
            size="md"
            className="w-full"
            styles={{
              root: {
                boxShadow: 'none'
              }
            }}
            classNames={{
              input: "!h-[45px] sm:!h-[50px]"
            }}
            {...form.getInputProps("type")}
          />
        </div>

        <div>
          <p className="text-[#323334] text-sm sm:text-base font-light mb-2">{tc('Currency & Price')}</p>
          <div className="space-y-3">
            <div>
              <Select
                placeholder={tc('Select currency')}
                variant="filled"
                radius={10}
                size="md"
                className="w-full"
                data={currencyOptions}
                styles={{
                  root: {
                    boxShadow: 'none'
                  }
                }}
                classNames={{
                  input: "!h-[45px] sm:!h-[50px]"
                }}
                {...form.getInputProps("currency")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-[#323334] font-medium">
                  {getCurrencySymbol(form.values.currency)}
                </span>
                <TextInput
                  placeholder={tc('Price')}
                  variant="filled"
                  radius={10}
                  size="md"
                  className="w-full"
                  styles={{
                    root: {
                      boxShadow: 'none'
                    }
                  }}
                  classNames={{
                    input: "!h-[45px] sm:!h-[50px] !pl-10"
                  }}
                  {...form.getInputProps("price")}
                />
              </div>
              <div className="flex items-end pb-1">
                <Checkbox
                  label={tc('Price is from')}
                  {...form.getInputProps("isFromEnabled", { type: "checkbox" })}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <CommonModal
        opened={successModalOpen}
        onClose={handleCloseSuccessModal}
        size="md"
        closeOnClickOutside={false}
        closeOnEscape={true}
        withCloseButton={true}
        content={
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              {tc('Service Added Successfully') || 'Service Added Successfully'}
            </h2>
            <p className="text-[#929699] text-base mb-6">
              {tc('Service is added. Now go to staff management to assign this service to staff member.') || 
               'Service is added. Now go to staff management to assign this service to staff member.'}
            </p>
            <Button
              onClick={handleGoToStaffManagement}
              styles={{
                root: {
                  width: '100%',
                  height: '45px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '15px',
                  backgroundColor: '#323334',
                  color: 'white',
                  '&:hover': { backgroundColor: '#444' },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              {tc('Go to Staff Management') || 'Go to Staff Management'}
            </Button>
          </div>
        }
      />
    </main>
  );
};

export default AddServices;
