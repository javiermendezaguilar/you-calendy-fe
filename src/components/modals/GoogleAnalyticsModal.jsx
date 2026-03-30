import React, { useState } from 'react';
import { Modal, TextInput, Button, Text, Alert, Group, Stack } from '@mantine/core';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const GoogleAnalyticsModal = ({ opened, onClose }) => {
  const { tc } = useBatchTranslation();
  const [measurementId, setMeasurementId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectGoogleAnalytics, isConnected, measurementId: currentId } = useAnalytics();

  const handleConnect = async () => {
    if (!measurementId.trim()) {
      toast.error(tc('pleaseEnterValidMeasurementId'));
      return;
    }

    if (!measurementId.match(/^G-[A-Z0-9]+$/)) {
      toast.error(tc('invalidMeasurementIdFormat'));
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectGoogleAnalytics(measurementId.trim());
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(tc('failedToConnectGA'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenGASetup = () => {
    window.open('https://analytics.google.com/analytics/web/provision/#/provision', '_blank');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={tc('connectGoogleAnalytics')}
      size="md"
      centered
    >
      <Stack spacing="md">
        {isConnected ? (
          <Alert icon={<CheckCircle size={16} />} color="green">
            <Text size="sm">
              {tc('googleAnalyticsConnected')} <strong>{currentId}</strong>
            </Text>
          </Alert>
        ) : (
          <Alert icon={<AlertCircle size={16} />} color="blue">
            <Text size="sm">
              {tc('connectGA4Property')}
            </Text>
          </Alert>
        )}

        <div>
          <Text size="sm" fw={500} mb="xs">
            {tc('ga4MeasurementId')}
          </Text>
          <TextInput
            placeholder={tc('measurementIdPlaceholder')}
            value={measurementId}
            onChange={(e) => setMeasurementId(e.target.value)}
            disabled={isConnecting}
            description={tc('findInGA4Settings')}
          />
        </div>

        <Button
          variant="subtle"
          leftSection={<ExternalLink size={16} />}
          onClick={handleOpenGASetup}
          size="sm"
        >
          {tc('dontHaveGA')} {tc('setupHere')}
        </Button>

        <Group justify="space-between" mt="md">
          <Button variant="light" onClick={onClose} disabled={isConnecting}>
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleConnect}
            loading={isConnecting}
            disabled={!measurementId.trim() || isConnecting}
          >
            {isConnected ? tc('updateConnection') : tc('connectNow')}
          </Button>
        </Group>

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <Text size="xs" c="dimmed">
            <strong>{tc('howToFindMeasurementId')}:</strong>
            <br />
            1. {tc('goToGoogleAnalytics')}
            <br />
            2. {tc('selectWebStream')}
            <br />
            3. {tc('copyMeasurementId')}
          </Text>
        </div>
      </Stack>
    </Modal>
  );
};

export default GoogleAnalyticsModal;
