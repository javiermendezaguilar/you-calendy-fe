import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  PasswordInput,
  Box,
  Switch,
  Text,
  Title,
  Loader,
  Skeleton,
} from "@mantine/core";
import { useForm, isNotEmpty, isEmail, matches, hasLength } from "@mantine/form";
import { toast } from "sonner";
import {
  FaUserCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";
import { useGetProfileSettings, useUpdateProfileSettings } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const Setting = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const queryClient = useQueryClient();
  const { tc } = useBatchTranslation();

  const { data: profileData, isLoading } = useGetProfileSettings();
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateProfileSettings();

  const profileForm = useForm({
    initialValues: {
      fullName: "",
      email: "",
    },
    validate: {
      fullName: isNotEmpty(tc('fullNameRequired')),
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
    if (profileData) {
      profileForm.setValues({
        fullName: profileData.data.name,
        email: profileData.data.email,
      });
      // Only update profileImage if we don't have a pending file change
      if (!profileImageFile && profileData.data.profileImage) {
        setProfileImage(profileData.data.profileImage);
      }
    }
  }, [profileData, profileImageFile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setProfileImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImageFile("REMOVE"); // Flag to indicate image should be removed
  };

  const handleSaveChanges = () => {
    const profileValid = profileForm.validate();
    const passwordValid = passwordForm.validate();

    if (profileValid.hasErrors || passwordValid.hasErrors) {
      return;
    }

    const values = {
      ...profileForm.values,
      ...passwordForm.values
    }

    const payload = {};
    if (values.fullName !== profileData.data.name) {
      payload.fullName = values.fullName;
    }
    if (profileImageFile) {
      if (profileImageFile === "REMOVE") {
        payload.removeProfileImage = true;
      } else {
        payload.profileImage = profileImageFile;
      }
    }
    if (values.newPassword) {
      payload.newPassword = values.newPassword;
      payload.currentPassword = values.currentPassword;
      payload.confirmPassword = values.confirmPassword;
    }

    if (Object.keys(payload).length === 0) {
      toast.warning(tc('noChangesToSave'));
      return;
    }

    updateProfile(payload, {
      onSuccess: (data) => {
        toast.success(tc('profileUpdatedSuccessfully'));
        queryClient.invalidateQueries(["profile-settings"]);
        // Reset password form after successful update
        passwordForm.reset();
        // Reset image states after successful update
        setProfileImageFile(null);
        // After update, ensure profileImage state is updated
        if (profileImageFile === "REMOVE") {
          setProfileImage(null);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || tc('failedToUpdateProfile'));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-[83vh] overflow-auto bg-[#F4F6F8]">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-between mb-6">
            <Skeleton height={40} width="25%" />
            <Skeleton height={46} width={150} />
          </div>
          <div className="mb-10">
            <div className="flex flex-row items-center gap-6 mb-6">
              <Skeleton height={140} circle />
              <div className="flex flex-col gap-2">
                <Skeleton height={46} width={160} />
                <Skeleton height={46} width={160} />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Skeleton height={20} width="10%" mb={10} />
                <Skeleton height={46} className="!w-full lg:!w-[80%]" />
              </div>
              <div>
                <Skeleton height={20} width="10%" mb={10} />
                <Skeleton height={46} className="!w-full lg:!w-[80%]" />
              </div>
            </div>
          </div>
          <div className="border-t border-[#EBEBEB] mb-10 w-full lg:w-[80%]"></div>
          <div className="mb-10 w-full lg:w-[80%]">
            <Skeleton height={30} width="40%" mb={20} />
            <div className="space-y-4">
              <div>
                <Skeleton height={20} width="20%" mb={10} />
                <Skeleton height={46} />
              </div>
              <div>
                <Skeleton height={20} width="20%" mb={10} />
                <Skeleton height={46} />
              </div>
              <div>
                <Skeleton height={20} width="20%" mb={10} />
                <Skeleton height={46} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BatchTranslationLoader>
      <div className="h-[83vh] overflow-auto bg-[#F4F6F8]">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-between mb-6">
            <Title
              order={2}
              className="!text-[#323334] !text-2xl sm:!text-3xl !font-bold !leading-tight"
            >
              {tc('userProfile')}
            </Title>
            <Button
              size="md"
              radius="md"
              onClick={handleSaveChanges}
              className="!bg-[#323334] hover:!bg-[#414546] !h-[46px] !px-3 sm:!px-6 !font-normal !whitespace-nowrap !min-w-fit"
              loading={isUpdating}
            >
              {tc('saveChanges')}
            </Button>
          </div>

          <div className="mb-10">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-row items-center gap-6">
                <div className="w-30 h-30 lg:w-[140px] lg:h-[140px] rounded-full overflow-hidden border-2 border-dashed border-[#EBEBEB] bg-[#F9F9F9]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#323334]">
                      <FaUserCircle size={140} />
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
                    className="!bg-[#F9F9F9] !text-[#323334] hover:!bg-[#EBEBEB] !h-[46px] !font-normal"
                    onClick={handleRemoveImage}
                    w={160}
                  >
                    {tc('remove')}
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Text className="!text-[#7898AB] !mb-2">
                    {tc('fullName')}
                  </Text>
                  <TextInput
                    placeholder={tc('fullName')}
                    className="!w-full lg:!w-[80%]"
                    classNames={{
                      input: '!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal'
                    }}
                    {...profileForm.getInputProps("fullName")}
                  />
                </div>
                <div>
                  <Text className="!text-[#7898AB] !mb-2">
                    {tc('email')}
                  </Text>
                  <TextInput
                    value={profileForm.values.email}
                    readOnly
                    rightSection={
                      <Box className="!text-gray-500">
                        <FaLock size={16} />
                      </Box>
                    }
                    className="!w-full lg:!w-[80%]"
                    classNames={{
                      input: '!h-[46px] !border !border-[#EBEBEB] !rounded-xl !bg-[#F9F9F9] !text-sm !font-normal'
                    }}
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
            <div className="p-5 bg-[#F9F9F9] mb-10 rounded-xl w-[90%]">
              <Text className="!text-[#7898AB] !text-sm">
                {tc('passwordRequirements')}
              </Text>
            </div>

            <div className="space-y-4">
              <div>
                <Text className="!text-[#7898AB]">
                  {tc('currentPassword')}
                </Text>
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
                <Text className="!text-[#7898AB]">
                  {tc('newPassword')}
                </Text>
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
                <Text className="!text-[#7898AB]">
                  {tc('confirmNewPassword')}
                </Text>
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
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default Setting;
