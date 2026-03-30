import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Text, Title, Group, Paper, Center } from '@mantine/core';
import { IconClock, IconRefresh } from '@tabler/icons-react';

const SessionExpired = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || 'Your session has expired. Please log in again.';

  const handleLoginRedirect = () => {
    // Determine which login page to redirect to based on the current path
    if (location.pathname.includes('admin')) {
      navigate('/admin', { replace: true });
    } else if (location.pathname.includes('client')) {
      // For client pages, you might want to redirect to a different page
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container size="sm" style={{ marginTop: '10vh' }}>
      <Center>
        <Paper shadow="md" p="xl" radius="md" style={{ maxWidth: 500, width: '100%' }}>
          <Center mb="xl">
            <IconClock size={64} color="#fa5252" />
          </Center>
          
          <Title order={2} ta="center" mb="md">
            Session Expired
          </Title>
          
          <Text ta="center" mb="xl" c="dimmed">
            {message}
          </Text>
          
          <Group justify="center" gap="md">
            <Button 
              onClick={handleLoginRedirect}
              size="md"
              variant="filled"
            >
              Go to Login
            </Button>
            
            <Button 
              onClick={handleRefresh}
              size="md"
              variant="outline"
              leftSection={<IconRefresh size={16} />}
            >
              Refresh Page
            </Button>
          </Group>
          
          <Text ta="center" mt="xl" size="sm" c="dimmed">
            For security reasons, you need to log in again to continue using the application.
          </Text>
        </Paper>
      </Center>
    </Container>
  );
};

export default SessionExpired;