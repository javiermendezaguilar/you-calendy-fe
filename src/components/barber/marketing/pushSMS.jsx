import React, { useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  CheckIcon,
  Divider,
  Radio,
  Textarea,
  NumberInput,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { GoCalendar, GoClock } from "react-icons/go";
import { useForm } from "@mantine/form";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";
import ClientSelector from "./ClientSelector";

const PushSMSForm = ({ onSubmit }) => {
  const { tc } = useBatchTranslation();
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  
  const form = useForm({
    initialValues: {
      content: "",
      delivery: "now",
      date: "",
      time: "",
      recurringInterval: 21,
    },

    validate: {
      content: (value) =>
        value.length < 4 ? tc('emailContentMinLength') : null,
      delivery: (value) => (!value ? tc('selectDeliveryTimeline') : null),
      date: (value, values) =>
        values?.delivery == "later" && !value ? tc('selectDeliveryDate') : null,
      time: (value, values) =>
        values?.delivery == "later" && !value ? tc('selectDeliveryTime') : null,
    },
  });
  const timeRef = useRef(null);

  const timePickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => timeRef.current?.showPicker()}
    >
      <GoClock color="#323334" size={16} stroke={2.5} />
    </ActionIcon>
  );

  const datePickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
    >
      <GoCalendar color="#323334" size={16} />
    </ActionIcon>
  );
  
  const handleSubmit = (values) => {
    // Validate client selection
    if (selectedClientIds.length === 0) {
      form.setFieldError("content", tc('pleaseSelectAtLeastOneClient'));
      return;
    }

    if (onSubmit) {
      const formattedData = {
        ...values,
        deliveryType: values.delivery === "now" ? "send_now" : values.delivery === "later" ? "send_later" : values.delivery,
        clientIds: selectedClientIds,
      };
      onSubmit(formattedData);
    }
  };

  return (
    <div>
      <form className="mt-10" onSubmit={form.onSubmit(handleSubmit)}>
        <div className="mt-2">
          <p className="text-sm text-slate-600 mb-2 ">{tc('smsContent')}</p>
          <Textarea
            placeholder={tc('smsContentPlaceholder')}
            variant="filled"
            rows={5}
            {...form.getInputProps("content")}
          />
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">{tc('selectClients')}</p>
          <ClientSelector
            selectedClientIds={selectedClientIds}
            onSelectionChange={setSelectedClientIds}
            filterBy="phone"
          />
        </div>

        <Divider my={30} />
        <div>
          <p className="text-xl text-slate-900">{tc('deliveryTimeline')}</p>
          <Radio.Group name="delivery" {...form.getInputProps("delivery")}>
            <div className="flex items-center gap-4 mt-6">
              <Radio
                label={tc('sendNow')}
                color="#0D0D0D"
                value="now"
              />
              <Radio
                label={tc('sendLater')}
                color="#0D0D0D"
                value="later"
              />
              <Radio
                label={tc('recurring')}
                color="#0D0D0D"
                value="recurring"
              />
            </div>
          </Radio.Group>
          {form?.values?.delivery == "later" && (
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-600 ">{tc('date')}</p>
                <DatePickerInput
                  placeholder={tc('dateInput')}
                  variant="filled"
                  size="md"
                  radius={10}
                  rightSection={datePickerControl}
                  {...form.getInputProps("date")}
                />
              </div>
              <div>
                <p className="text-sm text-slate-600 ">{tc('timeOfDay')}</p>
                <TimeInput
                  ref={timeRef}
                  variant="filled"
                  size="md"
                  radius={10}
                  rightSection={timePickerControl}
                  {...form.getInputProps("time")}
                />
              </div>
            </div>
          )}
          {form?.values?.delivery == "recurring" && (
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-600 ">
                  {tc('recurringInterval')}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  {tc('recurringIntervalDescription')}
                </p>
                <NumberInput
                  placeholder={tc('exampleThirty')}
                  variant="filled"
                  size="md"
                  radius={10}
                  min={1}
                  {...form.getInputProps("recurringInterval")}
                />
              </div>
            </div>
          )}
        </div>
        {/* Hidden submit button for external form submission */}
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  );
};

export default PushSMSForm;
