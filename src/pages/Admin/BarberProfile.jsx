import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Text,
  Title,
  Flex,
  Group,
  RingProgress,
  Menu,
  Modal,
  ActionIcon,
  Loader,
  Center,
  Skeleton,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import {
  FaArrowLeft,
  FaChevronDown,
  FaSyncAlt,
  FaTrashAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdLockReset } from "react-icons/md";
import { ChevronDown, Lock } from "tabler-icons-react";
import { BiCalendar } from "react-icons/bi";
import { useParams, useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import CommonModal from "../../components/common/CommonModal";
import { useAdminBarberById, useUpdateBarberStatus, useDeleteBarber } from "../../hooks/useAdmin";
import { toast } from "sonner";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const StatCard = ({ label, value, progress, color, icon: Icon }) => {
  // Specific colors based on the card type
  const getColors = () => {
    if (color === 'blue') {
      return {
        ringColor: "#003366",
        iconBgColor: "#E3F2FD",
        iconColor: "#003366"
      };
    } else if (color === 'green') {
      return {
        ringColor: "#556B2F", 
        iconBgColor: "#F1F8E9",
        iconColor: "#556B2F"
      };
    } else { // teal
      return {
        ringColor: "#20B2AA", 
        iconBgColor: "#E0F2F1",
        iconColor: "#20B2AA"
      };
    }
  };

  const colors = getColors();

  return (
    <Paper 
      withBorder 
      p="md" 
      radius="md" 
      sx={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        minWidth: 0, // Allow flex items to shrink below their content size
        '@media (max-width: 768px)': {
          minWidth: '280px', // Minimum width on mobile
        }
      }}
    >
      <Flex 
        direction={{ base: 'column', sm: 'row' }} 
        justify="space-between" 
        align="center" 
        gap="md"
      >
        <RingProgress
          sections={[{ value: progress, color: colors.ringColor }]}
          size={120} // Reduced from 180 to 120 for better mobile fit
          thickness={16} // Reduced thickness proportionally
          rootColor="#f5f5f5"
          label={
            <Text fw={700} align="center" size={18}> {/* Reduced font size */}
              {value}
            </Text>
          }
        />
        <Flex direction="column" align="center" gap="sm">
          <Box 
            sx={{ 
              backgroundColor: colors.iconBgColor,
              borderRadius: '50%',
              width: 48, // Reduced from 54
              height: 48, // Reduced from 54
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon size={24} color={colors.iconColor} /> {/* Reduced from 28 */}
          </Box>
          <Text 
            transform="uppercase" 
            weight={600} 
            align="center" 
            color="dimmed" 
            size="xs" // Reduced from sm
            sx={{
              '@media (max-width: 768px)': {
                fontSize: '10px',
              }
            }}
          >
            {label}
          </Text>
        </Flex>
      </Flex>
    </Paper>
  );
};

const BarberProfile = () => {
  const { tc } = useBatchTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminBarberById(id);
  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useUpdateBarberStatus();
  const { mutate: deleteBarber, isLoading: isDeleting } = useDeleteBarber({
    onSuccess: () => {
      closeRemoveModal();
      toast.success(tc('barberRemovedSuccessfully'));
      navigate("/admin/barber-management");
    }
  });

  const [
    resetModalOpened,
    { open: openResetModal, close: closeResetModal },
  ] = useDisclosure(false);
  const [
    removeModalOpened,
    { open: openRemoveModal, close: closeRemoveModal },
  ] = useDisclosure(false);
  
  const handleStatusChange = (newStatus) => {
    updateStatus({ id, status: newStatus });
  };
  
  const handleRemoveBarber = () => {
    deleteBarber(id);
  };

  // Skeleton component for loading state
  const BarberProfileSkeleton = () => (
    <div className="h-[83vh] overflow-auto">
      <Paper shadow="sm" p="lg" radius="lg">
        {/* Header Skeleton */}
        <Flex justify="space-between" align="center" mb="lg">
          <Group>
            <Skeleton height={40} width={120} radius="md" />
          </Group>
          <Group>
            <Skeleton height={36} width={80} radius="md" />
            <Skeleton height={36} width={80} radius="md" />
          </Group>
        </Flex>
        
        {/* Title and Description Skeleton */}
        <div>
          <Skeleton height={32} width="60%" mb="xs" />
          <Skeleton height={16} width="80%" />
        </div>

        {/* Action Buttons Skeleton */}
        <Flex justify="start" gap="md" align="start" my="xl">
          <Skeleton height={40} width={140} radius="md" />
          <Skeleton height={40} width={165} radius="md" />
          <Skeleton height={40} width={165} radius="md" />
          <Skeleton height={40} width={190} radius="md" />
        </Flex>

        {/* Stats Cards Skeleton */}
        <Box my="xl">
          <Skeleton height={24} width={120} mb="md" />
          <Flex gap="lg" justify="space-between">
            {Array.from({ length: 3 }).map((_, index) => (
              <Paper key={index} p="md" radius="md" withBorder style={{ flex: 1 }}>
                <Flex direction="column" align="center" gap="md">
                  <Skeleton height={60} width={60} radius="xl" />
                  <Skeleton height={16} width="80%" />
                  <Skeleton height={20} width="60%" />
                </Flex>
              </Paper>
            ))}
          </Flex>
        </Box>

        {/* Business Info Skeleton */}
        <Box>
          <Skeleton height={24} width={150} mb="md" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Flex key={index} gap="md" align="center" mb="sm">
              <Skeleton height={16} width={120} />
              <Skeleton height={16} width={200} />
            </Flex>
          ))}
        </Box>
      </Paper>
    </div>
  );

  if (isLoading) {
    return <BarberProfileSkeleton />;
  }

  if (isError || !data) {
    return (
      <Box p="lg">
        <Title order={3}>{tc('barberNotFoundOrFailedToLoad')}</Title>
        <Button 
          component={Link} 
          to="/admin/barber-management"
          leftIcon={<IoArrowBackCircleOutline size={24} />}
          mt="md"
        >
          {tc('goBack')}
        </Button>
      </Box>
    );
  }

  const { barber, business, totalAppointments, totalRevenue, topClients } = data;
  const isActive = barber.status === 'activated';

  const statsData = [
    {
      label: tc('totalAppointments'),
      value: totalAppointments.toString(),
      progress: Math.min((totalAppointments / 100) * 100, 100), // Cap at 100%
      color: "blue",
      icon: FaCalendarAlt,
    },
    {
      label: tc('totalRevenue'),
      value: `$${totalRevenue}`,
      progress: totalRevenue > 0 ? Math.min((totalRevenue / 1000) * 100, 100) : 0, // Fixed: Show 0% when revenue is 0, cap at 100%
      color: "green",
      icon: FaMoneyBillWave,
    },
    {
      label: tc('uniqueClients'),
      value: topClients.length.toString(),
      progress: Math.min((topClients.length / 50) * 100, 100), // Cap at 100%
      color: "teal",
      icon: FaUserFriends,
    },
  ];

  return (
    <BatchTranslationLoader>
      <div className="h-[83vh] overflow-auto">
        <Paper shadow="sm" p="lg" radius="lg">
          {/* Header */}
          <Flex justify="flex-start" align="center" mb="lg">
            <Group>
              <Button
                  component={Link}
                  to="/admin/barber-management"
                  size="lg"
                  className=" sm:!w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200"
                  leftIcon={<IoArrowBackCircleOutline size={24} />}
                >
                  {tc('goBack')}
                </Button>
            </Group>
          </Flex>
          <div>
              <div className="text-2xl">
                {tc('barberProfile')}: {barber.name}
              </div>
            <Text size="sm" color="dimmed">
              {tc('accessAccountStatusRevenueInsightsAndServiceHistory')}
            </Text>
          </div>


          {/* Action Buttons */}
          <Flex justify="start" gap="md" align="start" my="xl">
            <Menu shadow="md" width={140}>
              <Menu.Target>
                {!isActive ? (
                  <Button
                    size="lg"
                    style={{
                      height: 40,
                      width: 140,
                      fontSize: 16,
                      fontWeight: 500,
                      borderRadius: 5,
                      backgroundColor: '#FA5252',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0 10px 0 15px',
                    }}
                    className="!bg-[#FA5252] hover:!bg-[#E03131]"
                    disabled={isUpdatingStatus}
                  >
                    <span>{tc('deactivated')}</span>
                    <span style={{ 
                      borderLeft: '1px solid #FB7A7A',
                      paddingLeft: 8,
                      marginLeft: 8,
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <ChevronDown size={18} />
                    </span>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    style={{
                      height: 40,
                      width: 140,
                      fontSize: 16,
                      fontWeight: 500,
                      borderRadius: 5,
                      backgroundColor: '#1478d3',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0 10px 0 15px',
                    }}
                    className="!bg-[#1478d3] hover:!bg-[#0e61b0]"
                    disabled={isUpdatingStatus}
                  >
                    <span>{tc('activate')}</span>
                    <span style={{ 
                      borderLeft: '1px solid #4497e3',
                      paddingLeft: 8,
                      marginLeft: 8,
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <ChevronDown size={18} />
                    </span>
                  </Button>
                )}
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => handleStatusChange('activated')} disabled={isActive || isUpdatingStatus}>
                  {tc('activateAccount')}
                </Menu.Item>
                <Menu.Item onClick={() => handleStatusChange('deactivated')} disabled={!isActive || isUpdatingStatus}>
                  {tc('deactivateAccount')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Reset Password Button */}
            {/* <Button
              onClick={openResetModal}
              size="lg"
              style={{
                height: 40,
                width: 165,
                borderRadius: 5,
                fontWeight: 500,
                fontSize: 16,
                backgroundColor: '#4679FD',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="!bg-[#4679FD] hover:!bg-[#3b68e9]"
            >
              <Lock size={18} style={{ marginRight: 8 }} />
              <span>{tc('resetPassword')}</span>
            </Button> */}

            {/* Remove Account Button */}
            <Button
              onClick={openRemoveModal}
              size="lg"
              style={{
                height: 40,
                width: 165,
                borderRadius: 5,
                fontWeight: 500,
                fontSize: 16,
                backgroundColor: '#FA5252',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="!bg-[#FA5252] hover:!bg-[#E03131]"
              disabled={isDeleting}
            >
              <FaTrashAlt size={18} style={{ marginRight: 8 }} />
              <span>{tc('removeAccount')}</span>
            </Button>

          </Flex>

          {/* Stats */}
          <Box my="xl">
            <Title order={4} mb="md" fw={600} sx={{ fontSize: '1.2rem' }}>
              {tc('statistics')}
            </Title>
            <Flex 
              gap="md" 
              justify="space-between"
              direction={{ base: 'column', md: 'row' }}
              sx={{
                '@media (max-width: 768px)': {
                  gap: '1rem',
                },
                '@media (max-width: 1024px)': {
                  overflowX: 'auto',
                  flexWrap: 'nowrap',
                }
              }}
            >
              {statsData.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </Flex>
          </Box>

          {/* Business Info */}
          <Box>
            <Title
              order={4}
              mb="md"
              pb="sm"
              sx={(theme) => ({
                borderBottom: `1px solid ${theme.colors.gray[3]}`,
              })}
            >
              {tc('businessInfo')}
            </Title>

              <Flex gap="md" align="center">
                <Text c="dimmed" >
                  {tc('businessName')}:
                </Text>
                <Text fw={500}>{business?.name || tc('na')}</Text>
              </Flex>
              <Flex gap="md" align="center">
                <Text c="dimmed" w={110}>
                  {tc('contact')} :
                </Text>
                <Text fw={500}>{barber.phone}</Text>
              </Flex>
              <Flex gap="md" align="center">
                <Text c="dimmed" w={110}>
                  {tc('joinedDate')}:
                </Text>
                <Text fw={500}>{new Date(barber.createdAt).toLocaleDateString()}</Text>
              </Flex>
          </Box>
        </Paper>
        <CommonModal
          opened={resetModalOpened}
          onClose={closeResetModal}
          content={
            <Box p="md">
              <Title order={3} align="center">
                {tc('resetPassword')}?
              </Title>
              <Text c="dimmed" align="center" my="md">
                {tc('areYouSureResetBarberPassword')}
              </Text>
              <Flex justify="center" gap="md" mt="lg">
                <Button variant="default" onClick={closeResetModal} size="md">
                  {tc('cancel')}
                </Button>
                <Button color="dark" onClick={closeResetModal} size="md">
                  {tc('confirm')}
                </Button>
              </Flex>
            </Box>
          }
        />
        <CommonModal
          opened={removeModalOpened}
          onClose={closeRemoveModal}
          content={
            <Box p="md">
              <Title order={3} align="center">
                {tc('removeBarber')}?
              </Title>
              <Text c="dimmed" align="center" my="md">
                {tc('areYouSureRemoveBarberThisActionCannotBeUndone')}
              </Text>
              <Flex justify="center" gap="md" mt="lg">
                <Button variant="default" onClick={closeRemoveModal} size="md">
                  {tc('cancel')}
                </Button>
                <Button color="red" onClick={handleRemoveBarber} size="md" loading={isDeleting}>
                  {tc('remove')}
                </Button>
              </Flex>
            </Box>
          }
        />
      </div>
    </BatchTranslationLoader>
  );
};

export default BarberProfile;