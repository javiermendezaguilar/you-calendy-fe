import React from 'react';
import { Box, Title, Text, Button, Flex } from '@mantine/core';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const DeleteBarberModal = ({ onCancel, onConfirm, isLoading = false, barberName }) => {
  const { tc } = useBatchTranslation();
  return (
    <Box p={30} className="text-center">
      <Title order={3} c="rgba(50, 51, 52, 1)" fz={28} fw={600}>
        {tc('deleteBarberAccount')}?
      </Title>
      <Text c="rgba(147, 151, 153, 1)" fz="md" mt="md" mb={30}>
        {tc('areYouSurePermanentlyDeleteBarber', { barberName: barberName ? `"${barberName}"` : tc('thisBarber') })} {tc('thisActionCannotBeUndoneRemoveAllData')}
      </Text>
      <Flex justify="center" gap="md">
        <Button
          variant="outline"
          onClick={onCancel}
          radius="md"
          size="md"
          w={130}
          disabled={isLoading}
          styles={{
            root: {
              borderColor: '#E6E6E6',
              color: '#333',
            }
          }}
        >
          {tc('noCancel')}
        </Button>
        <Button
          variant="filled"
          onClick={onConfirm}
          radius="md"
          size="md"
          w={130}
          bg="#FA5252"
          className="hover:!bg-red-600"
          loading={isLoading}
        >
          {tc('yesDelete')}
        </Button>
      </Flex>
    </Box>
  );
};

export default DeleteBarberModal;
