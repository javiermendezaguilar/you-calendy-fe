import { ActionIcon, Button, Checkbox, ScrollArea } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import React, { useRef, useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import CommonModal from "../../common/CommonModal";
import { useDisclosure } from "@mantine/hooks";
import PromotionSuccessModal from "./PromotionSuccessModal";
import { useForm } from "@mantine/form";
import { useCreatePromotion, useUpdatePromotion } from "../../../hooks/useMarketing";
import { useGetServices } from "../../../hooks/useServices";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";

const HappyHoursForm = ({ close, day, existingPromotion }) => {
  const { tc } = useBatchTranslation();
  const {data: services, isLoading: servicesLoading} = useGetServices();
  const {mutate: createPromotion, isLoading: isCreating} = useCreatePromotion();
  const {mutate: updatePromotion, isLoading: isUpdating} = useUpdatePromotion();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!existingPromotion;

  const form = useForm({
    initialValues: { services: [], start: "", end: "", discount: 10 },

    validate: {
      services: (value) => (value.length === 0 ? tc('selectAtLeastOneService') || 'Please select at least one service' : null),
      start: (value) => (!value ? tc('selectStartTime') : null),
      end: (value) => (!value ? tc('selectEndTime') : null),
    },
  });

  // Pre-fill form when editing existing promotion
  useEffect(() => {
    if (existingPromotion) {
      // Convert service IDs to array of strings
      const serviceIds = existingPromotion.services?.map(s => 
        typeof s === 'string' ? s : s._id || s.toString()
      ) || [];
      form.setValues({
        services: serviceIds,
        start: existingPromotion.startTime || "",
        end: existingPromotion.endTime || "",
        discount: existingPromotion.discountPercentage || 10,
      });
    } else {
      // Reset form when no existing promotion
      form.setValues({
        services: [],
        start: "",
        end: "",
        discount: 10,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPromotion]);

  const increaseDiscount = () => {
    form.setFieldValue('discount', Math.min(form.values.discount + 1, 100));
  };

  const decreaseDiscount = () => {
    form.setFieldValue('discount', Math.max(form.values.discount - 1, 1));
  };

  const [opened, { open, close: close2 }] = useDisclosure(false);
  const start = useRef(null);
  const end = useRef(null);

  const startPickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => start.current?.showPicker?.()}
    >
      <GoClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const endPickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => end.current?.showPicker?.()}
    >
      <GoClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const handleStartPickerBlur = () => {
    if (start.current?.picker) {
      start.current.picker.blur();
    }
  };

  const handleEndPickerBlur = () => {
    if (end.current?.picker) {
      end.current.picker.blur();
    }
  };

  // Handle service selection
  const handleServiceToggle = (serviceId) => {
    const currentServices = form.values.services;
    if (currentServices.includes(serviceId)) {
      form.setFieldValue('services', currentServices.filter(id => id !== serviceId));
    } else {
      form.setFieldValue('services', [...currentServices, serviceId]);
    }
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    const allServiceIds = services?.map(s => s._id) || [];
    const currentServices = form.values.services;
    
    if (currentServices.length === allServiceIds.length) {
      // Deselect all
      form.setFieldValue('services', []);
    } else {
      // Select all
      form.setFieldValue('services', allServiceIds);
    }
  };

  const handleSubmit = (values) => {
    const payload = {
      name: `${tc('happyHour')} - ${tc(day.toLowerCase())}`,
      description: `${tc('happyHourPromotionFor')} ${tc(day.toLowerCase())}`,
      dayOfWeek: day.toLowerCase(),
      startTime: values.start,
      endTime: values.end,
      discountPercentage: values.discount,
      services: values.services, // Array of service IDs
    };

    if (isEditing) {
      // Update existing promotion
      updatePromotion(
        { id: existingPromotion._id, payload },
        {
          onSuccess: () => {
            close();
          },
        }
      );
    } else {
      // Create new promotion
      createPromotion(payload, {
        onSuccess: () => {
          open();
        },
      });
    }
  };
  return (
    <form className="space-y-4" onSubmit={form.onSubmit(handleSubmit)}>
      <p className="text-xl font-semibold mb-4">
        {isEditing ? tc('editHappyHours') : tc('happyHours')}
      </p>

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-3">
        <TimeInput
          variant="filled"
          size="sm"
          label={tc('start')}
          ref={start}
          rightSection={startPickerControl}
          {...form.getInputProps("start")}
        />
        <TimeInput
          variant="filled"
          size="sm"
          label={tc('end')}
          ref={end}
          rightSection={endPickerControl}
          {...form.getInputProps("end")}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-slate-700">{tc('happyHoursDiscount')}</p>
        <div className="p-2 w-2/3 rounded-xl flex justify-between items-center">
          <div
            onClick={increaseDiscount}
            className="shadow-[0px_14px_32.2px_0px_#E9EEF059] cursor-pointer p-2 rounded-full border border-slate-100 flex justify-center items-center"
          >
            <FaPlus color="#93AFD6" size={14} />
          </div>
          <p className="text-xl font-semibold">{form.values.discount}%</p>
          <div
            onClick={decreaseDiscount}
            className="shadow-[0px_14px_32.2px_0px_#E9EEF059] cursor-pointer p-2 rounded-full border border-slate-100 flex justify-center items-center"
          >
            <FaMinus color="#93AFD6" size={14} />
          </div>
        </div>
        <p className="text-xs text-slate-700">{tc('offTheServicePrice')}</p>
      </div>

      {/* Services Selection with Checkboxes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          {tc('selectServices') || 'Select Services'}
        </label>
        
        {servicesLoading ? (
          <div className="p-3 text-center text-slate-500 text-sm">
            {tc('loading') || 'Loading services...'}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="p-3 text-center text-slate-500 text-sm">
            {tc('noServicesFound') || 'No services found'}
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            {/* Select All Checkbox */}
            <div className="mb-2 pb-2 border-b border-slate-200">
              <Checkbox
                checked={form.values.services.length === services.length && services.length > 0}
                onChange={handleSelectAll}
                label={tc('selectAll') || 'Select All'}
                size="sm"
                className="font-medium"
              />
            </div>
            
            {/* Services List */}
            <ScrollArea h={120} type="scroll">
              <div className="space-y-1">
                {services.map((service) => (
                  <Checkbox
                    key={service._id}
                    checked={form.values.services.includes(service._id)}
                    onChange={() => handleServiceToggle(service._id)}
                    label={`${service.name}${service.price ? ` - $${service.price}` : ''}`}
                    size="sm"
                    className="py-0.5"
                  />
                ))}
              </div>
            </ScrollArea>
            
            {form.errors.services && (
              <p className="text-red-500 text-xs mt-1.5">{form.errors.services}</p>
            )}
            
            {form.values.services.length > 0 && (
              <p className="text-xs text-slate-500 mt-1.5">
                {form.values.services.length} {form.values.services.length === 1 ? tc('service') || 'service' : tc('services') || 'services'} {tc('selected') || 'selected'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button
          size="md"
          radius={10}
          w={"100%"}
          className=" !text-stone-600 !bg-stone-300"
          onClick={close}
        >
          {tc('cancel')}
        </Button>
        <Button
          type="submit"
          color="#323334"
          size="md"
          radius={10}
          w={"100%"}
          loading={isLoading}
        >
          {isEditing ? tc('updatePromotion') : tc('startPromotion')}
        </Button>
      </div>
      {!isEditing && (
        <CommonModal
          opened={opened}
          close={close2}
          content={<PromotionSuccessModal onClose={() => {
            close2();
            close();
          }} />}
        />
      )}
    </form>
  );
};

export default HappyHoursForm;
