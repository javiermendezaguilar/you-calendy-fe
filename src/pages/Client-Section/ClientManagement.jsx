import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Container,
  Paper,
  Flex,
  Group,
  Menu,
  Pagination,
  Select,
  Popover,
  Loader,
  Alert,
  Drawer,
  Skeleton,
} from "@mantine/core";
import { FaSearch, FaPlus, FaUpload } from "react-icons/fa";
import ClientTable from "../../components/layout/ClientTable";
import CommonModal from "../../components/common/CommonModal";
import DeleteClientModal from "../../components/common/DeleteClientModal";
import InvitationModal from "../../components/modals/InvitationModal";
import { SortIcon, FilterIcon } from "../../components/common/Svgs";
import { FiChevronDown } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetClients,
  useGetClientsCount,
  useDeleteClient,
  useResendInvitation,
  useUpdateClientStatus,
} from "../../hooks/useClients";
import ClientProfileSidebar from "../../components/client/ClientProfileSidebar";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const ClientManagement = () => {
  const { tc } = useBatchTranslation();
  
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterOptions, setFilterOptions] = useState({ name: "" });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [modalOpened, setModalOpened] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [profileSidebarOpened, setProfileSidebarOpened] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);

  // Prepare API parameters
  const apiParams = useMemo(() => {
    const params = {
      page: activePage,
      limit: itemsPerPage,
    };

    // Add search parameter
    if (searchQuery) {
      params.search = searchQuery;
    }

    // Add name filter (using search parameter)
    if (appliedFilters.name) {
      params.search = appliedFilters.name;
    }

    // Add sorting
    if (sortConfig.key) {
      const sortField = sortConfig.key === 'name' ? 'firstName' : sortConfig.key;
      params.sort = `${sortField}:${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`;
    }

    return params;
  }, [activePage, itemsPerPage, searchQuery, appliedFilters, sortConfig]);

  const countParams = useMemo(() => {
    const params = {
      limit: itemsPerPage,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (appliedFilters.name) {
      params.search = appliedFilters.name;
    }

    return params;
  }, [itemsPerPage, searchQuery, appliedFilters]);

  const { data: clientsData, isLoading, isError, error } = useGetClients(apiParams);
  const { data: countPagination, isLoading: isCountLoading } = useGetClientsCount(countParams, { enabled: false });
  const { mutate: deleteClient, isLoading: isDeleting } = useDeleteClient({
    onSuccess: () => {
      closeDeleteModal();
    },
  });
  const { mutate: resendInvitation } = useResendInvitation();
  const { mutate: updateClientStatus } = useUpdateClientStatus();

  // Extract clients and pagination data from response
  const clients = clientsData?.clients || [];
  const pagination = clientsData?.pagination || { total: null, page: activePage, pages: null };
  const hasResolvedCount =
    Number.isFinite(pagination?.total) && Number.isFinite(pagination?.pages);
  const rangeStart = clients.length > 0 ? ((activePage - 1) * itemsPerPage) + 1 : 0;
  const rangeEnd = clients.length > 0
    ? (hasResolvedCount
      ? Math.min(activePage * itemsPerPage, pagination.total)
      : rangeStart + clients.length - 1)
    : 0;

  const openDeleteModal = (id) => {
    setClientToDelete(id);
    setModalOpened(true);
  };

  const closeDeleteModal = () => {
    setClientToDelete(null);
    setModalOpened(false);
  };

  const confirmDelete = (reason) => {
    if (clientToDelete) {
      deleteClient({ clientId: clientToDelete, reason });
    }
  };

  const handleViewProfile = (client) => {
    setSelectedClient(client);
    setProfileSidebarOpened(true);
  };

  const closeProfileSidebar = () => {
    setProfileSidebarOpened(false);
    setSelectedClient(null);
  };

  const handleResendInvitation = (clientId) => {
    resendInvitation(clientId, {
      onSuccess: (response) => {
        // Check if SMS was not sent due to insufficient credits
        const responseData = response?.data?.data;
        if (responseData?.smsStatus && !responseData.smsStatus.sent) {
          // Show invitation modal with SMS warning
          setInvitationData(responseData);
          setShowInvitationModal(true);
        }
        // If SMS was sent successfully, the default success toast will show
      },
    });
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setPage(1); // Reset to first page when sorting changes
  };

  const handleFilterChange = (field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filterOptions);
    setPage(1); // Reset to first page when filters are applied
  };

  const handleClearFilters = () => {
    setFilterOptions({ name: "" });
    setAppliedFilters({});
    setPage(1); // Reset to first page when filters are cleared
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when search changes
  };



  if (isError) {
    return (
      <Flex justify="center" align="center" style={{ height: '100%' }}>
        <Alert title="Error" color="red">
          {error.message}
        </Alert>
      </Flex>
    );
  }
  
  const clientTableData = clients.map(client => {
    const firstName = client.firstName || '';
    const lastName = client.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return {
      id: client._id,
      name: fullName || tc('notFilledYet'),
      email: client.email || tc('notFilledYet'),
      phoneNumber: client.phone,
              status: tc('inactive'), // Placeholder
              notes: client.privateNotes || tc('noNotesYet'),
      photos: Math.floor(Math.random() * 10), // Dummy photo count
      staff: client.staff, // Staff information
      isProfileComplete: client.isProfileComplete, // Profile completion status
      original: client,
    };
  });


  return (
    <BatchTranslationLoader>
      <Box component="main" className="!h-[83vh] !overflow-auto">
      <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
        <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
          <Flex justify="space-between" align="center" className="!p-3">
            <Box>
              <div className="text-2xl">
                {tc('clientManagement')}
              </div>
              <Text c="rgba(147,151,153,1)" size="md" mt={2}>
                {tc('manageClientsAppointments')}
              </Text>
            </Box>
            <Group>
              {/* <Button component={Link} to="/dashboard/clients/invite" variant="default" h={50} radius="md" leftSection={<FaUpload size={14} />}>{tc('importClients')}</Button> */}
              {/* <Button component={Link} to="/dashboard/clients/add" h={50} radius="md" bg="#323334" leftSection={<FaPlus size={14} />}>{tc('addNewClient')}</Button> */}
            </Group>
          </Flex>
          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            className="!p-3 !mt-3"
            direction={{ base: "column", md: "row" }}
          >
            <TextInput
              placeholder={tc('searchClients')}
              leftSection={<FaSearch size={16} />}
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.currentTarget.value)}
              w={{ md: 350 }}
              mb={{ base: "md", md: 0 }}
              styles={{
                input: {
                  width: "100%",
                  height: "48px",
                  borderRadius: "8px",
                },
              }}
            />
            <Group>
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <Button
                    variant="default"
                    h={50}
                    w={130}
                    radius="md"
                    c="#323334"
                    fz="md"
                    fw={400}
                    rightSection={<FiChevronDown size={16} />}
                  >
                    <SortIcon style={{ marginRight: "8px" }} /> {tc('sort')}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleSort("name")}>
                    {tc('name')}
                  </Menu.Item>
                  <Menu.Item onClick={() => handleSort("email")}>
                    {tc('emailAddress')}
                  </Menu.Item>
                  <Menu.Item onClick={() => handleSort("status")}>
                    {tc('status')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Popover width={300} position="bottom-end" shadow="md" withinPortal>
                <Popover.Target>
                  <Button
                    h={50}
                    w={130}
                    radius="md"
                    bg="#323334"
                    c="white"
                    fz="md"
                    fw={400}
                  >
                    <FilterIcon style={{ marginRight: "8px" }} />
                    {tc('filter')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p="lg">
                  <Text fw={600} fz="md" mb={15}>{tc('filterOptionsText')}</Text>
                  
                  <Box mb={15}>
                    <Text fw={500} fz="sm" mb={5}>{tc('clientName')}</Text>
                    <TextInput
                      placeholder={tc('searchByName')}
                      value={filterOptions.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      styles={{
                        input: {
                          backgroundColor: "#F9F9F9",
                          border: "1px solid #E6E6E6",
                          borderRadius: "8px",
                          height: "40px",
                        },
                      }}
                    />
                  </Box>
                  
                  <Flex gap="md" justify="space-between">
                    <Button
                      variant="outline"
                      radius="md"
                      size="sm"
                      onClick={handleClearFilters}
                      fullWidth
                      styles={{
                        root: {
                          border: "1px solid #E6E6E6",
                          color: "#333",
                        },
                      }}
                    >
                      {tc('reset')}
                    </Button>
                    <Button 
                      radius="md" 
                      size="sm" 
                      bg="#323334" 
                      fullWidth
                      onClick={handleApplyFilters}
                    >
                      {tc('apply')}
                    </Button>
                  </Flex>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Flex>
          <Box mt="lg" style={{ overflowX: "auto" }} data-testid="clients-table-region">
            {isLoading ? (
              <Box p="md" data-testid="clients-table-loading">
                {[...Array(itemsPerPage)].map((_, index) => (
                  <Skeleton key={index} height={20} mb="sm" radius="sm" />
                ))}
              </Box>
            ) : (
              <Box data-testid={clients.length > 0 ? "clients-table-ready" : "clients-table-empty"}>
                <ClientTable
                  data={clientTableData}
                  handleDelete={openDeleteModal}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onView={handleViewProfile}
                  onStatusUpdate={updateClientStatus}
                  onResendInvitation={handleResendInvitation}
                />
              </Box>
            )}
          </Box>
          <Flex
            justify="space-between"
            align="center"
            mt={24}
            direction={{ base: "column", md: "row" }}
            className="p-3"
          >
            <Text size="md" c="#323232" mb={{ base: "md", md: 0 }}>
              {clients.length > 0
                ? (hasResolvedCount
                  ? `${rangeStart}-${rangeEnd} ${tc('of')} ${pagination.total} ${tc('entries')}`
                  : `${rangeStart}-${rangeEnd} ${tc('entries')}`)
                : `0 ${tc('entries')}`}
            </Text>
            {hasResolvedCount ? (
              <Pagination
                total={pagination.pages}
                page={activePage}
                onChange={setPage}
                withEdges
                styles={(theme) => ({
                  control: {
                    width: '28px', height: '28px', minWidth: '28px', borderRadius: '6px', border: '1px solid #EAEAEA', backgroundColor: 'white', color: '#323232', fontWeight: 400,
                    '&:not([data-disabled]):not([data-active]):hover': { backgroundColor: theme.colors.gray[1] },
                    '&[data-first], &[data-last], &[data-next], &[data-previous]': { backgroundColor: '#738B4A', border: '1px solid #738B4A', color: 'white', '&:not([data-disabled]):hover': { backgroundColor: '#6A8838' }, '&[data-disabled]': { cursor: 'not-allowed' } },
                    '&[data-active]': { backgroundColor: '#738B4A', border: '1px solid #738B4A', color: 'white', fontWeight: 700 },
                  },
                })}
              />
            ) : (
              <Box h={28} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isCountLoading ? <Loader size="sm" color="#738B4A" /> : null}
              </Box>
            )}
            <Group>
              <Select
                value={itemsPerPage.toString()}
                onChange={(value) => {
                  setItemsPerPage(Number(value));
                  setPage(1);
                }}
                data={[
                  { value: "5", label: "05" },
                  { value: "10", label: "10" },
                ]}
                rightSection={<ChevronDown size={14} color="#fff" />}
                styles={{
                  root: { width: "70px" },
                  input: { backgroundColor: "#738B4A", color: "white", fontWeight: 500, height: "28px", minHeight: "28px", borderRadius: "6px", border: "1px solid #738B4A", textAlign: "center", padding: "0 10px", '&:hover': { backgroundColor: '#6A8838' } },
                  rightSection: { color: 'white' },
                  item: { '&[data-selected]': { '&, &:hover': { backgroundColor: '#738B4A', color: 'white' } } },
                }}
              />
              <Text size="md" c="#323232">
                {tc('itemsPerPageText')}
              </Text>
            </Group>
          </Flex>
        </Container>
      </Paper>
      <CommonModal
        opened={modalOpened}
        close={closeDeleteModal}
        content={
          <DeleteClientModal
            onCancel={closeDeleteModal}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
          />
        }
      />
      <Drawer
        opened={profileSidebarOpened}
        onClose={closeProfileSidebar}
        position="right"
        size={{ base: "100%", sm: "500px" }}
        withCloseButton={false}
        className="!border-none"
        classNames={{
          root: "!h-[95vh] sm:!h-[95vh] !p-0 sm:!p-6 !m-0 !border-none",
          content: "!rounded-none sm:!rounded-[40px] !h-full sm:!h-[95vh] !border-none !shadow-lg !w-full sm:!w-[500px] !max-w-full sm:!max-w-[500px]",
          inner: "!p-0 sm:!p-6 !m-0 !right-0 !border-none",
          body: "!p-0 !border-none",
          header: "!p-0 !m-0 !border-none",
          title: "!p-0 !m-0 !border-none",
          overlay: "!border-none"
        }}
      >
        <ClientProfileSidebar client={selectedClient} onClose={closeProfileSidebar} />
      </Drawer>

      {/* Invitation Modal */}
      <InvitationModal
        opened={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setInvitationData(null);
        }}
        invitationData={invitationData}
      />
      </Box>
    </BatchTranslationLoader>
  );
};

export default ClientManagement;
