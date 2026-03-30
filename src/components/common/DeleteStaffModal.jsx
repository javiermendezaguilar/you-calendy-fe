import React, { useState } from 'react';
import { Box, Title, Text, Button, Flex, Textarea, Stack, Center } from '@mantine/core';
import { TrashBoxIcon } from './Svgs';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const DeleteStaffModal = ({ onCancel, onConfirm, isLoading, staffName }) => {
  const { tc } = useBatchTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(tc('pleaseProvideReasonForDeletion'));
      return;
    }
    onConfirm(reason.trim());
  };

  const handleReasonChange = (event) => {
    setReason(event.currentTarget.value);
    if (error) setError('');
  };

  return (
    <Box p={32} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Stack spacing="lg" align="center">
        {/* Trash Icon */}
        <Center mb={8}>
          <TrashBoxIcon />
        </Center>

        {/* Title */}
        <Title
          order={2}
          ta="center"
          c="#323334"
          fz={24}
          fw={500}
          mb={0}
        >
          {tc('areYouSureDeleteStaffMember')}
        </Title>

        {/* Description */}
        <Text
          ta="center"
          c="#666"
          fz="sm"
          mb={16}
          style={{ lineHeight: 1.5 }}
        >
          {tc('deleteStaffDescription')}
        </Text>

        {/* Reason Textarea */}
        <Box w="100%" mb={24}>
          <Textarea
            placeholder={tc('reason')}
            value={reason}
            onChange={handleReasonChange}
            minRows={4}
            maxRows={6}
            error={error}
            styles={{
              input: {
                backgroundColor: '#F5F5F5',
                border: error ? '1px solid #ff6b6b' : '1px solid #E6E6E6',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                minHeight: '120px',
                resize: 'none',
                '&:focus': {
                  borderColor: '#323334',
                }
              }
            }}
          />
        </Box>

        {/* Buttons */}
        <Stack w="100%" spacing="sm">
          <Button
            variant="filled"
            onClick={handleConfirm}
            size="lg"
            fullWidth
            bg="#FFD3D3"
            c="#EF4B4B"
            loading={isLoading}
            styles={{
              root: {
                backgroundColor: '#FFD3D3',
                border: 'none',
                borderRadius: '8px',
                height: '48px',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#d63031',
                }
              }
            }}
          >
            {tc('delete')}
          </Button>
          
          <Button
            variant="filled"
            onClick={onCancel}
            size="lg"
            fullWidth
            disabled={isLoading}
            styles={{
              root: {
                backgroundColor: '#E6E6E6',
                color: '#323334',
                border: "1px solid #827979",
                borderRadius: '8px',
                height: '48px',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#D0D0D0',
                }
              }
            }}
          >
            {tc('cancel')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DeleteStaffModal;
