import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Textarea, Select, Skeleton } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useCreateUnregisteredClient } from "../../hooks/useClients";
import { useGetStaff } from "../../hooks/useStaff";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import InvitationModal from "../../components/modals/InvitationModal";

const AddYourClients = () => {
  const { tc } = useBatchTranslation();
  
  const [activeTab, setActiveTab] = useState("general");
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const { mutate: addClient, isLoading } = useCreateUnregisteredClient();
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaff();
  const navigate = useNavigate();

  // Transform staff data for Select component
  const staffOptions = staffData?.data?.data?.staff?.map(staff => ({
    value: staff._id,
    label: `${staff.firstName} ${staff.lastName}${staff.position ? ` - ${staff.position}` : ''}`
  })) || [];

  const form = useForm({
    initialValues: {
      phone: "",
      staffId: "",
      notes: "",
    },
    validate: {
      phone: (value) => (value.length > 5 ? null : tc('phoneNumberRequired')),
      staffId: (value) => (!value ? tc('selectStaffMember') : null),
    },
  });

  const handleSubmit = (values) => {
    const clientData = {
      phone: values.phone,
      staffId: values.staffId,
      internalNotes: values.notes,
    };
    addClient(clientData, {
      onSuccess: () => {
        // Navigate to clients page
        navigate("/dashboard/clients");
      },
    });
  };

  return (
    <div className="max-w-none w-full bg-white mx-auto p-4 rounded-lg h-[83vh] overflow-auto">
      <div className="flex flex-wrap justify-between items-start mb-6">
        <Link to={-1} className="flex w-auto">
          <Button
            size="lg"
            className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
          >
            <IoArrowBackCircleOutline
              size={24}
              className="me-2 hidden sm:block"
            />{" "}
            {tc('goBack')}
          </Button>
        </Link>

        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            size="md"
            radius={10}
            className="!bg-[#323334] !w-40 !text-white"
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          >
            {tc('save')}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-2xl text-slate-800 font-semibold">
          {tc('addNewClient')}
        </p>
        <p className="text-[#939799] text-md font-normal mt-1">
          {tc('addClientDescription')}
        </p>

        <div className="relative flex mt-4 w-[300px] sm:w-[350px]">
          <div className="relative w-full bg-[#EFEFEF] rounded-lg h-12 flex items-center p-1">
            <button
              className={`flex justify-center items-center flex-1 h-12 z-10 transition-colors duration-300 cursor-pointer ${
                activeTab === "general" ? "text-white" : "text-[#323334]"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <span className="font-medium text-sm">{tc('generalInfo')}</span>
            </button>
            <button
              className={`flex justify-center items-center flex-1 h-12 z-10 transition-colors duration-300 cursor-pointer ${
                activeTab === "additional" ? "text-white" : "text-[#323334]"
              }`}
              onClick={() => setActiveTab("additional")}
            >
              <span className="font-medium text-sm">{tc('additionalInfo')}</span>
            </button>
            <div
              className={`absolute top-1 h-10 w-[calc(50%-2px)] bg-[#323334] rounded-lg transition-all duration-300 ${
                activeTab === "general" ? "left-1" : "left-[calc(50%+1px)]"
              }`}
            ></div>
          </div>
        </div>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="w-full max-w-[500px] mt-8"
        >
          {activeTab === "general" ? (
            <div className="space-y-6">
              <div className="mb-6">
                <label className="text-sm font-medium text-[#7184B4] mb-2 block">
                  {tc('phoneNumber')}
                </label>
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
                <label className="text-sm font-medium text-[#7184B4] mb-2 block">
                  {tc('assignToStaffMember')}
                </label>
                {isLoadingStaff ? (
                  <Skeleton height={44} radius={10} />
                ) : (
                  <Select
                    placeholder={tc('selectStaffMember')}
                    data={staffOptions}
                    value={form.values.staffId}
                    onChange={(value) => form.setFieldValue("staffId", value)}
                    radius={10}
                    size="md"
                    styles={{
                      input: {
                        backgroundColor: "#f1f3f5",
                        border: "none",
                        height: "44px",
                      },
                    }}
                    searchable
                    clearable
                  />
                )}
                {form.errors.staffId && <p className="text-red-500 text-xs mt-1">{form.errors.staffId}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {tc('clientWillBeAssociated')}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-sm font-medium text-[#7184B4] mb-2 block">
                {tc('privateNotesOptional')}
              </label>
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
          )}
        </form>
      </div>

      {/* Invitation Modal */}
      <InvitationModal
        opened={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setInvitationData(null);
          navigate("/dashboard/clients");
        }}
        invitationData={invitationData}
      />
    </div>
  );
};

export default AddYourClients;