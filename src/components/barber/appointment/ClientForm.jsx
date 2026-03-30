import { Button, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";

const ClientForm = ({ onUnregisteredClientAdd }) => {
  const { tc } = useBatchTranslation();
  const [photos, setPhotos] = useState([]);
  
  // Form for unregistered client (walk-in, phone booking)
  const unregisteredForm = useForm({
    initialValues: { 
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      internalNotes: "",
    },
    validate: {
      firstName: (value) => (!value ? tc('firstNameRequired') : null),
      lastName: (value) => (!value ? tc('lastNameRequired') : null),
      phone: (value) => (!value ? tc('phoneNumberRequired') : null),
    },
  });

  const handleUnregisteredSubmit = (values) => {
    if (onUnregisteredClientAdd) {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('phone', values.phone);
      if (values.email) formData.append('email', values.email);
      if (values.internalNotes) formData.append('internalNotes', values.internalNotes);
      
      photos.forEach((photo) => {
        formData.append('haircutPhotos', photo);
      });

      onUnregisteredClientAdd(formData);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <p className="text-2xl font-semibold my-6">{tc('addNewClient')}</p>
      
      <p className="text-sm text-gray-600 mb-4">
        {tc('unregisteredClientDescription')}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const validation = unregisteredForm.validate();
          if (!validation.hasErrors) {
            handleUnregisteredSubmit(unregisteredForm.values);
          }
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <label>
            <p className="text-[#7184B4] font-light text-sm mb-1">{tc('firstName')} *</p>
            <TextInput
              value={unregisteredForm.values.firstName}
              onChange={(e) => unregisteredForm.setFieldValue('firstName', e.target.value)}
              placeholder={tc('enterFirstName')}
              radius={10}
              size="md"
              styles={{
                input: {
                  backgroundColor: "#f0f3f5",
                  border: "none",
                  height: "45px",
                },
              }}
            />
            {unregisteredForm.errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{unregisteredForm.errors.firstName}</p>
            )}
          </label>

          <label>
            <p className="text-[#7184B4] font-light text-sm mb-1">{tc('lastName')} *</p>
            <TextInput
              value={unregisteredForm.values.lastName}
              onChange={(e) => unregisteredForm.setFieldValue('lastName', e.target.value)}
              placeholder={tc('enterLastName')}
              radius={10}
              size="md"
              styles={{
                input: {
                  backgroundColor: "#f0f3f5",
                  border: "none",
                  height: "45px",
                },
              }}
            />
            {unregisteredForm.errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{unregisteredForm.errors.lastName}</p>
            )}
          </label>
        </div>

        <label>
          <p className="text-[#7184B4] font-light text-sm mb-1">{tc('phoneNumber')} *</p>
          <PhoneInput
            country={"us"}
            value={unregisteredForm.values.phone}
            onChange={(phone) => {
              unregisteredForm.setFieldValue('phone', phone);
              unregisteredForm.clearFieldError('phone');
            }}
            inputStyle={{
              width: "100%",
              height: "45px",
              backgroundColor: "#f0f3f5",
              border: "none",
              borderRadius: "10px",
            }}
            containerStyle={{
              width: "100%"
            }}
          />
          {unregisteredForm.errors.phone && (
            <p className="text-red-500 text-xs mt-1">{unregisteredForm.errors.phone}</p>
          )}
        </label>

        <label>
          <p className="text-[#7184B4] font-light text-sm mb-1">{tc('email')} ({tc('optional')})</p>
          <TextInput
            value={unregisteredForm.values.email}
            onChange={(e) => unregisteredForm.setFieldValue('email', e.target.value)}
            placeholder={tc('enterEmail')}
            radius={10}
            size="md"
            styles={{
              input: {
                backgroundColor: "#f0f3f5",
                border: "none",
                height: "45px",
              },
            }}
          />
        </label>

        <label>
          <p className="text-[#7184B4] font-light text-sm mb-1">{tc('internalNotes')} ({tc('optional')})</p>
          <Textarea
            value={unregisteredForm.values.internalNotes}
            onChange={(e) => unregisteredForm.setFieldValue('internalNotes', e.target.value)}
            placeholder={tc('internalNotesPlaceholder')}
            minRows={3}
            radius={10}
            styles={{
              input: {
                backgroundColor: "#f0f3f5",
                border: "none",
              },
            }}
          />
        </label>

        <label>
          <p className="text-[#7184B4] font-light text-sm mb-1">{tc('haircutPhotos')} ({tc('optional')})</p>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="haircut-photos-upload"
            />
            <Button
              component="label"
              htmlFor="haircut-photos-upload"
              variant="outline"
              color="#7184B4"
              radius={10}
              styles={{
                root: {
                  border: "1px dashed #7184B4",
                  height: "45px",
                },
              }}
            >
              {photos.length > 0 
                ? `${photos.length} ${tc('photosSelected')}` 
                : tc('selectPhotos')}
            </Button>
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((photo, index) => (
                  <div key={index} className="text-[10px] bg-slate-100 px-2 py-1 rounded">
                    {photo.name.length > 15 ? photo.name.substring(0, 15) + '...' : photo.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>

        <div className="flex mt-4">
          <Button 
            type="submit"
            w={"100%"} 
            radius={10} 
            size="md" 
            color="dark"
          >
            {tc('addClient')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
