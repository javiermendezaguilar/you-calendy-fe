import React, { useState, useEffect } from 'react';
import { Box, Text, Title, Paper, Flex, Avatar, Button, ScrollArea, TextInput, Textarea, Group, Modal, ActionIcon, Stack, Badge } from '@mantine/core';
import { Edit, DeviceFloppy, ArrowBackUp, Pencil } from 'tabler-icons-react';
import moment from 'moment';
import { useUpdateClient, useUnblockClient } from '../../hooks/useClients';
import { useUpdateClientByAdmin } from '../../hooks/useAdmin';
import { useGetClientGallery, useGetClientGalleryContext } from '../../hooks/useGallery';
import { clientAPI } from '../../services/clientAPI';
import { businessAPI } from '../../services/businessAPI';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const ClientProfileSidebar = ({ client, onClose, isAdmin = false }) => {
  const { tc } = useBatchTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);
  
  // Gallery states
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [suggestionNote, setSuggestionNote] = useState('');

  const { mutate: updateClient, isPending: isUpdatingClient } = useUpdateClient(client?.id);
  const { mutate: unblockClient, isPending: isUnblocking } = useUnblockClient();
  const { mutate: updateClientByAdmin, isPending: isUpdatingAdmin } = useUpdateClientByAdmin();
  
  // Gallery hooks
  // Use context-aware hook (admin vs business) for gallery
  const { data: galleryData, isLoading: isLoadingGallery } = useGetClientGalleryContext(client?.id, { isAdmin, enabled: !isAdmin });
  const [isUpdatingSuggestion, setIsUpdatingSuggestion] = useState(false);
  
  const isUpdating = isUpdatingClient || isUpdatingAdmin;
  const isGalleryLoading = isUpdatingSuggestion;

  useEffect(() => {
    setEditedClient(client);
    setIsEditing(false); 
  }, [client]);

  if (!client) {
    return null;
  }

  const handleInputChange = (field, value) => {
    const [mainField, subField] = field.split('.');
    if (subField) {
      setEditedClient(prev => ({
        ...prev,
        [mainField]: {
          ...prev[mainField],
          [subField]: value
        }
      }));
    } else {
      setEditedClient(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    const { id, original, ...clientDataForUpdate } = editedClient;
    const nameParts = clientDataForUpdate.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const payload = {
      firstName,
      lastName,
      email: clientDataForUpdate.email,
      phone: clientDataForUpdate.phoneNumber,
      internalNotes: clientDataForUpdate.internalNotes
    }

    const options = {
      onSuccess: () => {
        setIsEditing(false);
        onClose();
      }
    };

    if (isAdmin) {
      updateClientByAdmin({ id: client.id, data: payload }, options);
    } else {
      updateClient(payload, options);
    }
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  // Gallery handlers
  const handleEditSuggestion = (galleryItem, suggestion, suggestionIndex) => {
    console.log('handleEditSuggestion - suggestion:', suggestion);
    console.log('handleEditSuggestion - suggestionIndex:', suggestionIndex);
    console.log('handleEditSuggestion - suggestion._id:', suggestion._id);
    
    // Only allow editing suggestions that have valid _id
    if (!suggestion._id) {
      toast.error(tc('cannotEditThisSuggestionInvalidSuggestionId'));
      return;
    }
    
    setSelectedGalleryItem(galleryItem);
    setSelectedSuggestion(suggestion);
    setSuggestionNote(suggestion.note);
    setShowSuggestionModal(true);
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestionNote.trim()) {
      toast.error(tc('pleaseEnterASuggestionNote'));
      return;
    }

    if (!selectedGalleryItem || !selectedSuggestion) {
      toast.error(tc('invalidSelectionPleaseTryAgain'));
      return;
    }

    // Send JSON data since we're only updating text, no file upload
    const requestData = { 
      note: suggestionNote,
      clientId: client.id
    };

    try {
      setIsUpdatingSuggestion(true);
      
      console.log('handleSubmitSuggestion - selectedGalleryItem._id:', selectedGalleryItem._id);
      console.log('handleSubmitSuggestion - selectedSuggestion._id:', selectedSuggestion._id);
      console.log('handleSubmitSuggestion - requestData:', requestData);
      
      // Use business API endpoint for both admin and barber contexts
      await businessAPI.updateSuggestion(selectedGalleryItem._id, selectedSuggestion._id, requestData);
      
      // Update the local state immediately to reflect changes
      setGalleryData(prevData => {
        if (!prevData?.data?.gallery) return prevData;
        
        const updatedGallery = prevData.data.gallery.map(item => {
          if (item._id === selectedGalleryItem._id) {
            const updatedSuggestions = item.suggestions.map(suggestion => {
              if (suggestion._id === selectedSuggestion._id) {
                return { ...suggestion, note: suggestionNote, updatedAt: new Date() };
              }
              return suggestion;
            });
            return { ...item, suggestions: updatedSuggestions };
          }
          return item;
        });
        
        return {
          ...prevData,
          data: {
            ...prevData.data,
            gallery: updatedGallery
          }
        };
      });
      
      toast.success(tc('suggestionUpdatedSuccessfully'));
      setShowSuggestionModal(false);
      resetSuggestionModal();
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error(tc('failedToUpdateSuggestion'));
    } finally {
      setIsUpdatingSuggestion(false);
    }
  };

  const resetSuggestionModal = () => {
    setSelectedGalleryItem(null);
    setSelectedSuggestion(null);
    setSuggestionNote('');
  };



  const renderGalleryImages = () => {
    if (isLoadingGallery) {
      return <Text>{tc('loading')}</Text>;
    }

    // Combine standard gallery images with historical (unregistered) photos
    const standardGallery = galleryData?.data?.gallery || [];
    const historicalPhotos = client?.original?.haircutPhotos || [];

    if (standardGallery.length === 0 && historicalPhotos.length === 0) {
      return (
        <Paper shadow="xs" p="md" style={{ textAlign: 'center' }}>
          <Text c="dimmed">{tc('noGalleryImagesAvailable')}</Text>
        </Paper>
      );
    }

    return (
      <Flex wrap="wrap" gap="md" justify="flex-start">
        {/* Render standard gallery items */}
        {standardGallery.map((item, idx) => (
          <div key={item._id || idx} style={{ position: 'relative' }}>
            <img 
              src={item.imageUrl} 
              alt={item.title || `Haircut ${idx + 1}`}
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            {/* Show suggestions count */}
            {item.suggestions && item.suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '5px',
                left: '5px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {item.suggestions.length} suggestion{item.suggestions.length !== 1 ? 's' : ''}
              </div>
            )}
            
            {/* Show suggestions */}
            {item.suggestions && item.suggestions.length > 0 && (
              <div style={{ marginTop: '8px', maxWidth: '120px' }}>
                {item.suggestions.map((suggestion, suggIdx) => (
                  <Paper key={suggestion._id || suggIdx} p="xs" mb="xs" style={{ fontSize: '12px' }}>
                    <Flex justify="space-between" align="flex-start">
                      <Text size="xs" style={{ flex: 1 }}>{suggestion.note}</Text>
                      <ActionIcon 
                        size="xs" 
                        variant="subtle"
                        disabled={!suggestion._id}
                        onClick={() => handleEditSuggestion(item, suggestion, suggIdx)}
                        style={{ opacity: suggestion._id ? 1 : 0.3 }}
                      >
                        <Pencil size={10} />
                      </ActionIcon>
                    </Flex>
                  </Paper>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Render historical (unregistered phase) photos */}
        {historicalPhotos.map((photo, idx) => (
          <div key={`hist-${idx}`} style={{ position: 'relative' }}>
            <img 
              src={photo.url} 
              alt={photo.description || `Historical Haircut ${idx + 1}`}
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: '8px',
                border: '1px solid #738B4A'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: '#738B4A',
              color: 'white',
              padding: '1px 5px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {tc('recordedByBarber')}
            </div>
            {photo.description && (
              <Text size="xs" mt={4} color="dimmed" style={{ maxWidth: '120px' }}>
                {photo.description}
              </Text>
            )}
          </div>
        ))}
      </Flex>
    );
  };

  return (
    <>
      <div className="px-4 pt-4 pb-3 bg-gray-50 sm:px-6 sm:pt-6 sm:pb-4 rounded-t-[40px]">
        <Flex justify="space-between" align="center">
            <div className="w-fit">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {tc('clientProfile')}
              </h1>
              <p className="text-xs sm:text-sm font-normal text-gray-500">
                {tc('viewAndManageClientDetails')}
              </p>
            </div>
            {isEditing ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <Button onClick={handleSave} color="teal" leftSection={<DeviceFloppy size={16} />} loading={isUpdating}>{tc('save')}</Button>
                    <Button onClick={handleCancel} variant="default" leftSection={<ArrowBackUp size={16} />}>{tc('cancel')}</Button>
                </div>
            ) : (
                <div style={{ marginLeft: 'auto' }}>
                    <Button onClick={() => setIsEditing(true)} variant="light" leftSection={<Edit size={16} />}>
                        {tc('editProfile')}
                    </Button>
                </div>
            )}
        </Flex>
      </div>

      <ScrollArea className="h-full" style={{ padding: '0 1rem 4rem 1rem' }}>
        <Box pt="md">
          <Paper shadow="xs" p="md">
            <Flex direction="row" align="flex-start" gap="md">
              {(() => {
                const normalizeImageUrl = (img) => {
                  if (!img) return null;
                  if (typeof img === 'string') {
                    // Trim spaces and strip accidental backticks
                    return img.trim().replace(/^`+|`+$/g, '');
                  }
                  if (typeof img === 'object') {
                    return img.url || img.secure_url || null;
                  }
                  return null;
                };

                const avatarSrc = normalizeImageUrl(client.original?.profileImage) || normalizeImageUrl(client.original?.avatar);
                return <Avatar size="lg" mt="sm" radius="xl" src={avatarSrc} />;
              })()}
              <Box style={{width: '100%'}}>
                {isEditing ? (
                  <Flex direction="column" gap="xs">
                    <TextInput label={tc('name')} value={editedClient.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    <TextInput label={tc('email')} value={editedClient.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                    <TextInput label={tc('phoneNumber')} value={editedClient.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} />
                  </Flex>
                ) : (
                  <Flex direction="column" gap={2}>
                    <Flex align="center" gap="xs" wrap="wrap">
                      <Title order={4}>{client.name}</Title>
                      {client.original?.appBookingBlocked && (
                        <Badge color="red" variant="filled">
                          {tc('appBookingBlocked')}
                        </Badge>
                      )}
                    </Flex>
                    <Text c="dimmed">{client.email}</Text>
                    <Text c="dimmed">{client.phoneNumber}</Text>
                    
                    {client.original?.appBookingBlocked && !isEditing && (
                      <Button 
                        size="compact-xs" 
                        variant="subtle" 
                        color="green" 
                        mt={4} 
                        w="fit-content"
                        loading={isUnblocking}
                        onClick={() => unblockClient(client.id)}
                      >
                        {tc('unblockClient')}
                      </Button>
                    )}
                    
                    {client.original?.internalNotes && (
                      <Box mt="sm">
                        <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>
                          {tc('internalNotes')}
                        </Text>
                        <Text size="sm" mt={2} style={{ whiteSpace: 'pre-wrap' }}>
                          {client.original.internalNotes}
                        </Text>
                      </Box>
                    )}

                    {client.original?.incidentNotes && client.original.incidentNotes.length > 0 && (
                      <Box mt="md">
                        <Text size="xs" fw={700} c="red.7" style={{ textTransform: 'uppercase' }}>
                          {tc('incidentHistory')}
                        </Text>
                        <Stack gap={4} mt={4}>
                          {[...client.original.incidentNotes].reverse().map((incident, idx) => (
                            <Paper key={idx} p="xs" withBorder bg="red.0" style={{ borderColor: '#ffe3e3' }}>
                              <Flex justify="space-between" align="center">
                                <Text size="xs" fw={700} c="red.8">
                                  {moment(incident.date).format('MMM D, YYYY')}
                                </Text>
                                <Badge size="xs" color="red" variant="light">{incident.type || 'no-show'}</Badge>
                              </Flex>
                              <Text size="xs" mt={2} c="gray.8">
                                {incident.note || tc('noDetails')}
                              </Text>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Flex>
                )}
              </Box>
            </Flex>
          </Paper>

          {/* Edit Internal Notes in Edit Mode */}
          {isEditing && (
            <Box mt="md">
              <Textarea 
                label={tc('internalNotes')}
                placeholder={tc('internalNotesPlaceholder')}
                value={editedClient.internalNotes || client.original?.internalNotes || ''}
                onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                minRows={3}
              />
            </Box>
          )}
          
          {!isAdmin && (
            <>
              <Title order={5} c="dimmed" my="md">{tc('photosAndGallery')}</Title>
              <Paper shadow="xs" p="md">
                {renderGalleryImages()}
              </Paper>
            </>
          )}
        </Box>
      </ScrollArea>

      {/* Edit Suggestion Modal */}
      <Modal
        opened={showSuggestionModal}
        onClose={() => {
          setShowSuggestionModal(false);
          resetSuggestionModal();
        }}
        title={`${tc('edit')} ${tc('suggestion')}`}
        size="md"
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
      >
        <Stack>
          <Textarea
            label={tc('suggestionNote')}
            placeholder={tc('suggestionNote')}
            value={suggestionNote}
            onChange={(e) => setSuggestionNote(e.target.value)}
            minRows={3}
          />
          {/* No image upload for suggestions */}
          <Group justify="flex-end">
            <Button 
              variant="light" 
              onClick={() => {
                setShowSuggestionModal(false);
                resetSuggestionModal();
              }}
            >
              {tc('cancel')}
            </Button>
            <Button 
              onClick={handleSubmitSuggestion}
              loading={isUpdatingSuggestion}
              disabled={!suggestionNote.trim() || !selectedGalleryItem || !selectedSuggestion}
            >
              {`${tc('update')} ${tc('suggestion')}`}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ClientProfileSidebar;