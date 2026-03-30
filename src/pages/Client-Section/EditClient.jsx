import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, TextInput, Textarea, Select, Skeleton, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useGetClientById, useUpdateClient } from "../../hooks/useClients";
import { useGetStaff } from "../../hooks/useStaff";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const EditClient = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();
  
  const { data: clientData, isLoading: isFetchingClient } = useGetClientById(clientId);
  const { mutate: updateClient, isLoading: isUpdatingClient } = useUpdateClient(clientId);

  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
    validate: {
      firstName: (value) => (value.trim() ? null : tc('firstNameRequired')),
      lastName: (value) => (value.trim() ? null : tc('lastNameRequired')),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : tc('invalidEmail')),
      phone: (value) => (value.length > 5 ? null : tc('phoneNumberRequired')),
    },
  });
  
  useEffect(() => {
    if (clientData) {
        const client = clientData?.data?.client;
        const nameParts = client.fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        form.setValues({
            firstName: firstName,
            lastName: lastName,
            email: client.email,
            phone: client.phone || client.phoneNumber,
            notes: client.privateNotes || ""
        });
    }
  }, [clientData]);

  const handleSubmit = (values) => {
    const updatedData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      privateNotes: values.notes,
    };
    updateClient(updatedData, {
      onSuccess: () => {
        toast.success(tc('clientUpdatedSuccessfully'));
        queryClient.invalidateQueries(["clients"]);
        navigate("/dashboard/clients");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || tc('failedToUpdateClient'));
      },
    });
  };

  if (isFetchingClient) {
      return <div className="p-4 flex justify-center items-center h-full"><Skeleton /></div>
  }

  return (
    <div className="max-w-none w-full bg-white mx-auto p-4 rounded-lg h-[83vh] overflow-auto">
      <div className="flex justify-between items-start mb-6">
        <Link to={-1} className="flex w-auto">
          <Button
            size="lg"
            className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
          >
            <IoArrowBackCircleOutline size={24} className="me-2 hidden sm:block" />
            {tc('goBack')}
          </Button>
        </Link>
      </div>

      <p className="text-2xl text-slate-800 font-semibold">{tc('editClient')}</p>
      <p className="text-[#939799] text-md font-normal mt-1">
        {tc('updateClientDetailsBelow')}
      </p>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="w-full max-w-[500px] mt-8"
      >
        <div className="mb-6">
          <label className="text-sm font-medium text-[#7184B4] mb-2 block">
            {tc('firstName')}
          </label>
          <TextInput
            placeholder={tc('enterFirstName')}
            radius={10}
            size="md"
            variant="filled"
            {...form.getInputProps("firstName")}
          />
        </div>
        <div className="mb-6">
          <label className="text-sm font-medium text-[#7184B4] mb-2 block">
            {tc('lastName')}
          </label>
          <TextInput
            placeholder={tc('enterLastName')}
            radius={10}
            size="md"
            variant="filled"
            {...form.getInputProps("lastName")}
          />
        </div>
        <div className="mb-6">
          <label className="text-sm font-medium text-[#7184B4] mb-2 block">{tc('email')}</label>
          <TextInput
            placeholder={tc('enterEmailAddress')}
            type="email"
            radius={10}
            size="md"
            variant="filled"
            {...form.getInputProps("email")}
          />
        </div>
        <div className="mb-6">
          <label className="text-sm font-medium text-[#7184B4] mb-2 block">{tc('phoneNumber')}</label>
          <PhoneInput
            country={"us"}
            value={form.values.phone}
            onChange={(phone) => {
              form.setFieldValue("phone", phone);
              form.clearFieldError("phone");
            }}
            inputStyle={{
              width: "100%",
              height: "44px",
              backgroundColor: "#f1f3f5",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px"
            }}
            buttonStyle={{
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              backgroundColor: "#f1f3f5",
            }}
          />
          {form.errors.phone && <p className="text-red-500 text-xs mt-1">{form.errors.phone}</p>}
        </div>
        <div className="mb-6">
            <label className="text-sm font-medium text-[#7184B4] mb-2 block">{tc('privateNotes')}</label>
            <Textarea
                placeholder={tc('enterAdditionalNotes')}
                radius={10}
                size="md"
                rows={5}
                maxRows={5}
                variant="filled"
                {...form.getInputProps("notes")}
            />
        </div>
        <Button
            type="submit"
            size="md"
            radius={10}
            className="!bg-[#323334] !w-full !text-white mt-4"
            disabled={isUpdatingClient}
        >
            {isUpdatingClient ? tc('savingChanges') : tc('saveChanges')}
        </Button>
      </form>
    </div>
  );
};

export default EditClient;