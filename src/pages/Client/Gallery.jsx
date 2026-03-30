import React, { useState, useEffect } from 'react';
import Image1 from "../../assets/image1.webp"
import Image2 from "../../assets/image2.webp"
import Image3 from "../../assets/image3.webp"
import Image4 from "../../assets/image4.webp"
import Image5 from "../../assets/image5.webp"
import { Title, Container, Box, Image, Skeleton } from '@mantine/core';
import { motion } from 'framer-motion';
import { getBusinessById } from '../../services/businessPublicAPI';
import { getCurrentBusinessId } from '../../utils/invitationUtils';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4, // Delay to start after Home.jsx animation
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Gallery = () => {
  const { tc } = useBatchTranslation();
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        
        // Get business ID from invitation link or URL
        const businessId = getCurrentBusinessId();
        
        if (!businessId) {
          setGalleryImages([]);
          return;
        }

        // Fetch business data to get gallery images from profileImages
        const businessData = await getBusinessById(businessId);
        const galleryImagesUrls = businessData?.profileImages?.galleryImages || [];
        
        if (galleryImagesUrls.length > 0) {
          // Transform gallery images to match our gallery format
          const transformedImages = galleryImagesUrls.map((url, index) => ({
            id: index + 1,
            src: url,
            alt: tc('galleryImage', { number: index + 1 }),
            className: index === 0 ? "col-span-2 row-span-2" : ""
          }));
          
          setGalleryImages(transformedImages);
        } else {
          setGalleryImages([]);
        }
        
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError(err.message);
        // Set empty array on error
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  if (loading) {
    return (
      <motion.section 
        className="container p-3 md:p-5 lg:p-8 max-w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-[24px] md:text-[30px] lg:text-[36px] tracking-[0.8px] mb-[16px] md:mb-[20px] lg:mb-[28px]"
          variants={itemVariants}
        >
          <Skeleton height={40} width="30%" />
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={200} radius="md" />
          ))}
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="container p-3 md:p-5 lg:p-8 max-w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="font-['Outfit',Helvetica] font-semibold text-[#323334] text-[24px] md:text-[30px] lg:text-[36px] tracking-[0.8px] mb-[16px] md:mb-[20px] lg:mb-[28px]"
        variants={itemVariants}
      >
        {tc('ourGallery')}
      </motion.h1>

      {galleryImages.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center h-40 text-center"
          variants={itemVariants}
        >
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{tc('noImagesFound')}</h3>
          <p className="text-gray-500">{tc('noGalleryImagesAvailable')}</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-[15px] lg:gap-[20px] min-h-[280px] sm:min-h-[320px] md:min-h-[400px] lg:h-[500px]"
          variants={containerVariants} // Re-using container for staggering grid items
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`overflow-hidden rounded-md shadow-md ${
                index === 0 
                  ? 'xs:col-span-2 xs:row-span-2 sm:col-span-2 sm:row-span-2' 
                  : ''
              }`}
              variants={itemVariants}
            >
              <Box className="h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="!w-full !h-full !object-cover"
                />
              </Box>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
};

export default Gallery;