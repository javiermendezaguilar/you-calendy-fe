import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Container,
  Paper,
  Flex,
  Button,
  TextInput,
  Group,
  Menu,
  Popover,
  Select,
} from "@mantine/core";
import { SortIcon, FilterIcon } from "../../components/common/Svgs";
import AppointmentTable from "../../components/layout/AppointmentTable";
import { FaSearch } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";

const AppointmentHistory = () => {
  const { tc } = useBatchTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  
  const [filterOptions, setFilterOptions] = useState({
    status: "",
    date: "",
    duration: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  
  const sortOptions = [
    { value: 'clientName', label: tc('clientName') },
    { value: 'appointmentTime', label: tc('time') },
    { value: 'date', label: tc('date') },
    { value: 'duration', label: tc('duration') },
    { value: 'status', label: tc('status') },
  ];
  
  const statusOptions = [
    { value: 'Confirmed', label: tc('confirmed') },
    { value: 'Canceled', label: tc('canceled') },
    { value: 'Completed', label: tc('completed') },
    { value: 'No-Show', label: tc('noShow') },
  ];
  
  const dateOptions = [
    { value: '20-Mar-2025', label: '20 Mar 2025' },
    { value: '21-Mar-2025', label: '21 Mar 2025' },
    { value: '22-Mar-2025', label: '22 Mar 2025' },
  ];
  
  const durationOptions = [
    { value: '30 Mint', label: tc('thirtyMinutes') },
    { value: '45 Mint', label: tc('fortyFiveMinutes') },
    { value: '60 Mint', label: tc('sixtyMinutes') },
  ];

  const handleDelete = (id) => {
    console.log("Delete appointment with ID:", id);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      direction = "ascending";
    }
    setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (field, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filterOptions);
  };

  const resetFilters = () => {
    setFilterOptions({
      status: "",
      date: "",
      duration: "",
    });
    setAppliedFilters({});
  };

  const appointmentsData = useMemo(
    () => [
      {
        id: "001",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
      {
        id: "002",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
      {
        id: "003",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
      {
        id: "004",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
      {
        id: "005",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
      {
        id: "006",
        clientName: "Luke Williamson",
        appointmentTime: "Monday (10:00-19:00)",
        date: "20-Mar-2025",
        duration: "30 Mint",
        status: "Confirmed",
      },
    ],
    []
  );

  const filteredAppointments = useMemo(() => {
    let filtered = appointmentsData.filter(
      (appointment) =>
        appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (appliedFilters.status) {
      filtered = filtered.filter(item => 
        item.status === appliedFilters.status
      );
    }
    
    if (appliedFilters.date) {
      filtered = filtered.filter(item => 
        item.date === appliedFilters.date
      );
    }
    
    if (appliedFilters.duration) {
      filtered = filtered.filter(item => 
        item.duration === appliedFilters.duration
      );
    }
    
    return filtered;
  }, [appointmentsData, searchQuery, appliedFilters]);

  const sortedAppointments = useMemo(() => {
    let sortableItems = [...filteredAppointments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAppointments, sortConfig]);

  return (
    <Box
      component="main"
      className="min-h-screen h-[83vh] overflow-auto bg-gray-100"
    >
      <Paper radius="lg" sx={{ padding: "8px", paddingBottom: "112px" }}>
        <Container
          size="xl"
          mb={40}
          px={0}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <div className="flex flex-wrap justify-between items-start mb-4 p-6">
            <div className="md:w-2/3">
              <p className="text-2xl text-slate-800 font-semibold">
                {tc('manageAppointmentHistory')}
              </p>
              <Text c="rgba(147,151,153,1)" size="md" mt={8}>
                {tc('trackAndManagePastAppointments')}
              </Text>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center p-4">
            <Box className="!flex-2 !max-w-[450px]">
              <TextInput
                placeholder={tc('searchByIdNameEmail')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<FaSearch size={18} color="#222" opacity={0.5} />}
                radius="md"
                size="md"
                className="w-[310px]"
              />
            </Box>

            <div className="flex gap-2 items-center mt-2 sm:mt-0">
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <Button
                    variant="default"
                    h={50}
                    w={130}
                    radius="md"
                    bg="#E2E2E2"
                    c="#323334"
                    fz="md"
                    fw={500}
                    rightSection={<FiChevronDown size={16} />}
                  >
                    <SortIcon style={{ marginRight: "8px" }} /> Sort by
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{tc('sortByField')}</Menu.Label>
                  {sortOptions.map((option) => (
                    <Menu.Item 
                      key={option.value} 
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label} {sortConfig.key === option.value && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </Menu.Item>
                  ))}
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
                    fw={500}
                  >
                    <FilterIcon style={{ marginRight: "8px" }} />
                    Filter
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p="lg">
                  <Text fw={600} fz="md" mb={15}>{tc('filterOptions')}</Text>
                  
                  <Box mb={15}>
                    <Text fw={500} fz="sm" mb={5}>{tc('status')}</Text>
                <Select
                  placeholder={tc('selectStatus')}
                      data={statusOptions}
                      value={filterOptions.status}
                      onChange={(value) => handleFilterChange('status', value)}
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
                  
                  <Box mb={15}>
                    <Text fw={500} fz="sm" mb={5}>{tc('date')}</Text>
                <Select
                  placeholder={tc('selectDate')}
                      data={dateOptions}
                      value={filterOptions.date}
                      onChange={(value) => handleFilterChange('date', value)}
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
                    <Text fw={500} fz="sm" mb={5}>{tc('duration')}</Text>
                <Select
                  placeholder={tc('selectDuration')}
                      data={durationOptions}
                      value={filterOptions.duration}
                      onChange={(value) => handleFilterChange('duration', value)}
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
            </div>
          </div>

          <div className="overflow-auto">
            <AppointmentTable
              appointments={sortedAppointments}
              handleDelete={handleDelete}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </Container>
      </Paper>
    </Box>
  );
};

const AppointmentHistoryWithTranslation = () => (
  <BatchTranslationLoader>
    <AppointmentHistory />
  </BatchTranslationLoader>
);

export default AppointmentHistoryWithTranslation;