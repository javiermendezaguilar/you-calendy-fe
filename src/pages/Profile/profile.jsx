import * as React from "react";
import { FooterInstagramIcon } from "../../components/common/Svgs";
import Barbing from "../../assets/barbing.webp";
import { PlusIcon } from "lucide-react";
import { Button } from "@mantine/core";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { useUpdateBusinessSettings, useGetBusiness } from "../../hooks/useBusiness";
import { toast } from "sonner";

const Profile = () => {
  const [coverImage, setCoverImage] = React.useState(Barbing);
  const [galleryImages, setGalleryImages] = React.useState([]);
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);
  const { tc } = useBatchTranslation();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { data: businessData } = useGetBusiness();

  // Load existing gallery images
  React.useEffect(() => {
    if (businessData?.data?.settings?.galleryImages) {
      const existingImages = businessData.data.settings.galleryImages.map((url, index) => ({
        id: `existing-${index}`,
        url: url,
        isExisting: true
      }));
      
      // Preserve any preview images that are currently being uploaded
      setGalleryImages(prev => {
        const previewImages = prev.filter(img => img.file && !img.isExisting);
        return [...existingImages, ...previewImages];
      });
    }
  }, [businessData]);

  const handleInstagramUpload = () => {
    // Open Instagram in a new tab
    window.open('https://www.instagram.com', '_blank');
  };

  const handleDeviceUpload = () => {
    fileInputRef.current.click();
  };

  const uploadSelectedPhotos = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('galleryImages', file);
      });
      
      await updateBusinessSettings.mutateAsync(formData);
      toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);
      
      // Clear selected files and previews
      setSelectedFiles([]);
      setGalleryImages(prev => prev.filter(img => img.isExisting));
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCover = () => {
    coverInputRef.current.click();
  };

  const handleFileChange = (event, isCover = false) => {
    const files = Array.from(event.target.files);
    
    if (isCover && files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else if (!isCover && files.length > 0) {
      // Handle gallery images - just add to selected files for preview
      const validFiles = files.filter(file => file.type.startsWith('image/'));
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
      }
    }
    event.target.value = '';
  };

  const ImagePreview = ({ imageSrc }) => {
    return (
      <div className="w-4/5 max-md:w-full max-md:ml-0">
        <img
          src={imageSrc}
          alt="Portfolio cover preview"
          className="aspect-[2.96] object-contain w-full grow rounded-[18px] max-md:max-w-full max-md:mt-10"
        />
      </div>
    );
  };

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

  const removeGalleryImage = async (imageToRemove) => {
    if (imageToRemove.isSelected) {
      // For selected photos, just remove from preview
      removeSelectedPhoto(imageToRemove);
      return;
    }
    
    if (imageToRemove.isExisting) {
      // For existing images, we need to update the backend
      try {
        const updatedImages = galleryImages
          .filter(img => img.id !== imageToRemove.id && img.isExisting)
          .map(img => img.url);
        
        const formData = new FormData();
        // Send the remaining images as the new gallery
        updatedImages.forEach(url => {
          formData.append('existingGalleryImages', url);
        });
        
        await updateBusinessSettings.mutateAsync(formData);
        toast.success('Image removed successfully!');
      } catch (error) {
        toast.error('Failed to remove image');
        return;
      }
    }
    
    // Remove from local state
    setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
  };

  const removeSelectedPhoto = (imageToRemove) => {
    // Remove from selected files
    setSelectedFiles(prev => prev.filter(file => file !== imageToRemove.file));
    
    // Remove from gallery images preview
    setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
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
              <Button
                onClick={uploadSelectedPhotos}
                loading={isUploading}
                disabled={selectedFiles.length === 0}
                color="dark"
                radius="md"
                size="sm"
                className="bg-[#323334] hover:bg-[#4a4b4c]"
              >
                Upload Photos
              </Button>
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
    <main className="h-[83vh] bg-white  overflow-auto rounded-2xl">
      <div className="flex w-full flex-col max-md:max-w-full max-md:pb-[100px] max-md:px-5">
        <div className="self-stretch w-full max-md:max-w-full">
          <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
            <ImagePreview imageSrc={coverImage} />
            <div className="w-40 ml-10 max-md:w-full max-md:ml-0">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e, true)}
              />
            </div>
          </div>
        </div>

        <PortfolioSection />

        <div className="flex md:w-1/2 items-stretch gap-4 text-md font-semibold flex-wrap mt-10">
          <UploadButton
            variant="instagram"
            icon={FooterInstagramIcon}
            onClick={handleInstagramUpload}
          />
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
    </main>
  );
};

export default Profile;
