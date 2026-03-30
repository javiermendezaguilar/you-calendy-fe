import React from 'react';
import { Text, Title, Button, ScrollArea } from '@mantine/core';
import { Bell, X } from 'lucide-react';
import CommonModal from './CommonModal';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import { localizeNotification } from '../../utils/notificationLocalization';

const NotificationModalContent = ({ notification, onClose }) => {
  const { tc } = useBatchTranslation();
  if (!notification) return null;

  const localized = localizeNotification(notification, tc);
  const { title, message, createdAt } = notification;

  return (
    <div className="relative p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mr-3">
            <Bell size={20} className="text-gray-600" />
          </div>
          <Title order={4} className="!text-lg !font-semibold !text-gray-800">
            {localized.title || tc(title || 'notification')}
          </Title>
        </div>
        <Button
          onClick={onClose}
          variant="subtle"
          p={0}
          className="!p-1 !rounded-full !hover:bg-gray-200 !transition-colors"
          aria-label="Close modal"
        >
          <X size={22} className="text-gray-500" />
        </Button>
      </div>

      <ScrollArea style={{ height: 'auto', maxHeight: '50vh' }} className="pr-2">
        <Text size="sm" c="dimmed" mb="md">
          {new Date(createdAt).toLocaleString()}
        </Text>
        <Text className="!text-gray-700 !leading-relaxed">
          {localized.description || tc(message)}
        </Text>
      </ScrollArea>

      <div className="flex justify-end mt-4 pt-2 border-t border-gray-200">
        <Button 
          onClick={onClose} 
          size="sm"
          className="!bg-gray-800 !text-white !rounded-md !font-medium"
        >
          {tc('close')}
        </Button>
      </div>
    </div>
  );
};

const NotificationDetailModal = ({ isOpen, onClose, notification }) => {
  const { tc } = useBatchTranslation();
  return (
    <CommonModal
      opened={isOpen}
      onClose={onClose}
      content={<NotificationModalContent notification={notification} onClose={onClose} />}
      size="lg"
    />
  );
};

export default NotificationDetailModal;