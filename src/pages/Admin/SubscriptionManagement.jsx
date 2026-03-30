import React, { useState } from 'react';
import { Button, Card, TextInput, Group, Text, ActionIcon, Tabs, Loader, Alert, Skeleton } from '@mantine/core';
import { Edit, Trash2, Check, Plus, AlertCircle } from 'lucide-react';
import { EditIcon, SmallEditIcon } from '../../components/common/Svgs';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import GoogleAnalyticsModal from '../../components/modals/GoogleAnalyticsModal';
import CreatePlanModal from '../../components/modals/CreatePlanModal';
import EditPlanModal from '../../components/modals/EditPlanModal';
import { useGetAllPlans, useDeletePlan, useRemoveFeatureFromPlan } from '../../hooks/usePlans';
import { toast } from 'sonner';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';

const SubscriptionPlanCard = ({ plan, onEdit, onDelete, onDeleteFeature, onAddFeature }) => {
  const { tc } = useBatchTranslation();
  const [newFeature, setNewFeature] = useState('');
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      onAddFeature(plan._id, [...plan.features, newFeature.trim()]);
      setNewFeature('');
      setIsAddingFeature(false);
    }
  };

  const handleDeleteFeature = (featureIndex) => {
    const updatedFeatures = plan.features.filter((_, index) => index !== featureIndex);
    onDeleteFeature(plan._id, updatedFeatures);
  };

  return (
    <Card shadow="sm" p="xl" radius="lg" withBorder={true} borderColor="#D9E2F4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Text className='!text-2xl !font-bold' fw={700}>{plan.title}</Text>
          <div className="ml-3 cursor-pointer" onClick={() => onEdit(plan)}>
            <EditIcon />
          </div>
          <div className="ml-2 cursor-pointer" onClick={() => onDelete(plan._id)}>
            <Trash2 size={20} className="text-red-500 hover:text-red-700" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex mt-6 items-start mb-3">
            <Text size="sm" c="#7184B4">{plan.description}</Text>
            <div className="ml-1 mt-1 cursor-pointer" onClick={() => onEdit(plan)}>
              <SmallEditIcon />
            </div>
          </div>

          <TextInput
            leftSection={<Text size="sm" color="#8E8E8E">${plan.currency?.toUpperCase()}</Text>}
            value={plan.amount?.toFixed(2) || '0.00'}
            radius="md"
            size="lg"
            readOnly
            classNames={{
              input: '!bg-gray-50 !border-gray-200 !text-[#8E8E8E] !text-xl'
            }}
          />
        </div>

        <div>
          <Text size="lg" fw={500} mb="sm">
            {tc('include')}
          </Text>

          <div className="space-y-3">
            {plan.features?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check size={24} className="text-[#7D9A4B] mr-3" />
                  <Text size="sm">{feature}</Text>
                </div>
                <ActionIcon 
                  variant="light" 
                  color="red" 
                  radius="xl" 
                  size="lg"
                  onClick={() => handleDeleteFeature(index)}
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </div>
            ))}
          </div>
        </div>

        {isAddingFeature ? (
          <Group>
            <TextInput
              placeholder={tc('enterNewFeature')}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              style={{ flex: 1 }}
            />
            <Button size="sm" onClick={handleAddFeature} disabled={!newFeature.trim()}>
              {tc('add')}
            </Button>
            <Button size="sm" variant="default" onClick={() => {
              setIsAddingFeature(false);
              setNewFeature('');
            }}>
              {tc('cancel')}
            </Button>
          </Group>
        ) : (
          <Button
            variant='subtle'
            leftSection={<Plus size={16} />}
            mt="xs"
            size='md'
            className="!text-[#3669D8] !px-0"
            onClick={() => setIsAddingFeature(true)}
          >
            {tc('add')}
          </Button>
        )}
      </div>
    </Card>
  );
};

