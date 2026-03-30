import React, { useState } from "react";
import { Button, Title, Text, Modal } from "@mantine/core";
import { X } from "tabler-icons-react";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const SuggestionModalContent = ({ suggestion, onClose }) => {
  const { tc } = useBatchTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get all photos from suggestion
  const allPhotos = suggestion?.allPhotos || [];
  const mainImage = suggestion?.image || allPhotos[0]?.url;

  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div className="relative p-4">
        <div className="absolute -right-7 -top-7 z-20">
          <Button
            onClick={onClose}
            variant="subtle"
            p={0}
            className="!p-0 !w-10 !h-10 !rounded-full !bg-[#636363] !hover:bg-gray-700 !transition-colors !inline-flex !items-center !justify-center"
            aria-label="Close suggestion modal"
          >
            <X size={24} className="text-white" />
          </Button>
        </div>
        <Title className="!text-left !text-xl sm:!text-2xl md:!text-3xl !mt-2 !font-semibold !mb-6 sm:!mb-10">{tc('clientSuggestion')}</Title>

        {/* Reference Photos Section */}
        <div className="mb-4 min-h-[40px]">
          {allPhotos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.url}
                  alt={`Reference ${index + 1}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-slate-400"
                  onClick={() => openLightbox(photo.url)}
                  title={tc('tapToEnlarge') || 'Tap to enlarge'}
                />
              ))}
            </div>
          ) : mainImage ? (
            <img
              src={mainImage}
              alt="Haircut suggestion"
              className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openLightbox(mainImage)}
              title={tc('tapToEnlarge') || 'Tap to enlarge'}
            />
          ) : (
            <Text className="!text-gray-500 !text-xs sm:!text-sm">{tc('noImagesAdded') || 'No images added'}</Text>
          )}
        </div>

        {/* Suggestion Text */}
        <Text className="!text-gray-900 !text-left !text-xs sm:!text-sm">
          {suggestion?.suggestionDetails?.message?.trim() || suggestion?.extendedProps?.suggestion || tc('noSuggestionsAvailable') || "No suggestions available"}
        </Text>
      </div>

      {/* Lightbox Modal for Full-size Image */}
      <Modal
        opened={lightboxOpen}
        onClose={closeLightbox}
        size="xl"
        centered
        withCloseButton={false}
        padding={0}
        radius="md"
        styles={{
          content: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
          body: {
            padding: 0,
          }
        }}
      >
        <div className="relative flex items-center justify-center min-h-[50vh] p-4">
          <Button
            onClick={closeLightbox}
            variant="subtle"
            p={0}
            className="!absolute !top-2 !right-2 !p-0 !w-10 !h-10 !rounded-full !bg-white/20 hover:!bg-white/40 !transition-colors !inline-flex !items-center !justify-center !z-10"
            aria-label="Close lightbox"
          >
            <X size={24} className="text-white" />
          </Button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size reference"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default SuggestionModalContent;