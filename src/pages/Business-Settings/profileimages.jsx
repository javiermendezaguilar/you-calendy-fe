import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Image, FileButton, Button } from "@mantine/core";
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { CameraIcon } from "../../components/common/Svgs";
import { IoArrowBackCircleOutline } from "react-icons/io5";
// import Barbing from "../../assets/barbing.webp"; // Commented out - no longer using hardcoded image
import { toast } from "sonner";
import {
  useGetBusiness,
  useUpdateBusinessSettings,
} from "../../hooks/useBusiness";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const cn = (...inputs) => {
  return inputs.filter(Boolean).join(" ");
};


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

const validateImage = (file, tc) => {
  if (!file) return null;

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return tc('onlyJpegPngAllowed');
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Image size should not exceed 5MB';
  }

  return null;
};

const ImageUploadBox = ({
  icon,
  label,
  className,
  size = "medium",
  onClick,
  preview,
  isCircular = false,
  error,
}) => {
  const sizeClasses = {
    small: "w-[150px] h-[150px] ",
    medium: "w-[275px] h-[275px] max-sm:w-[200px] max-sm:h-[200px]",
    large: "w-full h-[240px] max-sm:h-[180px]",
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={onClick}
        className={cn(
          "border-2 flex max-w-full flex-col items-center justify-center border-[#E5E7EB] border-dashed cursor-pointer hover:bg-gray-50/5 transition-colors",
          isCircular ? "rounded-full" : "rounded-[18px]",
          error ? "border-red-500" : "",
          sizeClasses[size],
          className
        )}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            className={cn(
              "w-full h-full object-cover",
              isCircular ? "rounded-full" : "rounded-[18px]"
            )}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-[48px] h-[48px] flex items-center justify-center opacity-40 max-sm:w-[32px] max-sm:h-[32px]">
              {icon}
            </div>
            <div className="mt-3 text-[#6B7280] font-medium text-base text-center px-2 max-sm:mt-2 max-sm:text-sm">
              {label}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const MediaUpload1 = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-[#F9FAFB]  flex flex-col items-center justify-center p-6 rounded-[18px] max-sm:p-3",
        className
      )}
    >
      {children}
    </div>
  );
};

const MediaUpload2 = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-[#F9FAFB] w-[400px] flex flex-col items-start justify-start p-6 rounded-[18px] max-sm:p-3",
        className
      )}
    >
      {children}
    </div>
  );
};

