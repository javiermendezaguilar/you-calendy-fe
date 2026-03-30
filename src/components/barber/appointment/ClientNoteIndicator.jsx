import React, { useState } from 'react';
import { ActionIcon, Tooltip, Popover, Text, Badge } from '@mantine/core';
import { FaBell } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useBatchTranslation } from '../../../contexts/BatchTranslationContext';

const ClientNoteIndicator = ({ 
  clientId, 
  clientName, 
  noteContent, 
  hasImage = false, 
  imageSrc,
  hasDiscount = false,
  discountPercent = 0,
  discountReason = '',
  onMarkAsRead
}) => {
  const { tc } = useBatchTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <Popover 
      opened={opened} 
      onChange={setOpened} 
      position="bottom-end" 
      withArrow 
      shadow="md"
      width={300}
      styles={{
        dropdown: {
          padding: '12px',
          borderRadius: '12px'
        }
      }}
    >
      <Popover.Target>
        <Tooltip label={`${clientName} ${tc('hasLeftANote')}`} withArrow position="top">
          <ActionIcon 
            onClick={() => setOpened((o) => !o)}
            size="md" 
            radius="xl" 
            variant="light" 
            color="orange"
            className="!bg-orange-100 !hover:bg-orange-200 !transition-all"
          >
            <FaBell className="text-orange-600" />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="relative">
          <ActionIcon 
            className="!absolute !top-0 !right-0" 
            size="sm" 
            variant="subtle"
            onClick={() => {
              setOpened(false);
              if (onMarkAsRead) onMarkAsRead(clientId);
            }}
          >
            <IoMdClose size={16} />
          </ActionIcon>

          <div className="mb-3">
            <Text size="sm" weight={600} className="!mb-1">
              {clientName}
            </Text>
            
            {hasDiscount && (
              <Badge color="green" className="!mb-2">
                {discountPercent}% {tc('discount')} - {discountReason}
              </Badge>
            )}
            
            <Text size="xs" className="!text-gray-700 !mb-2">
              {tc('clientNote')}:
            </Text>
            
            <Text size="sm" className="!bg-gray-50 !p-2 !rounded-md !mb-2">
              {noteContent}
            </Text>
          </div>

          {hasImage && imageSrc && (
            <div>
              <Text size="xs" className="!text-gray-700 !mb-1">
                {tc('referenceImage')}:
              </Text>
              <img 
                src={imageSrc} 
                alt="Client reference" 
                className="w-full h-auto max-h-[150px] object-contain rounded-md" 
              />
            </div>
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ClientNoteIndicator; 