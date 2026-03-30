import React, { useRef, useEffect, useState } from "react";
import { ImageIcon } from "../../icons";
import {
  ActionIcon,
  Button,
  CheckIcon,
  Divider,
  Radio,
  Textarea,
  NumberInput,
  TextInput,
  Select,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { GoClock, GoCalendar } from "react-icons/go"; 
import { useForm } from "@mantine/form";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";
import ClientSelector from "./ClientSelector";

const PushMessageForm = ({ onSubmit, recipientGroups, isLoading }) => {
  const { tc } = useBatchTranslation();
  const [recipientType, setRecipientType] = useState("group"); // "group" or "select"
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  
  const form = useForm({
    initialValues: {
      subject: "",
      message: "",
      recipientGroup: "",
      deliveryOption: "",
      scheduledDate: null,
      scheduledTime: "",
      recurringInterval: 21,
    },

    validate: {
      subject: (value) =>
        value.length < 3 ? tc('subjectMinLength') : null,
      message: (value) =>
        value.length < 10 ? tc('messageMinLength') : null,
      recipientGroup: (value, values) => {
        if (recipientType === "group" && !value) {
          return tc('selectRecipientGroupError');
        }
        return null;
      },
      deliveryOption: (value) => (!value ? tc('selectDeliveryTimeline') : null),
      scheduledDate: (value, values) =>
        (values?.deliveryOption === "scheduled" || values?.deliveryOption === "recurring") && !value ? tc('selectDeliveryDate') : null,
      scheduledTime: (value, values) =>
        (values?.deliveryOption === "scheduled" || values?.deliveryOption === "recurring") && !value ? tc('selectDeliveryTime') : null,
    },
  });

  useEffect(() => {
    if (onSubmit) {
      const handleSubmit = (values) => {
        const formattedData = {
          ...values,
          deliveryOption: values.deliveryOption === "now" ? "immediate" : values.deliveryOption === "later" ? "scheduled" : values.deliveryOption,
        };
        onSubmit(formattedData);
      };
    }
  }, [onSubmit]);
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

  return (
    <div>
      <form className="mt-10" onSubmit={form.onSubmit((values) => {
        // Validate client selection if using select mode
        if (recipientType === "select" && selectedClientIds.length === 0) {
          form.setFieldError("recipientGroup", tc('pleaseSelectAtLeastOneClient'));
          return;
        }

        const formattedData = {
          ...values,
          deliveryOption: values.deliveryOption === "now" ? "immediate" : values.deliveryOption === "later" ? "scheduled" : values.deliveryOption,
          // Include clientIds if using select mode, otherwise use recipientGroup
          ...(recipientType === "select" && selectedClientIds.length > 0
            ? { clientIds: selectedClientIds, recipientGroup: undefined }
            : { recipientGroup: values.recipientGroup }),
        };
        onSubmit && onSubmit(formattedData);
      })}>
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">{tc('selectRecipients')}</p>
          <Radio.Group
            value={recipientType}
            onChange={setRecipientType}
            className="mb-4"
          >
            <div className="flex items-center gap-4">
              <Radio
                label={tc('useRecipientGroup')}
                color="#0D0D0D"
                value="group"
              />
              <Radio
                label={tc('selectSpecificClients')}
                color="#0D0D0D"
                value="select"
              />
            </div>
          </Radio.Group>

          {recipientType === "group" ? (
            <Select
              placeholder={tc('selectRecipientGroup')}
              variant="filled"
              size="md"
              radius={10}
              data={Array.isArray(recipientGroups) ? recipientGroups.map(group => ({
                value: group.value,
                label: `${group.label} (${group.count} ${tc('clients')})`
              })) : []}
              {...form.getInputProps("recipientGroup")}
            />
          ) : (
            <ClientSelector
              selectedClientIds={selectedClientIds}
              onSelectionChange={setSelectedClientIds}
              filterBy="email"
            />
          )}
        </div>
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">{tc('emailSubject')}</p>
          <TextInput
            placeholder={tc('enterEmailSubject')}
            variant="filled"
            size="md"
            radius={10}
            {...form.getInputProps("subject")}
          />
        </div>
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">{tc('emailContent')}</p>
          <p className="text-xs text-slate-500 mb-2">
            {tc('personalizeMessage')}
          </p>
          <Textarea
            placeholder={tc('helloFirstNameOffer')}
            variant="filled"
            rows={6}
            {...form.getInputProps("message")}
          />
        </div>
        <Divider my={30} />
        <div>
          <p className="text-xl text-slate-900">{tc('deliveryTimeline')}</p>
          <Radio.Group name="deliveryOption" {...form.getInputProps("deliveryOption")}>
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
          {(form?.values?.deliveryOption === "later" || form?.values?.deliveryOption === "recurring") && (
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-600 ">{tc('date')}</p>
                <DatePickerInput
                  placeholder={tc('dateInput')}
                  variant="filled"
                  size="md"
                  radius={10}
                  rightSection={datePickerControl}
                  {...form.getInputProps("scheduledDate")}
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
                  {...form.getInputProps("scheduledTime")}
                />
              </div>
            </div>
          )}
          {form?.values?.deliveryOption === "recurring" && (
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
      </form>
    </div>
  );
};

export default PushMessageForm;