const ProfileImages = () => {
  const { tc } = useBatchTranslation();
  const navigate = useNavigate();
  const { data: businessData, isLoading: isFetching } = useGetBusiness();
  const { mutate: updateSettings, isPending: isSaving } =
    useUpdateBusinessSettings();

  // Profile component state
  const [galleryImages, setGalleryImages] = React.useState([]);
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const fileInputRef = React.useRef(null);

  const form = useForm({
    
    initialValues: {
      logo: null,
      workspacePhotos: [],
      logoPreview: null,
      workspacePhotosPreview: [],
    },
    validate: {
      logo: (value) => validateImage(value, tc),
      workspacePhotos: (values) => {
        if (values.length > 5) {
          return 'Maximum 5 workspace photos allowed';
        }
        for (const file of values) {
          const error = validateImage(file, tc);
          if (error) return error;
        }
        return null;
      },

    }
  });

  useEffect(() => {
    if (businessData?.data) {
      const business = businessData.data;
      const profileImages = business.profileImages || {};
      
      // Set logo preview
      form.setFieldValue("logoPreview", profileImages.logo || null);
      
      // Set workplace photos preview
      form.setFieldValue(
        "workspacePhotosPreview",
        profileImages.workspacePhotos || []
      );

      // Set gallery images
      if (profileImages.galleryImages && profileImages.galleryImages.length > 0) {
        const existingImages = profileImages.galleryImages.map((url, index) => ({
          id: `existing-${index}`,
          url: url,
          isExisting: true
        }));
        
        // Preserve any preview images that are currently being uploaded
        setGalleryImages(prev => {
          const previewImages = prev.filter(img => img.file && !img.isExisting);
          return [...existingImages, ...previewImages];
        });
      } else {
        // Clear gallery images if none exist
        setGalleryImages(prev => prev.filter(img => img.file && !img.isExisting));
      }
    }
  }, [businessData]);

  const handlePreview = () => {
    // Get the public URL from business data
    const publicUrl = businessData?.data?.contactInfo?.publicUrl;
    
    if (publicUrl) {
      // Open the public barber profile in a new tab
      const profileUrl = `https://you-calendy-fe-pi.vercel.app/barber/profile/${publicUrl}`;
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Public URL not found. Please set up your public profile URL first.');
    }
  };

  const handleSave = async () => {
    const validation = form.validate();
    
    if (!validation.hasErrors) {
      const formData = new FormData();

      // Handle logo
      if (form.values.logo) {
        formData.append("logo", form.values.logo);
      } else if (!form.values.logoPreview) {
        // Logo was removed - send deletion flag
        formData.append("deleteLogo", "true");
      }

      // Handle workspace photos - send existing ones to keep
      const existingWorkspacePhotos = form.values.workspacePhotosPreview || [];
      existingWorkspacePhotos.forEach((url) => {
        formData.append("existingWorkplacePhotos", url);
      });

      // Add new workspace photos
      form.values.workspacePhotos.forEach((file) => {
        formData.append("workplacePhotos", file);
      });

      // Add selected gallery photos
      selectedFiles.forEach((file) => {
        formData.append('galleryImages', file);
      });

      // Check if there are any changes to upload
      const hasLogo = form.values.logo !== null;
      const hasLogoDeleted = !form.values.logoPreview && businessData?.data?.profileImages?.logo;
      const hasWorkspacePhotos = form.values.workspacePhotos.length > 0;
      const hasWorkspaceDeleted = existingWorkspacePhotos.length !== (businessData?.data?.profileImages?.workspacePhotos || []).length;
      const hasGalleryPhotos = selectedFiles.length > 0;

      if (hasLogo || hasLogoDeleted || hasWorkspacePhotos || hasWorkspaceDeleted || hasGalleryPhotos) {
        // Store count before clearing
        const selectedFilesCount = selectedFiles.length;


        updateSettings(formData, {
          onSuccess: () => {
            // Clear selected files and previews after successful save
            if (selectedFilesCount > 0) {
              setSelectedFiles([]);
              setGalleryImages(prev => prev.filter(img => img.isExisting));

              // Clear file input
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }

              toast.success(`${selectedFilesCount} photo(s) uploaded successfully!`);
            } else {
              // Show generic success message for other changes
              toast.success(tc('settingsUpdatedSuccessfully'));
            }

            navigate(-1);
          },
          onError: (error) => {
            const errorMessage = error?.response?.data?.message || error.message || 'Unknown error';
            toast.error(`Failed to save images: ${errorMessage}`);
          }
        });
      } else {
        notifications.show({
          title: tc('noChangesToSave'),
          message: 'No new images were selected to save.',
          color: 'blue',
        });
      }
    } else {
      notifications.show({
        title: tc('validationError'),
        message: 'Please fix the validation errors before saving.',
        color: 'red',
      });
    }
  };

  const handleWorkspacePhotoAdd = (file) => {
    if (form.values.workspacePhotos.length >= 5) {
      notifications.show({
        title: tc('error'),
        message: 'Maximum 5 workspace photos allowed',
        color: 'red',
      });
      return;
    }
    form.setFieldValue("workspacePhotos", [
      ...form.values.workspacePhotos,
      file,
    ]);
  };

  const removeWorkspacePhoto = async (index) => {
    const isExistingPhoto = index < form.values.workspacePhotosPreview.length;
    
    if (isExistingPhoto) {
      // This is an existing photo from the server - need to update backend immediately
      const updatedPreviews = form.values.workspacePhotosPreview.filter((_, i) => i !== index);
      
      const formData = new FormData();
      updatedPreviews.forEach((url) => {
        formData.append("existingWorkplacePhotos", url);
      });
      
      // Update immediately
      form.setFieldValue('workspacePhotosPreview', updatedPreviews);
      
      updateSettings(formData, {
        onSuccess: () => {
          toast.success('Workplace photo removed successfully!');
        },
        onError: (error) => {
          toast.error('Failed to remove workplace photo');
          // Revert on error - the query invalidation will refetch the correct state
        }
      });
    } else {
      // This is a newly added photo (not yet saved) - just remove from local state
      const newPhotoIndex = index - form.values.workspacePhotosPreview.length;
      const updatedPhotos = form.values.workspacePhotos.filter((_, i) => i !== newPhotoIndex);
      form.setFieldValue('workspacePhotos', updatedPhotos);
    }
  };

  const removeLogo = async () => {
    const hasExistingLogo = form.values.logoPreview !== null;
    
    if (hasExistingLogo) {
      // Remove existing logo from server
      const formData = new FormData();
      formData.append('deleteLogo', 'true');
      
      // Update local state immediately
      form.setFieldValue('logo', null);
      form.setFieldValue('logoPreview', null);
      
      updateSettings(formData, {
        onSuccess: () => {
          toast.success('Logo removed successfully!');
        },
        onError: (error) => {
          toast.error('Failed to remove logo');
          // The query invalidation will refetch the correct state
        }
      });
    } else {
      // Just a newly selected logo that hasn't been saved yet
      form.setFieldValue('logo', null);
      form.setFieldValue('logoPreview', null);
    }
  };



  const allWorkspacePhotoPreviews = [
    ...form.values.workspacePhotosPreview,
    ...form.values.workspacePhotos.map(file => URL.createObjectURL(file))
  ];

  // Profile component functions

  const handleDeviceUpload = () => {
    fileInputRef.current.click();
  };


  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
      // Handle gallery images - just add to selected files for preview
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= MAX_FILE_SIZE;
        console.log('File validation:', {
          name: file.name,
          type: file.type,
          size: file.size,
          isValidType,
          isValidSize
        });
        return isValidType && isValidSize;
      });
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        // Create preview URLs for selected files
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setGalleryImages(prev => [...prev, {
              id: Date.now() + Math.random(),
              url: reader.result,
              file: file,
              isSelected: true
            }]);
          };
          reader.readAsDataURL(file);
        });
      } else {
        toast.error('Please select valid image files (JPEG/PNG, max 5MB)');
      }
    }
    event.target.value = '';
  };

  const removeGalleryImage = async (imageToRemove) => {
    if (imageToRemove.isSelected) {
      // For selected photos (not yet saved), just remove from preview
      removeSelectedPhoto(imageToRemove);
      return;
    }
    
    if (imageToRemove.isExisting) {
      // For existing images, we need to update the backend
      try {
        // Get all existing gallery images except the one to remove
        const updatedImages = galleryImages
          .filter(img => img.id !== imageToRemove.id && img.isExisting)
          .map(img => img.url);
        
        const formData = new FormData();
        // Send the remaining images as the new gallery
        updatedImages.forEach(url => {
          formData.append('existingGalleryImages', url);
        });
        
        // Update immediately in local state for better UX
        setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
        
        // Call the backend
        updateSettings(formData, {
          onSuccess: () => {
            toast.success('Image removed successfully!');
          },
          onError: (error) => {
            // Revert on error - refetch from server
            toast.error('Failed to remove image');
            // The query invalidation will refetch the correct state
          }
        });
      } catch (error) {
        toast.error('Failed to remove image');
        return;
      }
    }
  };

  const removeSelectedPhoto = (imageToRemove) => {
    // Remove from selected files
    setSelectedFiles(prev => prev.filter(file => file !== imageToRemove.file));
    
    // Remove from gallery images preview
    setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
  };

  // Profile component UI components
  const UploadButton = ({ variant, icon: Icon, onClick }) => {
    const isInstagram = variant === "instagram";

    return (
      <button
        onClick={onClick}
        className={`flex min-h-[50px] items-center gap-2 justify-center grow shrink basis-auto p-3 rounded-xl max-md:px-4 text-sm font-semibold leading-none cursor-pointer ${isInstagram
            ? "bg-[rgba(244,245,246,1)] text-[rgba(50,51,52,1)]"
            : "bg-[rgba(50,51,52,1)] text-white"
          }`}
      >
        {isInstagram ? (
          <div className="self-stretch flex min-w-40 w-[210px] items-center gap-2 justify-center my-auto">
            {Icon && (
              <Icon className="aspect-[1] object-contain w-4 self-stretch shrink-0 my-auto cursor-pointer" />
            )}
            <span>{tc('uploadFromInstagram')}</span>
          </div>
        ) : (
          <span>{tc('uploadFromDevice')}</span>
        )}
      </button>
    );
  };

  const GalleryPreview = () => {
    if (galleryImages.length === 0) return null;
    
    const existingImages = galleryImages.filter(img => img.isExisting);
    const selectedImages = galleryImages.filter(img => img.isSelected);
    
    return (
      <div className="mt-6">
        {/* Selected Photos Section */}
        {selectedImages.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[rgba(50,51,52,1)]">
                Selected Photos ({selectedImages.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Selected photo preview"
                    className="w-full h-24 object-cover rounded-lg border-2 border-blue-300"
                  />
                  <button
                    onClick={() => removeGalleryImage(image)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    New
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Existing Gallery Images */}
        {existingImages.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-[rgba(50,51,52,1)] mb-4">
              Gallery Images
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Gallery preview"
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeGalleryImage(image)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PortfolioSection = () => {
    return (
      <section className="mt-[45px] max-md:mt-10">
        <h1 className="text-[rgba(50,51,52,1)] text-2xl font-medium  ">
          {tc('addGallery')}
        </h1>
        <p className="text-[rgba(147,151,153,1)] text-sm font-normal mt-1 w-1/2">
          {tc('addGalleryDescription')}
          <br />
        </p>
      </section>
    );
  };

  return (
    <BatchTranslationLoader>
      <main className="h-[83vh] overflow-auto bg-white p-8 max-md:p-6 max-sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4 sm:gap-0 max-md:mb-6">
          <Link to={-1} className="flex w-auto">
            <Button
              size="lg"
              className="!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:size-md max-md:!text-sm max-md:!py-2 max-md:!px-4"
            >
              <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
            </Button>
          </Link>

          <div className="flex flex-row justify-end gap-6 items-center">
            <Button
              color="#7D9A4B"
              size="md"
              px={50}
              radius={10}
              className="max-md:w-full max-md:px-4"
              onClick={handlePreview}
            >
              {tc('preview')}
            </Button>
            <Button
              color="#323334"
              size="md"
              px={50}
              radius={10}
              className="max-md:w-full max-md:px-4"
              onClick={handleSave}
              loading={isSaving || isFetching}
              disabled={
                !form.values.logo && 
                form.values.workspacePhotos.length === 0 && 
                selectedFiles.length === 0 &&
                form.values.logoPreview === businessData?.data?.profileImages?.logo &&
                JSON.stringify(form.values.workspacePhotosPreview) === JSON.stringify(businessData?.data?.profileImages?.workspacePhotos || [])
              }
            >
              {tc('save')}
            </Button>
          </div>
        </div>

      <div className="w-4/5 max-sm:w-full max-md:w-11/12">
        <div className="flex flex-wrap gap-x-24 gap-y-12 max-md:gap-x-12 max-md:flex-col">
          <section className="flex-1 min-w-[300px]">
            <h2 className="text-[#111827] text-2xl font-semibold mb-4 max-md:text-xl max-md:mb-2">{tc('logo')}</h2>
            <p className="text-[#7898AB] text-base mb-6 max-md:text-sm max-md:mb-4">
              {tc('logoDescription')}
            </p>
            <MediaUpload1>
              <FileButton
                onChange={(file) => form.setFieldValue('logo', file)}
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <div className="relative">
                    <ImageUploadBox
                      {...props}
                      icon={<CameraIcon />}
                      label={tc('addLogo')}
                      size="small"
                      isCircular={true}
                      preview={
                        form.values.logo
                          ? URL.createObjectURL(form.values.logo)
                          : form.values.logoPreview
                      }
                      error={form.errors.logo}
                    />
                    {(form.values.logo || form.values.logoPreview) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLogo();
                        }}
                        className="!absolute !top-1 !right-1 !bg-red-500 !text-white !p-0 !w-6 !h-6 !min-h-0 !rounded-full !text-xs"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                )}
              </FileButton>
            </MediaUpload1>
          </section>

          <section className="flex-1 min-w-[300px]">
            <h2 className="text-[#111827] text-2xl font-semibold mb-4 max-md:text-xl max-md:mb-2">
              {tc('workplacePhotos')}
            </h2>
            <p className="text-[#7898AB] text-base mb-6 max-md:text-sm max-md:mb-4">
              {tc('workplacePhotosDescription')}
            </p>
            <div className="flex flex-row flex-nowrap overflow-x-auto pb-4 gap-3 sm:gap-4">
              {allWorkspacePhotoPreviews.map((src, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <ImageUploadBox
                    preview={src}
                    size="small"
                  />
                   <Button
                    onClick={() => removeWorkspacePhoto(index)}
                    className="!absolute !top-1 !right-1 !bg-red-500 !text-white !p-0 !w-6 !h-6 !min-h-0 !rounded-full !text-base !font-normal hover:!bg-red-600"
                  >
                    ×
                  </Button>
                </div>
              ))}

              {allWorkspacePhotoPreviews.length < 5 && (
                <MediaUpload2>
                  <FileButton
                    onChange={handleWorkspacePhotoAdd}
                    accept="image/png,image/jpeg"
                  >
                    {(props) => (
                      <ImageUploadBox
                        {...props}
                        icon={<CameraIcon />}
                        label={tc('addPhoto')}
                        size="small"
                        error={form.errors.workspacePhotos}
                      />
                    )}
                  </FileButton>
                </MediaUpload2>
              )}
            </div>
          </section>


        </div>
      </div>
      
      {/* Integrated Profile Component */}
      <div className="mt-8">
        <div className="flex w-full flex-col max-md:max-w-full max-md:pb-[100px]">
          <PortfolioSection />

          <div className="flex md:w-1/2 items-stretch gap-4 text-md font-semibold flex-wrap mt-10">
            <UploadButton variant="device" onClick={handleDeviceUpload} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e)}
            />
          </div>
          
          <GalleryPreview />
        </div>
      </div>
      </main>
    </BatchTranslationLoader>
  );
};

export default ProfileImages;