const IntegrationItem = ({ title, description, buttonText, onButtonClick, isConnected }) => {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
      <div>
        <div className="flex items-center gap-2">
          <Text className='!text-lg' fw={500}>{title}</Text>
          {isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
        <Text size="md" c="gray.6">{description}</Text>
      </div>
      <Button 
        variant={isConnected ? "filled" : "default"} 
        color={isConnected ? "green" : "gray"} 
        radius="md"
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const SubscriptionManagement = () => {
  const { tc } = useBatchTranslation();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [gaModalOpened, setGaModalOpened] = useState(false);
  const [createPlanModalOpened, setCreatePlanModalOpened] = useState(false);
  const [editPlanModalOpened, setEditPlanModalOpened] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const { isConnected: gaConnected, disconnectGoogleAnalytics } = useAnalytics();
  
  // API hooks
  const { data: plans, isLoading: plansLoading, error: plansError } = useGetAllPlans();
  const deletePlanMutation = useDeletePlan();
  const removeFeatureMutation = useRemoveFeatureFromPlan();

  // Add a handler to explicitly update the activeTab state
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleGoogleAnalyticsAction = () => {
    if (gaConnected) {
      disconnectGoogleAnalytics();
    } else {
      setGaModalOpened(true);
    }
  };
  
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setEditPlanModalOpened(true);
  };
  
  const handleDeletePlan = async (planId) => {
    if (window.confirm(tc('areYouSureDeletePlan'))) {
      try {
        await deletePlanMutation.mutateAsync(planId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };
  
  const handleAddFeature = async (planId, features) => {
    try {
      await removeFeatureMutation.mutateAsync({ id: planId, features });
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const handleDeleteFeature = async (planId, features) => {
    try {
      await removeFeatureMutation.mutateAsync({ id: planId, features });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <BatchTranslationLoader>
      <div className="p-5 bg-[#fff] rounded-lg h-[83vh] overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            {activeTab === 'subscriptions' ? (
              <>
                <div className="text-2xl">{tc('subscriptions')}</div>
                <p className="text-[#939799] text-md">
                  {tc('managePricingPlansTrialsAndPromotionalOffers')}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl">{tc('integrations')}</div>
                <p className="text-[#939799] text-md">
                  {tc('connectAndManageThirdPartyTools')}
                </p>
              </>
            )}
          </div>

        </div>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="pills"
          color="#323333"
          classNames={{
            list: 'bg-gray-100 p-1 w-59 rounded-xl mb-6',
            tab: 'text-gray-500 font-semibold px-4 py-2 h-auto rounded-lg data-[active]:bg-gray-800 data-[active]:text-white',
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="subscriptions">
              {tc('subscriptions')}
            </Tabs.Tab>
            <Tabs.Tab value="integrations">
              {tc('integrations')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="subscriptions">
            {plansLoading ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {/* Skeleton cards for loading state */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} shadow="sm" p="xl" radius="lg" withBorder={true} borderColor="#D9E2F4">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton height={32} width="60%" />
                        <div className="flex gap-2">
                          <Skeleton height={20} width={20} radius="sm" />
                          <Skeleton height={20} width={20} radius="sm" />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <Skeleton height={16} width="80%" mb="md" />
                          <Skeleton height={48} width="100%" radius="md" />
                        </div>
                        
                        <div>
                          <Skeleton height={20} width="30%" mb="sm" />
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, featureIndex) => (
                              <div key={featureIndex} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Skeleton height={24} width={24} radius="sm" className="mr-3" />
                                  <Skeleton height={16} width="70%" />
                                </div>
                                <Skeleton height={32} width={32} radius="xl" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Skeleton height={36} width="40%" />
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <Skeleton height={80} width={80} radius="50%" />
                    <Skeleton height={16} width="120px" mt="sm" />
                  </div>
                </div>
              </div>
            ) : plansError ? (
              <Alert icon={<AlertCircle size={16} />} title={tc('error')} color="red">
                {tc('failedToLoadPlans')}
              </Alert>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {Array.isArray(plans) && plans.length > 0 ? (
                    plans.map((plan) => (
                      <SubscriptionPlanCard
                        key={plan._id}
                        plan={plan}
                        onEdit={handleEditPlan}
                        onDelete={handleDeletePlan}
                        onDeleteFeature={handleDeleteFeature}
                        onAddFeature={handleAddFeature}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Text size="lg" c="dimmed">
                        {tc('noPlansFoundCreateFirstPlan')}
                      </Text>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <Button
                      variant="filled"
                      color="green.1"
                      size="xl"
                      className="!w-20 !h-20 !p-0 !rounded-full"
                      onClick={() => setCreatePlanModalOpened(true)}
                    >
                      <Plus size={32} className="text-green-600" />
                    </Button>
                    <Text mt="sm">{tc('createNewPackage')}</Text>
                  </div>
                </div>
              </div>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="integrations">
            <div className='p-2 max-w-full'>
              <IntegrationItem
                title={tc('googleAnalytics')}
                description={tc('trackUserBehaviorAndPlatformAnalytics')}
                buttonText={gaConnected ? tc('connected') : tc('connectNow')}
                onButtonClick={handleGoogleAnalyticsAction}
                isConnected={gaConnected}
              />

            </div>
          </Tabs.Panel>
        </Tabs>

        {/* Google Analytics Modal */}
        <GoogleAnalyticsModal 
          opened={gaModalOpened} 
          onClose={() => setGaModalOpened(false)} 
        />
        
        {/* Create Plan Modal */}
        <CreatePlanModal
          opened={createPlanModalOpened}
          onClose={() => setCreatePlanModalOpened(false)}
        />
        
        {/* Edit Plan Modal */}
        <EditPlanModal
          opened={editPlanModalOpened}
          onClose={() => {
            setEditPlanModalOpened(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
        />
      </div>
    </BatchTranslationLoader>
  );
};

export default SubscriptionManagement;