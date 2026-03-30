import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  PasswordInput,
  Box,
  Switch,
  Text,
  Title,
  Skeleton,
} from "@mantine/core";
import { useForm, isNotEmpty, isEmail, matches, hasLength } from "@mantine/form";
import { FaUserCircle, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useUpdateAdminPassword,
  useUpdateAdminNotifications,
} from "../../hooks/useAdmin";
import { toast } from "sonner";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const AdminProfileSkeleton = () => {
  return (
    <div className="h-[83vh] overflow-auto bg-[#F4F6F8]">
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Skeleton height={30} width={150} />
          <Skeleton height={46} width={130} radius="md" />
        </div>

        <div className="mb-10">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-row items-center gap-6">
              <Skeleton height={120} circle />
              <div className="flex flex-col gap-2">
                <Skeleton height={46} width={160} radius="md" />
                <Skeleton height={46} width={160} radius="md" />
              </div>
            </div>
            <div className="flex-1 space-y-4 mt-6">
              <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-[80%]">
                <div className="flex-1">
                  <Skeleton height={16} width={100} mb="sm" />
                  <Skeleton height={46} radius="xl" />
                </div>
                <div className="flex-1">
                  <Skeleton height={16} width={100} mb="sm" />
                  <Skeleton height={46} radius="xl" />
                </div>
              </div>
              <div>
                <Skeleton height={16} width={120} mb="sm" />
                <Skeleton height={46} radius="xl" className="!w-full lg:!w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        <Skeleton height={1} className="mb-10 w-full lg:w-[80%]" />

        <div className="mb-10 w-full lg:w-[80%]">
          <Skeleton height={28} width={250} className="mb-3" />
          <Skeleton height={50} className="mb-10 w-[90%]" radius="xl" />
          <div className="space-y-4">
            <Skeleton height={46} radius="xl" />
            <Skeleton height={46} radius="xl" />
            <Skeleton height={46} radius="xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProfile = () => {
  const { tc } = useBatchTranslation();
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const { data: admin, isLoading: isLoadingProfile } = useAdminProfile();
  const { mutate: updateProfile, isLoading: isUpdatingProfile } = useUpdateAdminProfile();
  const { mutate: updatePassword, isLoading: isUpdatingPassword } = useUpdateAdminPassword();
  const { mutate: updateNotifications } = useUpdateAdminNotifications();

  const profileForm = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validate: {
      firstName: isNotEmpty(tc('firstNameRequired')),
      lastName: isNotEmpty(tc('lastNameRequired')),
      email: isEmail(tc('pleaseEnterValidEmail')),
    },
    validateInputOnBlur: true,
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value, values) => {
        if (values.newPassword && !value) {
          return tc('currentPasswordRequired');
        }
        return null;
      },
      newPassword: (value) => {
        if (!value) return null;
        const errors = [];
        // Enforce minimum length of 8 and complexity: uppercase, lowercase, number
        const lengthError = hasLength({ min: 8 }, tc('passwordMinLength'))(value);
        if (lengthError) {
          errors.push(lengthError);
        }

        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        const complexityError = matches(complexityRegex, tc('passwordRequirements'))(value);
        if (complexityError) {
          errors.push(complexityError);
        }

        return errors.length > 0 ? errors.join(", ") : null;
      },
      confirmPassword: (value, values) => {
        if (values.newPassword && !value) return tc('pleaseConfirmPassword');
        return value !== values.newPassword ? tc('passwordsDoNotMatch') : null;
      },
    },
    validateInputOnChange: ['confirmPassword'],
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (admin) {
      const nameParts = admin.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      profileForm.setValues({
        firstName: firstName,
        lastName: lastName,
        email: admin.email,
      });
      // Fix: admin.profileImage is a string URL directly, not an object with url property
      setProfileImagePreview(admin.profileImage);
    }
  }, [admin]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile("REMOVE"); // Flag to indicate image should be removed
    setProfileImagePreview(null);
  };

  const handleSaveChanges = () => {
    if (profileForm.isDirty() || profileImageFile) {
      const profileResult = profileForm.validate();
      if (!profileResult.hasErrors) {
        const formData = new FormData();
        formData.append("firstName", profileForm.values.firstName);
        formData.append("lastName", profileForm.values.lastName);
        
        // Handle profile image changes
        if (profileImageFile) {
          if (profileImageFile === "REMOVE") {
            formData.append("removeProfileImage", "true");
          } else {
            formData.append("profileImage", profileImageFile);
          }
        }
        
        updateProfile(formData, {
          onSuccess: () => {
            // Reset the profile image file state after successful update
            setProfileImageFile(null);
          }
        });
      }
    }

    if (passwordForm.isDirty() && passwordForm.values.newPassword) {
      const passwordResult = passwordForm.validate();
      if (!passwordResult.hasErrors) {
        updatePassword({
          currentPassword: passwordForm.values.currentPassword,
          newPassword: passwordForm.values.newPassword,
        }, {
          onSuccess: () => passwordForm.reset(),
        });
      }
    } else if (passwordForm.isDirty() && !passwordForm.values.newPassword) {
        toast.error(tc('pleaseEnterNewPasswordToUpdate'));
    }
  };

  const handleNotificationChange = (key, checked) => {
    updateNotifications({ [key]: checked });
  };
  
  if (isLoadingProfile) {
    return <AdminProfileSkeleton />;
  }

  return (
    <BatchTranslationLoader>
      <div className="h-[83vh] overflow-auto bg-[#F4F6F8]">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <Text className="!text-[#323334] !text-2xl font-semibold">{tc('userProfile')}</Text>
            <Button
              size="md"
              radius="md"
              onClick={handleSaveChanges}
              className="!bg-[#323334] hover:!bg-[#414546] !h-[46px] !px-6 !font-normal"
              loading={isUpdatingProfile || isUpdatingPassword}
            >
              {tc('saveChanges')}
            </Button>
          </div>

          <div className="mb-10">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-row items-center gap-6">
                <div className="w-30 h-30 lg:w-[120px] lg:h-[120px] rounded-full overflow-hidden border-2 border-dashed border-[#EBEBEB] bg-[#F9F9F9]">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#323334]">
                      <FaUserCircle size={120} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    radius="md"
                    size="md"
                    className="!bg-[#323334] hover:!bg-[#414546] !h-[46px] !font-normal"
                    onClick={() => document.getElementById("profileImage").click()}
                    w={160}
                  >
                    {tc('chooseFile')}
                  </Button>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    radius="md"
                    size="md"
                    variant="light"
                    className="!bg-[#F9F9F9] !text-[#323334] hover:!bg-[#EBEBEB] !h-[46px] !font-normal !border !border-[#323334]"
                    onClick={handleRemoveImage}
                    w={160}
                  >
                    {tc('remove')}
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-[80%]">
                  <div className="flex-1">
                    <Text className="!text-[#6D94C9] !mb-2">{tc('firstName')}</Text>
                    <TextInput
                      placeholder={tc('enterFirstName')}
                      classNames={{
                        input:
                          "!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal",
                      }}
                      {...profileForm.getInputProps("firstName")}
                    />
                  </div>
                  <div className="flex-1">
                    <Text className="!text-[#6D94C9] !mb-2">{tc('lastName')}</Text>
                    <TextInput
                      placeholder={tc('enterLastName')}
                      classNames={{
                        input:
                          "!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal",
                      }}
                      {...profileForm.getInputProps("lastName")}
                    />
                  </div>
                </div>
                <div>
                  <Text className="!text-[#6D94C9] !mb-2">{tc('emailAddress')}</Text>
                  <TextInput
                    readOnly
                    rightSection={
                      <Box className="!text-gray-500">
                        <FaLock size={16} />
                      </Box>
                    }
                    className="!w-full lg:!w-[80%]"
                    classNames={{
                      input:
                        "!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal",
                    }}
                    {...profileForm.getInputProps("email")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#EBEBEB] mb-10 w-full lg:w-[80%]"></div>

          <div className="mb-10 w-full lg:w-[80%]">
            <Title order={3} className="!text-[#323334] !text-xl sm:!text-2xl !font-semibold !mb-3">
              {tc('passwordSecurity')}
            </Title>
            <div className="p-5 bg-[#F9F9F9] mb-10 rounded-xl lg:w-[90%]">
              <Text className="!text-[#323334] !text-sm">
                {tc('yourPasswordMustBeAtLeast6Characters')}
              </Text>
            </div>

            <div className="space-y-4">
              <div>
                <PasswordInput
                  placeholder={tc('currentPassword')}
                  autoComplete="new-password"
                  classNames={{
                    input: '!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal'
                  }}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <FaEyeSlash size={16} /> : <FaEye size={16} />
                  }
                  {...passwordForm.getInputProps("currentPassword")}
                />
              </div>
              <div>
                <PasswordInput
                  placeholder={tc('newPassword')}
                  autoComplete="new-password"
                  classNames={{
                    input: '!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal'
                  }}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <FaEyeSlash size={16} /> : <FaEye size={16} />
                  }
                  {...passwordForm.getInputProps("newPassword")}
                />
              </div>
              <div>
                <PasswordInput
                  placeholder={tc('confirmNewPassword')}
                  autoComplete="new-password"
                  classNames={{
                    input: '!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal'
                  }}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <FaEyeSlash size={16} /> : <FaEye size={16} />
                  }
                  {...passwordForm.getInputProps("confirmPassword")}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#EBEBEB] mb-10 w-full lg:w-[80%]"></div>

          <div className="mb-10 w-full lg:w-[80%]">
            <Title
              order={3}
              className="!text-[#323334] !text-xl sm:!text-2xl !font-semibold !mb-6"
            >
              {tc('notifications')}
            </Title>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Text className="!text-[#6D94C9]">
                    {tc('newBarberRegistrations')}
                  </Text>
                  <Text className="!text-[#323334] !text-sm">
                    {tc('getNotifiedWheneverNewBarberCompletesOnboarding')}
                  </Text>
                </div>
                <Switch
                  size="lg"
                  color="#7D9A4B"
                  checked={admin?.notificationSettings?.barberRegistration || false}
                  onChange={(event) =>
                    handleNotificationChange(
                      "barberRegistration",
                      event.currentTarget.checked
                    )
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <Text className="!text-[#6D94C9]">
                    {tc('subscriptionExpiryAlerts')}
                  </Text>
                  <Text className="!text-[#323334] !text-sm">
                    {tc('receiveAlertsWhenBarberSubscriptionAboutToExpire')}
                  </Text>
                </div>
                <Switch
                  size="lg"
                  color="#7D9A4B"
                  checked={admin?.notificationSettings?.subscriptionExpiry || false}
                  onChange={(event) =>
                    handleNotificationChange(
                      "subscriptionExpiry",
                      event.currentTarget.checked
                    )
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <Text className="!text-[#6D94C9]">
                    {tc('highAppointmentVolume')}
                  </Text>
                  <Text className="!text-[#323334] !text-sm">
                    {tc('stayInformedIfBarberExperiencesSuddenSpikeInBookings')}
                  </Text>
                </div>
                <Switch
                  size="lg"
                  color="#7D9A4B"
                  checked={admin?.notificationSettings?.bookingSpike || false}
                  onChange={(event) =>
                    handleNotificationChange(
                      "bookingSpike",
                      event.currentTarget.checked
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default AdminProfile;
