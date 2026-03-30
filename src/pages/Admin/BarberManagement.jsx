import React, { useState, useMemo } from "react";
import {
  Box,
  Title,
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
  Center,
  Skeleton,
} from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import BarberTable from "../../components/layout/BarberTable";
import CommonModal from "../../components/common/CommonModal";
import DeleteBarberModal from "../../components/common/DeleteBarberModal";
import { SortIcon, FilterIcon } from "../../components/common/Svgs";
import { FiChevronDown } from "react-icons/fi";
import { useAdminBarbers, useDeleteBarber } from "../../hooks/useAdmin";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { toast } from "sonner";

const BarberManagement = () => {
  const { tc } = useBatchTranslation();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterOptions, setFilterOptions] = useState({
    name: "",
    appointments: "",
    revenue: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState(null);

  const {
    data: barberData,
    isLoading,
    isError,
  } = useAdminBarbers({
    page: activePage,
    limit: itemsPerPage,
    // Add other params like search, sort, filter here when ready
  });

  const { mutate: deleteBarber, isLoading: isDeleting } = useDeleteBarber({
    onSuccess: () => {
      closeDeleteModal();
      toast.success(tc('barberRemovedSuccessfully'));
    },
  });

  const openDeleteModal = (barber) => {
    setBarberToDelete(barber);
    setDeleteModalOpened(true);
  };

  const closeDeleteModal = () => {
    setBarberToDelete(null);
    setDeleteModalOpened(false);
  };

  const confirmDelete = () => {
    if (barberToDelete) {
      deleteBarber(barberToDelete._id);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filterOptions);
  };

  const resetFilters = () => {
    setFilterOptions({ name: "", appointments: "", revenue: "", status: "" });
    setAppliedFilters({});
  };

  const sortedAndFilteredData = useMemo(() => {
    if (!barberData?.barbers) return [];
    let result = [...barberData.barbers];
    
    // Search functionality
    if (searchQuery) {
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item._id && item._id.includes(searchQuery))
      );
    }
    
    // Apply filters
    if (appliedFilters.name) {
      result = result.filter((item) =>
        (item.name || '').toLowerCase().includes(appliedFilters.name.toLowerCase())
      );
    }
    
    if (appliedFilters.appointments) {
      result = result.filter((item) => {
        const appointments = item.totalAppointments || item.appointments || 0;
        return appointments.toString().includes(appliedFilters.appointments);
      });
    }
    
    if (appliedFilters.revenue) {
      result = result.filter((item) => {
        const revenue = item.totalRevenue || item.revenue || 0;
        return revenue.toString().includes(appliedFilters.revenue);
      });
    }
    
    if (appliedFilters.status) {
      result = result.filter((item) =>
        (item.status || '').toLowerCase().includes(appliedFilters.status.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        // Handle different sort keys
        switch (sortConfig.key) {
          case 'barberAdmin':
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            break;
          case 'name':
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'phoneNumber':
          case 'phone':
            aValue = (a.phone || a.phoneNumber || '').toLowerCase();
            bValue = (b.phone || b.phoneNumber || '').toLowerCase();
            break;
          case 'appointments':
            aValue = a.totalAppointments || a.appointments || 0;
            bValue = b.totalAppointments || b.appointments || 0;
            break;
          case 'revenue':
            aValue = a.totalRevenue || a.revenue || 0;
            bValue = b.totalRevenue || b.revenue || 0;
            break;
          case 'status':
            aValue = (a.status || '').toLowerCase();
            bValue = (b.status || '').toLowerCase();
            break;
          default:
            aValue = a[sortConfig.key] || '';
            bValue = b[sortConfig.key] || '';
        }
        
        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        } else {
          // For numbers
          const numA = Number(aValue) || 0;
          const numB = Number(bValue) || 0;
          if (numA < numB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (numA > numB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return result;
  }, [barberData, searchQuery, sortConfig, appliedFilters]);
  
  const totalPages = barberData?.pagination?.pages || 1;
  const totalItems = barberData?.pagination?.total || 0;

  return (
    <BatchTranslationLoader>
      <Box component="main" className="!h-[83vh] !overflow-auto">
        <Paper radius="lg" sx={{ padding: "24px", margin: "24px" }}>
          <Container size="xl" px={0} sx={{ width: "100%", maxWidth: "100%" }}>
            <Box className="!p-3">
              <div className="text-2xl">
                  {tc('manageRegisteredBarbers')}
              </div>
              <Text c="rgba(147,151,153,1)" size="md" mt={2}>
                {tc('monitorManageAndMaintainAllRegisteredBarbers')}
              </Text>
            </Box>
            <Flex
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              className="!p-3 !mt-3"
              direction={{ base: "column", md: "row" }}
            >
              <TextInput
                placeholder={tc('searchByIdNameEmailAddress')}
                leftSection={<FaSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
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
                      bg="#F1F1F1"
                      c="#323334"
                      fz="md"
                      fw={500}
                      rightIcon={<FiChevronDown size={20} />}
                    >
                      <SortIcon style={{ marginRight: "8px" }} /> {tc('sortBy')}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => handleSort("name")}>
                      {tc('barber')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleSort("email")}>
                      {tc('emailAddress')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleSort("phone")}>
                      {tc('phoneNumber')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleSort("appointments")}>
                      {tc('appointments')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleSort("revenue")}>
                      {tc('revenue')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleSort("status")}>
                      {tc('status')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Popover
                  width={300}
                  position="bottom-end"
                  shadow="md"
                  withinPortal
                >
                  <Popover.Target>
                    <Button
                      h={50}
                      w={130}
                      radius="md"
                      bg="#323334"
                      c="white"
                      fz="md"
                      fw={500}
                    >
                      <FilterIcon style={{ marginRight: "8px" }} />
                      {tc('filter')}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p="lg">
                    <Text fw={600} fz="md" mb={15}>
                      {tc('filterOptions')}
                    </Text>
                    
                    <Box mb={15}>
                      <Text fw={500} fz="sm" mb={5}>
                        {tc('barber')}
                      </Text>
                      <TextInput
                        placeholder={tc('searchByName')}
                        value={filterOptions.name}
                        onChange={(e) =>
                          handleFilterChange("name", e.target.value)
                        }
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

                    <Box mb={20}>
                      <Text fw={500} fz="sm" mb={5}>
                        {tc('appointments')}
                      </Text>
                      <TextInput
                        placeholder={tc('filterByAppointments')}
                        value={filterOptions.appointments}
                        onChange={(e) =>
                          handleFilterChange("appointments", e.target.value)
                        }
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

                    <Box mb={20}>
                      <Text fw={500} fz="sm" mb={5}>
                        {tc('revenue')}
                      </Text>
                      <TextInput
                        placeholder={tc('filterByRevenue')}
                        value={filterOptions.revenue}
                        onChange={(e) =>
                          handleFilterChange("revenue", e.target.value)
                        }
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

                    <Box mb={20}>
                      <Text fw={500} fz="sm" mb={5}>
                        {tc('status')}
                      </Text>
                      <TextInput
                        placeholder={tc('filterByStatus')}
                        value={filterOptions.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
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
                        onClick={resetFilters}
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
                        onClick={applyFilters}
                      >
                        {tc('apply')}
                      </Button>
                    </Flex>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Flex>
            <Box mt="lg" style={{ overflowX: "auto", width: "100%" }}>
              {isLoading ? (
                <Box>
                  {/* Table header skeleton */}
                  <Flex gap="md" mb="md" p="md" style={{ borderBottom: "1px solid #E6E6E6" }}>
                    <Skeleton height={20} width="12%" />
                    <Skeleton height={20} width="20%" />
                    <Skeleton height={20} width="20%" />
                    <Skeleton height={20} width="15%" />
                    <Skeleton height={20} width="12%" />
                    <Skeleton height={20} width="12%" />
                    <Skeleton height={20} width="12%" />
                    <Skeleton height={20} width="15%" />
                  </Flex>
                  
                  {/* Table rows skeleton */}
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <Flex key={index} gap="md" mb="md" p="md" style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <Skeleton height={16} width="12%" />
                      <Skeleton height={16} width="20%" />
                      <Skeleton height={16} width="20%" />
                      <Skeleton height={16} width="15%" />
                      <Skeleton height={16} width="12%" />
                      <Skeleton height={16} width="12%" />
                      <Skeleton height={16} width="12%" />
                      <Skeleton height={16} width="15%" />
                    </Flex>
                  ))}
                </Box>
              ) : isError ? (
                <Center h={200}>
                  <Text color="red">{tc('failedToLoadBarbers')}</Text>
                </Center>
              ) : (
                <BarberTable
                  data={sortedAndFilteredData}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onDelete={openDeleteModal}
                />
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
                {sortedAndFilteredData.length > 0
                  ? `${(activePage - 1) * itemsPerPage + 1}-${String(
                      Math.min(
                        activePage * itemsPerPage,
                        totalItems
                      )
                    ).padStart(2, "0")} ${tc('of')} ${
                      totalItems
                    } ${tc('items')}`
                  : `0 ${tc('items')}`}
              </Text>
              <Pagination
                total={totalPages}
                page={activePage}
                onChange={setPage}
                withEdges
                radius="md"
                withControls
                className="barber-pagination"
                classNames={{
                  control: 'pagination-control',
                }}
                styles={{
                  control: {
                    width: '28px', 
                    height: '28px', 
                    minWidth: '28px', 
                    borderRadius: '6px', 
                    border: '1px solid #EAEAEA', 
                    backgroundColor: 'white', 
                    color: '#323232', 
                    fontWeight: 400,
                    '&:not([data-disabled]):not([data-active]):hover': { 
                      backgroundColor: '#f1f1f1' 
                    },
                    '&[data-active]': { 
                      backgroundColor: '#738B4A', 
                      borderColor: '#738B4A',
                      color: 'white', 
                      fontWeight: 700 
                    }
                  },
                  controls: {
                    button: {
                      backgroundColor: '#738B4A',
                      borderColor: '#738B4A',
                      color: 'white'
                    }
                  }
                }}
              />
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
                  rightSection={
                    <ChevronDown size={14} color="#fff" />
                  }
                  styles={{
                    root: { width: "70px" },
                    input: { backgroundColor: "#738B4A", color: "white", fontWeight: 500, height: "28px", minHeight: "28px", borderRadius: "6px", border: "1px solid #738B4A", textAlign: "center", padding: "0 10px", '&:hover': { backgroundColor: '#6A8838' } },
                    rightSection: { color: 'white' },
                    item: { '&[data-selected]': { '&, &:hover': { backgroundColor: '#738B4A', color: 'white' } } },
                  }}
                />
                <Text size="md" c="#323232">
                  {tc('itemsPerPage')}
                </Text>
              </Group>
            </Flex>
          </Container>
        </Paper>
        <CommonModal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          content={
            <DeleteBarberModal
              onCancel={closeDeleteModal}
              onConfirm={confirmDelete}
              isLoading={isDeleting}
              barberName={barberToDelete?.name}
            />
          }
        />
      </Box>
    </BatchTranslationLoader>
  );
};

export default BarberManagement;