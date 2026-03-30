import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  ActionIcon,
  Select,
  Chip,
  Box,
  Title,
  Divider,
  Paper,
} from '@mantine/core';
import { Plus, X, DollarSign, Tag, Clock } from 'lucide-react';
import { useCreatePlan } from '../../hooks/usePlans';
import CommonModal from '../common/CommonModal';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const CreatePlanModal = ({ opened, onClose }) => {
  const { tc } = useBatchTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    features: [],
    currency: 'usd',
    billingInterval: 'month',
  });
  const [newFeature, setNewFeature] = useState('');
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    amount: false,
    features: false,
  });
  const [showErrors, setShowErrors] = useState(false);
  
  const createPlanMutation = useCreatePlan();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setTouched(prev => ({
        ...prev,
        features: true
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
    setTouched(prev => ({
      ...prev,
      features: true
    }));
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    setTouched({
      title: true,
      description: true,
      amount: true,
      features: true,
    });
    
    // Validate all required fields
    if (!formData.title || !formData.description || formData.amount <= 0 || formData.features.length === 0) {
      return;
    }

    try {
      await createPlanMutation.mutateAsync(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      features: [],
      currency: 'usd',
      billingInterval: 'month',
    });
    setNewFeature('');
    setTouched({
      title: false,
      description: false,
      amount: false,
      features: false,
    });
    setShowErrors(false);
    onClose();
  };

  const modalContent = (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title order={2} className="!text-2xl !font-semibold !text-[#323334] !mb-1">
            {tc('createNewPlan')}
          </Title>
          <Text size="sm" c="dimmed">
            {tc('setupNewSubscriptionPlan')}
          </Text>
        </div>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={handleClose}
          className="!text-gray-500 hover:!text-gray-700"
        >
          <X size={20} />
        </ActionIcon>
      </div>

      <Divider mb="lg" />

      <Stack spacing="lg">
        {/* Basic Information */}
        <Paper p="md" radius="md" className="!bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} className="text-[#556B2F]" />
            <Text fw={600} size="sm" className="!text-[#323334]">
              {tc('basicInformation')}
            </Text>
          </div>
          
          <Stack spacing="md">
            <TextInput
              label={tc('planTitle')}
              placeholder={tc('planTitlePlaceholder')}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              error={(touched.title || showErrors) && !formData.title ? tc('planTitleRequired') : null}
              styles={{
                label: { color: '#323334', fontWeight: 500, marginBottom: 8 },
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  height: '42px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
            
            <Textarea
              label={tc('description')}
              placeholder={tc('descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              minRows={3}
              error={(touched.description || showErrors) && !formData.description ? tc('planDescriptionRequired') : null}
              styles={{
                label: { color: '#323334', fontWeight: 500, marginBottom: 8 },
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
          </Stack>
        </Paper>

        {/* Pricing Information */}
        <Paper p="md" radius="md" className="!bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-[#556B2F]" />
            <Text fw={600} size="sm" className="!text-[#323334]">
              {tc('pricingAndBilling')}
            </Text>
          </div>
          
          <Group grow>
            <NumberInput
              label={tc('price')}
              placeholder="0.00"
              value={formData.amount}
              onChange={(value) => handleInputChange('amount', value || 0)}
              min={0}
              precision={2}
              required
              error={(touched.amount || showErrors) && formData.amount <= 0 ? tc('priceGreaterThanZero') : null}
              leftSection={<DollarSign size={16} className="text-gray-500" />}
              styles={{
                label: { color: '#323334', fontWeight: 500, marginBottom: 8 },
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  height: '42px',
                  paddingLeft: '40px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
            
            <Select
              label={tc('currency')}
              value={formData.currency}
              onChange={(value) => handleInputChange('currency', value)}
              data={[
                { value: 'usd', label: tc('usdLabel') },
                { value: 'eur', label: tc('eurLabel') },
                { value: 'gbp', label: tc('gbpLabel') },
                { value: 'cad', label: tc('cadLabel') },
                { value: 'aud', label: tc('audLabel') },
              ]}
              styles={{
                label: { color: '#323334', fontWeight: 500, marginBottom: 8 },
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  height: '42px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
            
            <Select
              label={tc('billingInterval')}
              value={formData.billingInterval}
              onChange={(value) => handleInputChange('billingInterval', value)}
              data={[
                { value: 'day', label: tc('daily') },
                { value: 'week', label: tc('weekly') },
                { value: 'month', label: tc('monthly') },
                { value: 'year', label: tc('yearly') },
              ]}
              leftSection={<Clock size={16} className="text-gray-500" />}
              styles={{
                label: { color: '#323334', fontWeight: 500, marginBottom: 8 },
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  height: '42px',
                  paddingLeft: '40px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
          </Group>
        </Paper>

        {/* Features */}
        <Paper p="md" radius="md" className="!bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={18} className="text-[#556B2F]" />
            <Text fw={600} size="sm" className="!text-[#323334]">
              {tc('planFeatures')}
            </Text>
          </div>
          
          <Group mb="md">
            <TextInput
              placeholder={tc('addFeaturePlaceholder')}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: '#fff',
                  border: '1px solid #E6E6E6',
                  borderRadius: '8px',
                  height: '42px',
                  '&:focus': { borderColor: '#556B2F' }
                }
              }}
            />
            <ActionIcon
              variant="filled"
              size="lg"
              onClick={addFeature}
              disabled={!newFeature.trim()}
              className="!bg-[#556B2F] hover:!bg-[#4a5f29] !h-[42px] !w-[42px]"
            >
              <Plus size={18} />
            </ActionIcon>
          </Group>
          
          {formData.features.length > 0 ? (
            <Box>
              <Text size="xs" c="dimmed" mb="xs">
                {tc('featuresIncluded', { count: formData.features.length })}
              </Text>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-[#556B2F] text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <span>{feature}</span>
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      onClick={() => removeFeature(index)}
                      className="!text-white hover:!bg-white/20 !h-5 !w-5"
                    >
                      <X size={12} />
                    </ActionIcon>
                  </div>
                ))}
              </div>
            </Box>
          ) : (
            (touched.features || showErrors) && (
              <Text size="xs" color="red" mt="xs">
                {tc('atLeastOneFeatureRequired')}
              </Text>
            )
          )}
        </Paper>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            size="md"
            radius="md"
            styles={{
              root: {
                border: '1px solid #E6E6E6',
                color: '#323334',
                height: '42px',
                minWidth: '100px',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }
            }}
          >
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createPlanMutation.isLoading}
            size="md"
            radius="md"
            styles={{
              root: {
                backgroundColor: '#323334',
                height: '42px',
                minWidth: '120px',
                '&:hover': { backgroundColor: '#2a2b2c' }
              }
            }}
          >
            {tc('createPlan')}
          </Button>
        </div>
      </Stack>
    </div>
  );

  return (
    <CommonModal
      opened={opened}
      onClose={handleClose}
      content={modalContent}
      size="lg"
      styles={{
        content: {
          maxWidth: '700px',
          borderRadius: '16px',
          padding: 0,
          overflow: 'hidden'
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

export default CreatePlanModal;