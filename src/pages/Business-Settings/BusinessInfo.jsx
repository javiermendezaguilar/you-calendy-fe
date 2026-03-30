import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, X, Edit, ChevronDown, Copy, Check } from "lucide-react";
import {
  TextInput,
  Textarea,
  Button,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { USFlagIcon } from "../../components/common/Svgs";
import { LightInstagramIcon } from "../../components/common/Svgs";
import { LightFacebookIcon } from "../../components/common/Svgs";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  useGetBusiness,
  useUpdateBusinessInfo,
} from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const BusinessInfo = () => {
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  const { data: businessData, isLoading: isFetching } = useGetBusiness();
  const { mutate: updateInfo, isPending: isSaving } = useUpdateBusinessInfo();
  const [copied, setCopied] = useState(false);

  const form = useForm({
    initialValues: {
      businessName: "",
      phoneNumber: "",
      email: "",
      description: "",
      instagram: "",
      facebook: "",
      website: "",
      onlineShop: "",
      twitter: "",
      googlePlaceId: "",
      googleReviewUrl: "",
    },
    validate: {
      businessName: (value) => (!value ? tc('businessNameRequired') : null),
      phoneNumber: (value) => (!value ? tc('phoneNumberRequired') : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : tc('invalidEmail')),
    },
  });

  useEffect(() => {
    if (businessData?.data) {
      const { data } = businessData;
      form.setValues({
        businessName: data.name || "",
        phoneNumber: data.contactInfo?.phone || "",
        email: data.contactInfo?.email || "",
        description: data.contactInfo?.description || "",
        instagram: data.socialMedia?.instagram || "",
        facebook: data.socialMedia?.facebook || "",
        twitter: data.socialMedia?.twitter || "",
        website: data.socialMedia?.website || "",
        onlineShop: data.socialMedia?.onlineShop || "",
        googlePlaceId: data.googlePlaceId || "",
        googleReviewUrl: data.googleReviewUrl || "",
      });
    }
  }, [businessData]);

  const handleSave = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      console.log("Saving business info:", form.values);
      const payload = {
        name: form.values.businessName,
        phone: form.values.phoneNumber,
        email: form.values.email,
        description: form.values.description,
        publicUrl: form.values.profileLink,
        instagram: form.values.instagram,
        facebook: form.values.facebook,
        twitter: form.values.twitter,
        website: form.values.website,
        onlineShop: form.values.onlineShop,
        googlePlaceId: form.values.googlePlaceId,
        googleReviewUrl: form.values.googleReviewUrl,
      };
      updateInfo(payload, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    }
  };

  const handleCopyLink = async () => {
    const publicUrl = businessData?.data?.contactInfo?.publicUrl;
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <BatchTranslationLoader>
      <main className="h-[83vh] overflow-auto bg-white p-6 rounded-xl max-md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 sm:gap-0">
          <Link to={-1} className="flex w-auto">
            <Button
              size="lg"
              className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:!text-sm max-md:!py-2 max-md:!px-4 max-md:size-md"
            >
              <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
            </Button>
          </Link>

          <Button
            className="!py-2 !sm:py-3 !px-6 !sm:px-10 !w-30 !h-12 !bg-[#323334] !text-white !rounded-lg !text-[16px] !sm:text-base max-md:!w-full"
            onClick={handleSave}
            loading={isSaving || isFetching}
          >
            {tc('save')}
          </Button>
        </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1">
          <h2 className="text-2xl font-medium text-[#323334] mb-8 max-md:text-xl max-md:mb-4">
            {tc('generalInfo')}
          </h2>

          <div className="flex flex-col gap-6 max-md:gap-4">
            <TextInput
              label={tc('businessNameLabel')}
              placeholder={tc('businessNamePlaceholder')}
              {...form.getInputProps("businessName")}
              className="w-full"
              classNames={{
                input:
                  "!h-[50px] !border !border-[#EBEBEB] !rounded-lg !bg-[#F9F9F9] max-md:!h-[45px]",
                label: "text-[#7898AB] text-sm mb-2",
              }}
            />

            <div>
              <label className="text-[#7898AB] text-sm mb-2 block">
                {tc('phoneNumberLabel')}
              </label>
              <PhoneInput
                country={"us"}
                value={form.values.phoneNumber}
                onChange={(phone) => form.setFieldValue("phoneNumber", phone)}
                inputStyle={{
                  width: "100%",
                  height: "50px",
                  backgroundColor: "#F9F9F9",
                  border: "1px solid #EBEBEB",
                  borderRadius: "8px",
                }}
                containerStyle={{
                  width: "100%",
                }}
                isValid={(value, country) => {
                  if (!value) {
                    form.setFieldError(
                      "phoneNumber",
                      tc('phoneNumberRequired')
                    );
                    return false;
                  }
                  return true;
                }}
              />
            </div>

            <TextInput
              label={tc('businessEmail')}
              placeholder={tc('enterEmailAddress')}
              {...form.getInputProps("email")}
              className="w-full"
              classNames={{
                input:
                  "!h-[50px] !border !border-[#EBEBEB] !rounded-lg !bg-[#F9F9F9] max-md:!h-[45px]",
                label: "text-[#7898AB] text-sm mb-2",
              }}
            />

            <div>
              <label className="text-[#7898AB] text-sm mb-2 flex items-center gap-1">
                {tc('linkToYourPublicProfile')}
                <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#F3F4F6] text-[#7898AB] text-xs cursor-help group">
                  ?
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Copy this URL to share your profile with clients
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                  </span>
                </span>
              </label>
              <div className="flex flex-col sm:flex-row w-full">
                <TextInput
                  placeholder={tc('hashtag')}
                  value={businessData?.data?.contactInfo?.publicUrl || ""}
                  className="flex-grow"
                  disabled={true}
                  readOnly={true}
                  classNames={{
                    input:
                      "!h-[50px] !border !border-[#EBEBEB] !rounded-l-lg !rounded-r-none !bg-white !text-black max-md:!h-[45px] max-md:!rounded-t-lg max-md:!rounded-b-none !cursor-not-allowed",
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#EAEAEA] flex items-center justify-center gap-2 py-3 px-4 border border-[#EBEBEB] sm:border-l-0 sm:border-t-1 border-t-0 !rounded-r-lg !rounded-l-none max-md:rounded-b-lg text-[#323334] text-sm md:text-base max-md:text-xs hover:bg-[#D5D5D5] transition-colors duration-200 cursor-pointer"
                  disabled={!businessData?.data?.contactInfo?.publicUrl}
                >
                  {copied ? (
                    <>
                      {tc('copied') || 'Copied'}
                      <Check size={16} className="text-green-600" />
                    </>
                  ) : (
                    <>
                      {tc('copy') || 'Copy'}
                      <Copy size={16} className="text-[#323334]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <Textarea
              placeholder={tc('shortDescriptionPlaceholder')}
              {...form.getInputProps("description")}
              minRows={4}
              className="max-md:minRows-3"
              classNames={{
                input: "!border !border-[#EBEBEB] !rounded-lg !bg-[#F9F9F9]",
              }}
            />

            <div className="border-t border-[#EBEBEB] pt-6 mt-2">
              <h3 className="text-lg font-medium text-[#323334] mb-4">
                {tc('googleReviewSettings')}
              </h3>
              
              <div className="flex flex-col gap-4">
                <TextInput
                  label={tc('googlePlaceId')}
                  placeholder={tc('googlePlaceIdPlaceholder')}
                  {...form.getInputProps("googlePlaceId")}
                  className="w-full"
                  classNames={{
                    input:
                      "!h-[50px] !border !border-[#EBEBEB] !rounded-lg !bg-[#F9F9F9] max-md:!h-[45px]",
                    label: "text-[#7898AB] text-sm mb-2",
                  }}
                />
                
                <div className="text-xs text-gray-500 -mt-2">
                  {tc('googlePlaceIdHelp')}
                </div>

                <div className="text-center text-sm text-gray-400">
                  {tc('or')}
                </div>

                <TextInput
                  label={tc('googleReviewUrl')}
                  placeholder={tc('googleReviewUrlPlaceholder')}
                  {...form.getInputProps("googleReviewUrl")}
                  className="w-full"
                  classNames={{
                    input:
                      "!h-[50px] !border !border-[#EBEBEB] !rounded-lg !bg-[#F9F9F9] max-md:!h-[45px]",
                    label: "text-[#7898AB] text-sm mb-2",
                  }}
                />
                
                <div className="text-xs text-gray-500 -mt-2">
                  {tc('googleReviewUrlHelp')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 mt-6 lg:mt-8">
          <h2 className="text-2xl font-medium text-[#323334] mb-8 max-md:text-xl max-md:mb-4">
            {tc('socialMedia')}
          </h2>

          <div className="flex flex-col gap-6 max-md:gap-4">
            <div className="flex">
              <div className="bg-[#F9F9F9] flex items-center justify-center w-12 h-12 border border-[#EBEBEB] border-r-0 rounded-l-lg max-md:w-10 max-md:h-10">
                <LightInstagramIcon className="w-6 h-6 max-md:w-5 max-md:h-5" />
              </div>
              <TextInput
                placeholder={tc('instagram')}
                {...form.getInputProps("instagram")}
                className="flex-grow"
                classNames={{
                  input:
                    "!h-[48px] !border !border-[#EBEBEB] !rounded-r-lg !rounded-l-none !bg-[#F9F9F9] max-md:!h-[40px]",
                }}
              />
            </div>

            <div className="flex">
              <div className="bg-[#F9F9F9] flex items-center justify-center w-12 h-12 border border-[#EBEBEB] border-r-0 rounded-l-lg max-md:w-10 max-md:h-10">
                <LightFacebookIcon className="w-6 h-6 max-md:w-5 max-md:h-5" />
              </div>
              <TextInput
                placeholder={tc('facebook')}
                {...form.getInputProps("facebook")}
                className="flex-grow"
                classNames={{
                  input:
                    "!h-[48px] !border !border-[#EBEBEB] !rounded-r-lg !rounded-l-none !bg-[#F9F9F9] max-md:!h-[40px]",
                }}
              />
            </div>

            <div className="flex">
              <div className="bg-[#F9F9F9] flex items-center justify-center w-12 h-12 border border-[#EBEBEB] border-r-0 rounded-l-lg max-md:w-10 max-md:h-10">
                <Globe size={20} className="text-[#9CA3AF] max-md:w-5 max-md:h-5" />
              </div>
              <TextInput
                placeholder={tc('twitter')}
                {...form.getInputProps("twitter")}
                className="flex-grow"
                classNames={{
                  input:
                    "!h-[48px] !border !border-[#EBEBEB] !rounded-r-lg !rounded-l-none !bg-[#F9F9F9] max-md:!h-[40px]",
                }}
              />
            </div>

            <div className="flex">
              <div className="bg-[#F9F9F9] flex items-center justify-center w-12 h-12 border border-[#EBEBEB] border-r-0 rounded-l-lg max-md:w-10 max-md:h-10">
                <Globe size={20} className="text-[#9CA3AF] max-md:w-5 max-md:h-5" />
              </div>
              <TextInput
                placeholder={tc('website')}
                {...form.getInputProps("website")}
                className="flex-grow"
                classNames={{
                  input:
                    "!h-[48px] !border !border-[#EBEBEB] !rounded-r-lg !rounded-l-none !bg-[#F9F9F9] max-md:!h-[40px]",
                }}
              />
            </div>

            <div className="flex">
              <div className="bg-[#F9F9F9] flex items-center justify-center w-12 h-12 border border-[#EBEBEB] border-r-0 rounded-l-lg max-md:w-10 max-md:h-10">
                <Globe size={20} className="text-[#9CA3AF] max-md:w-5 max-md:h-5" />
              </div>
              <TextInput
                placeholder={tc('onlineShop')}
                {...form.getInputProps("onlineShop")}
                className="flex-grow"
                classNames={{
                  input:
                    "!h-[48px] !border !border-[#EBEBEB] !rounded-r-lg !rounded-l-none !bg-[#F9F9F9] max-md:!h-[40px]",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
    </BatchTranslationLoader>
  );
};

export default BusinessInfo;
