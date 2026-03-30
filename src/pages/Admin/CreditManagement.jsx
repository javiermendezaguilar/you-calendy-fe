import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Badge,
  ActionIcon,
  Group,
  Text,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Switch,
  Stack,
  Card,
  Title,
  Alert,
  Skeleton,
  NumberFormatter,
  Box,
  Container,
  Paper,
  Flex
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Edit, Trash2, CreditCard, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAdminCreditProducts,
  createCreditProduct,
  updateCreditProduct,
  deleteCreditProduct
} from '../../services/creditsAPI';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';
import BatchTranslationLoader from '../../components/barber/BatchTranslationLoader';
import CommonModal from '../../components/common/CommonModal';

const CreditManagement = () => {
  const { tc } = useBatchTranslation();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch credit products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['credit-products'],
    queryFn: async () => {
      const response = await getAdminCreditProducts();
      return response;
    },
    select: (data) => {
      
      // Handle axios response structure: response.data.data
      let products = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        products = data.data.data;
      } else if (Array.isArray(data?.data)) {
        products = data.data;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      if (!Array.isArray(products) || products.length === 0) {
        return [];
      }
      
      const mappedProducts = products.map(product => {
        const sms = Number(product.smsCredits) || 0;
        const email = Number(product.emailCredits) || 0;
        let type = 'Both';
        if (sms > 0 && email === 0) type = 'SMS';
        else if (email > 0 && sms === 0) type = 'Email';
        return {
          id: product._id,
          name: product.title,
          description: product.description,
          price: product.amount,
            // keep aggregated for backwards display if needed
          totalCredits: sms + email,
          type,
          isActive: product.isActive,
          smsCredits: sms,
          emailCredits: email,
          stripeProductId: product.stripeProductId,
          stripePriceId: product.stripePriceId
        };
      });
      
      return mappedProducts;
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 or 401 errors
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Form for creating/editing products
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      smsCredits: 0,
      emailCredits: 0,
      isActive: true
    },
    validate: {
      name: (value) => !value ? tc('nameRequired') : null,
      description: (value) => !value ? tc('descriptionRequired') : null,
      price: (value) => value <= 0 ? tc('priceRequired') : null,
      smsCredits: (value, values) => (value <= 0 && values.emailCredits <= 0) ? tc('atLeastOneCreditRequired') : null,
      emailCredits: (value, values) => (value <= 0 && values.smsCredits <= 0) ? tc('atLeastOneCreditRequired') : null,
    },
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createCreditProduct,
    onSuccess: (data) => {
      toast.success(tc('packageCreatedSuccessfully'));
      queryClient.invalidateQueries(['credit-products']);
      close();
      form.reset();
    },
    onError: (error) => {
      const getErrorMessage = () => {
        if (error?.response?.status === 404) {
          return 'API endpoint not found. Please ensure the backend server is running.';
        }
        if (error?.response?.status === 401) {
          return 'Authentication required. Please check your admin credentials.';
        }
        return error.response?.data?.message || tc('failedToCreatePackage');
      };
      toast.error(getErrorMessage());
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCreditProduct(id, data),
    onSuccess: (data) => {
      toast.success(tc('packageUpdatedSuccessfully'));
      queryClient.invalidateQueries(['credit-products']);
      close();
      form.reset();
      setEditingProduct(null);
    },
    onError: (error) => {
      const getErrorMessage = () => {
        if (error?.response?.status === 404) {
          return 'API endpoint not found. Please ensure the backend server is running.';
        }
        if (error?.response?.status === 401) {
          return 'Authentication required. Please check your admin credentials.';
        }
        return error.response?.data?.message || tc('failedToUpdatePackage');
      };
      toast.error(getErrorMessage());
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCreditProduct,
    onSuccess: () => {
      toast.success(tc('packageDeletedSuccessfully'));
      queryClient.invalidateQueries(['credit-products']);
      closeDeleteModal();
      setProductToDelete(null);
    },
    onError: (error) => {
      const getErrorMessage = () => {
        if (error?.response?.status === 404) {
          return 'API endpoint not found. Please ensure the backend server is running.';
        }
        if (error?.response?.status === 401) {
          return 'Authentication required. Please check your admin credentials.';
        }
        return error.response?.data?.message || tc('failedToDeletePackage');
      };
      toast.error(getErrorMessage());
    },
  });

  const handleSubmit = (values) => {
    // Map frontend fields to API expected fields
    const apiData = {
      title: values.name,
      description: values.description,
      amount: values.price,
      smsCredits: Number(values.smsCredits) || 0,
      emailCredits: Number(values.emailCredits) || 0,
      isActive: values.isActive
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: apiData });
    } else {
      createMutation.mutate(apiData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setValues({
      name: product.name,
      description: product.description,
      price: product.price,
      smsCredits: product.smsCredits,
      emailCredits: product.emailCredits,
      isActive: product.isActive
    });
    open();
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    form.reset();
    open();
  };

  if (isLoading) {
    return (
      <BatchTranslationLoader>
        <Box component="main" className="!h-[83vh] !overflow-auto">
          <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
            <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
              <Box className="!p-3">
                <Skeleton height={32} width={250} mb={8} />
                <Skeleton height={20} width={400} />
              </Box>
              <div className="!p-3 !mt-3">
                <Skeleton height={40} width={150} radius="md" />
              </div>
              {/* Table Skeleton */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="flex justify-between items-center p-4 border-b border-gray-100">
                      <div className="flex-1">
                        <Skeleton height={20} width={200} mb={8} />
                        <Skeleton height={16} width={300} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton height={24} width={80} radius="xl" />
                        <Skeleton height={20} width={60} />
                        <Skeleton height={32} width={32} radius="md" />
                        <Skeleton height={32} width={32} radius="md" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Container>
          </Paper>
        </Box>
      </BatchTranslationLoader>
    );
  }

  if (error) {
    const getErrorMessage = () => {
      if (error?.response?.status === 404) {
        return tc('apiEndpointNotFound');
      }
      if (error?.response?.status === 401) {
        return tc('authenticationRequired');
      }
      return tc('failedToLoadPackages');
    };

    return (
      <BatchTranslationLoader>
        <Box component="main" className="!h-[83vh] !overflow-auto">
          <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
            <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
              <Box className="!p-3">
                <Alert icon={<AlertCircle size={16} />} title={tc('error')} color="red">
                  {getErrorMessage()}
                  {import.meta.env.DEV && (
                    <Text size="sm" mt="xs" c="dimmed">
                      {tc('developmentMode')}: {tc('checkBackendServer')} {import.meta.env.VITE_API_URL || 'http://localhost:5000'}
                    </Text>
                  )}
                </Alert>
              </Box>
            </Container>
          </Paper>
        </Box>
      </BatchTranslationLoader>
    );
  }

  return (
    <BatchTranslationLoader>
      <Box component="main" className="!h-[83vh] !overflow-auto">
        <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
          <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
            <Box className="!p-3">
              <div className="text-2xl">
                {tc('creditPackageManagement')}
              </div>
              <Text c="rgba(147,151,153,1)" size="md" mt={2}>
                {tc('manageCreditPackagesDescription')}
              </Text>
            </Box>
            <Flex
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              className="!p-3 !mt-3"
              direction={{ base: "column", md: "row" }}
            >
              <div></div>
              <Group>
                <Button
                  leftSection={<Plus size={16} />}
                  onClick={handleCreateNew}
                  loading={createMutation.isPending}
                  h={50}
                  radius="md"
                  bg="#323334"
                  c="white"
                >
                  {tc('addNewPackage')}
                </Button>
              </Group>
            </Flex>

            {/* Products Table */}
            <div 
              style={{ 
                height: '1px', 
                backgroundColor: '#e9ecef', 
                marginTop: '24px',
                marginBottom: '24px' 
              }} 
            />
            <div style={{ padding: '0 24px', paddingBottom: '24px' }}>
              <div className="space-y-4">
                {products?.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
                      <Text size="lg" fw={500} c="dimmed">
                        {tc('noPackagesFound')}
                      </Text>
                      <Text size="sm" c="dimmed" mt={4}>
                        {tc('createFirstPackage')}
                      </Text>
                    </div>
                  ) : (
                    products?.map((product) => (
                     <Card key={product.id} shadow="md" padding="xl" radius="lg" withBorder 
                           style={{ 
                             marginBottom: '20px', 
                             background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                             border: '1px solid #e9ecef',
                             transition: 'all 0.3s ease'
                           }}
                           className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                       <Group justify="space-between" align="flex-start">
                         <Box style={{ flex: 1 }}>
                           <Group gap="sm" mb="md">
                             <Text fw={600} size="xl" c="#2c2e33">{product.name}</Text>
                             <Badge 
                               color={product.isActive ? 'green' : 'red'} 
                               variant="light" 
                               size="sm"
                               radius="md"
                             >
                               {product.isActive ? tc('active') : tc('inactive')}
                             </Badge>
                           </Group>
                           
                           <Text size="md" c="dimmed" mb="lg" style={{ lineHeight: 1.5 }}>
                             {product.description}
                           </Text>
                           
                           <Group gap="lg" mb="md">
                             <Box>
                               <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                 {tc('price')}
                               </Text>
                               <Text size="xl" fw={700} c="#228be6">
                                 ${product.price}
                               </Text>
                             </Box>
                             
                             <Box>
                               <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                 {tc('smsCredits')}
                               </Text>
                               <Text size="lg" fw={600} c="#495057">
                                 {product.smsCredits}
                               </Text>
                             </Box>
                             <Box>
                               <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                 {tc('emailCredits')}
                               </Text>
                               <Text size="lg" fw={600} c="#495057">
                                 {product.emailCredits}
                               </Text>
                             </Box>
                             <Box>
                               <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                                 {tc('total')}
                               </Text>
                               <Text size="lg" fw={600} c="#495057">
                                 {product.totalCredits}
                               </Text>
                             </Box>
                           </Group>
                         </Box>
                         
                         <Group gap="sm" style={{ flexShrink: 0 }}>
                           <Button
                             size="md"
                             variant="light"
                             color="dark"
                             onClick={() => handleEdit(product)}
                             radius="md"
                             style={{ minWidth: '80px' }}
                           >
                             {tc('edit')}
                           </Button>
                           <Button
                             size="md"
                             color="red"
                             variant="light"
                             onClick={() => handleDelete(product)}
                             radius="md"
                             style={{ minWidth: '80px' }}
                           >
                             {tc('delete')}
                           </Button>
                         </Group>
                       </Group>
                     </Card>
                   ))
                )}
              </div>
            </div>
          </Container>
        </Paper>
      </Box>

      {/* Create/Edit Modal */}
      <CommonModal
        opened={opened}
        onClose={close}
        size="md"
        content={
          <div>
            <Title order={3} mb="lg">
              {editingProduct ? tc('editCreditPackage') : tc('createCreditPackage')}
            </Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label={tc('packageName')}
                  placeholder={tc('enterPackageName')}
                  required
                  {...form.getInputProps('name')}
                />

                <Textarea
                  label={tc('packageDescription')}
                  placeholder={tc('enterPackageDescription')}
                  required
                  {...form.getInputProps('description')}
                  rows={3}
                />

                <NumberInput
                  label={tc('price')}
                  placeholder={tc('enterPrice')}
                  required
                  min={0}
                  {...form.getInputProps('price')}
                />

                <Group grow>
                  <NumberInput
                    label={tc('smsCredits')}
                    placeholder={tc('enterSmsCredits')}
                    min={0}
                    {...form.getInputProps('smsCredits')}
                  />
                  <NumberInput
                    label={tc('emailCredits')}
                    placeholder={tc('enterEmailCredits')}
                    min={0}
                    {...form.getInputProps('emailCredits')}
                  />
                </Group>
                <Alert color="blue" variant="light" title={tc('credits')}>
                  {tc('atLeastOneCreditRequired')}
                </Alert>

                <Switch
                  label={tc('active')}
                  description={tc('packageAvailableForPurchase')}
                  color="dark"
                  {...form.getInputProps('isActive', { type: 'checkbox' })}
                />

                <Group justify="flex-end" mt="lg">
                  <Button variant="outline" color="dark" onClick={close}>
                    {tc('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    color="dark"
                    loading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProduct ? tc('update') : tc('create')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <CommonModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        size="md"
        content={
          <div>
            <Group gap="sm" mb="xl">
              <Box 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text size="xl" c="red" fw={600}>⚠</Text>
              </Box>
              <Box>
                <Title order={3} c="red" mb={4}>
                  {tc('deleteCreditPackage')}
                </Title>
                <Text size="md" c="dimmed">
                  {tc('confirmDeletePackage')}
                </Text>
              </Box>
            </Group>
            
            <Stack gap="lg">
              {productToDelete && (
                <Card 
                  withBorder 
                  padding="lg" 
                  radius="md"
                  style={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                    border: '1px solid #fecaca'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} size="lg" mb="sm">{productToDelete.name}</Text>
                      <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
                        {productToDelete.description}
                      </Text>
                      <Group gap="lg">
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
                            {tc('price')}
                          </Text>
                          <Text size="md" fw={600} c="#dc2626">
                            ${productToDelete.price}
                          </Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
                            {tc('credits')}
                          </Text>
                          <Text size="md" fw={600} c="#dc2626">
                            {productToDelete.credits} {tc('credits')}
                          </Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
                            {tc('type')}
                          </Text>
                          <Badge variant="outline" color="red" size="sm">
                            {productToDelete.type}
                          </Badge>
                        </Box>
                      </Group>
                    </Box>
                  </Group>
                </Card>
              )}
              
              <Box 
                style={{
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px'
                }}
              >
                <Text size="sm" c="red" fw={500} ta="center">
                  ⚠️ {tc('thisActionCannotBeUndone')}
                </Text>
              </Box>

              <Group justify="flex-end" mt="xl" gap="md">
                <Button 
                  variant="outline" 
                  color="gray" 
                  onClick={closeDeleteModal}
                  size="md"
                  radius="md"
                  style={{ minWidth: '100px' }}
                >
                  {tc('cancel')}
                </Button>
                <Button
                  color="red"
                  onClick={confirmDelete}
                  loading={deleteMutation.isPending}
                  size="md"
                  radius="md"
                  style={{ minWidth: '100px' }}
                >
                  {tc('delete')}
                </Button>
              </Group>
            </Stack>
          </div>
        }
      />
    </BatchTranslationLoader>
  );
};

export default CreditManagement;