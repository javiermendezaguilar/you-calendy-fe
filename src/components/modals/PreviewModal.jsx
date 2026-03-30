import React from 'react';
import { Image, Text, ScrollArea, Grid, Badge, Group, Stack, Title, Paper, Box } from '@mantine/core';
import { CameraIcon } from '../common/Svgs';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { useGetBusinessSettings } from '../../hooks/useBusiness';

const PreviewModal = ({ opened, onClose }) => {
  const { tc } = useBatchTranslation();
  const { data: settingsData, isLoading } = useGetBusinessSettings();

  const settings = settingsData?.data || {};

  const ImageCard = ({ src, title, category }) => (
    <Paper
      radius="lg"
      p="xs"
      style={{ 
        height: '100%',
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      className="hover:shadow-md hover:scale-[1.02] transition-all duration-200"
    >
      <div className="relative">
        <Image
          src={src}
          alt={title}
          height={120}
          fit="cover"
          style={{
            borderRadius: '8px',
            width: '100%',
            objectFit: 'cover'
          }}
        />
        <Badge
          color={category === 'logo' ? 'green' : category === 'workplace' ? 'orange' : 'purple'}
          variant="filled"
          size="xs"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '9px',
            textTransform: 'uppercase'
          }}
        >
          {category}
        </Badge>
      </div>
    </Paper>
  );

  const EmptyState = ({ category }) => (
    <Paper
      radius="lg"
      p="md"
      style={{
        background: '#f8f9fa',
        border: '2px dashed #dee2e6',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <div 
        className="w-10 h-10 flex items-center justify-center rounded-full mb-2"
        style={{
          background: category === 'logo' ? '#556B2F' : 
                     category === 'workplace' ? '#ff8c00' : '#8e44ad',
          opacity: 0.8
        }}
      >
        <CameraIcon />
      </div>
      <Text size="xs" c="dimmed" fw={500}>
        No {category} uploaded
      </Text>
    </Paper>
  );

  const renderLogoSection = () => {
    return (
      <Box>
        <Group mb="sm" align="center">
          <Title order={5} c="dark" fw={600}>
            Logo
          </Title>
        </Group>
        {!settings.logo ? (
          <EmptyState category="logo" />
        ) : (
          <div className="max-w-xs">
            <ImageCard
              src={settings.logo}
              title="Business Logo"
              category="logo"
            />
          </div>
        )}
      </Box>
    );
  };

  const renderWorkplacePhotosSection = () => {
    const photos = settings.workplacePhotos || [];
    
    return (
      <Box>
        <Group mb="sm" align="center">
          <Title order={5} c="dark" fw={600}>
            Workplace Photos
          </Title>
          <Badge color="orange" variant="light" size="xs">
            {photos.length}/5
          </Badge>
        </Group>
        {photos.length === 0 ? (
          <EmptyState category="workplace" />
        ) : (
          <Grid>
            {photos.map((photo, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                <ImageCard
                  src={photo}
                  title={`Workplace Photo ${index + 1}`}
                  category="workplace"
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderGallerySection = () => {
    const galleryImages = settings.galleryImages || [];
    
    return (
      <Box>
        <Group mb="sm" align="center">
          <Title order={5} c="dark" fw={600}>
            Gallery Images
          </Title>
          <Badge color="purple" variant="light" size="xs">
            {galleryImages.length}
          </Badge>
        </Group>
        {galleryImages.length === 0 ? (
          <EmptyState category="gallery" />
        ) : (
          <Grid>
            {galleryImages.map((image, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                <ImageCard
                  src={image}
                  title={`Gallery Image ${index + 1}`}
                  category="gallery"
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const totalImages = [
    settings.logo ? 1 : 0,
    (settings.workplacePhotos || []).length,
    (settings.galleryImages || []).length
  ].reduce((a, b) => a + b, 0);

  const modalContent = (
    <div className="p-4 bg-white" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
      {/* Minimal Header */}
      <div className="text-center mb-4">
        <Text c="dimmed" size="sm" fw={500}>
          {totalImages} images uploaded
        </Text>
      </div>

      <div style={{ 
        height: '450px', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        maxWidth: '100%'
      }}>
        <Stack gap="md">
          {renderLogoSection()}
          {renderWorkplacePhotosSection()}
          {renderGallerySection()}
        </Stack>
      </div>
    </div>
  );

  return (
    <div>
      {modalContent}
    </div>
  );
};

export default PreviewModal;