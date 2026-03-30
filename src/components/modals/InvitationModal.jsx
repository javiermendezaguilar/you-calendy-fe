import React, { useState } from 'react';
import {
  Text,
  Button,
  Group,
  Stack,
  Alert,
} from '@mantine/core';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import CommonModal from '../common/CommonModal';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const InvitationModal = ({ opened, onClose, invitationData }) => {
  const { tc } = useBatchTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationData?.invitationLink || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const modalContent = (
    <div className="p-6">
      <Stack spacing="md">
        {/* Success Message */}
        <Alert icon={<Check size={16} />} color="green">
          <Text size="sm">
            Client created successfully! The invitation link is ready to share.
          </Text>
        </Alert>

        {/* SMS Warning */}
        {invitationData?.smsStatus && !invitationData.smsStatus.sent && (
          <Alert
            icon={<AlertTriangle size={16} />}
            title="SMS Not Sent"
            color="orange"
          >
            <Text size="sm">
              SMS invitation could not be sent due to insufficient credits.
            </Text>
            <Text size="xs" mt="xs">
              Current SMS credits: {invitationData.smsStatus.businessCredits}
            </Text>
          </Alert>
        )}

        {/* Invitation Link */}
        <div>
          <Text size="sm" fw={500} mb="xs">
            Invitation Link
          </Text>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <Text size="sm" className="break-all text-gray-700">
              {invitationData?.invitationLink || ''}
            </Text>
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
            fullWidth
            styles={{
              root: {
                border: '1px solid #E6E6E6',
                color: '#333',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }
            }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text size="xs" c="dimmed">
            <strong>How to share:</strong>
            <br />
            1. Copy the invitation link above
            <br />
            2. Send it via WhatsApp, SMS, or email
            <br />
            3. Client will receive the invitation to complete their profile
          </Text>
        </div>

        {/* Action Buttons */}
        <Group justify="center" mt="md">
          <Button
            onClick={handleClose}
            size="md"
            radius="md"
            styles={{
              root: {
                backgroundColor: '#343a40',
                minWidth: '120px',
                '&:hover': { backgroundColor: '#000000' }
              }
            }}
          >
            Done
          </Button>
        </Group>
      </Stack>
    </div>
  );

  return (
    <CommonModal
      opened={opened}
      onClose={handleClose}
      content={modalContent}
      size="md"
      styles={{
        content: {
          borderRadius: '30px',
          border: '1px solid rgba(228, 233, 242, 0.5)',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
          padding: 0,
          maxWidth: '500px'
        },
        body: {
          padding: 0,
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    />
  );
};

export default InvitationModal;
