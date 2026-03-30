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
  Select,
  Divider,
  Popover,
  LoadingOverlay,
  Skeleton,
  Avatar,
  Badge,
  Drawer,
} from "@mantine/core";
import { FaSearch, FaPlus, FaBell } from "react-icons/fa";
import StaffTable from "../../components/layout/staffTable";
import { useNavigate, useLocation } from "react-router-dom";
import { SortIcon, FilterIcon } from "../../components/common/Svgs";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import DeleteStaffModal from "../../components/common/DeleteStaffModal";
import { useDeleteStaff, useGetStaff } from "../../hooks/useStaff";
import { useLogout } from "../../hooks/useLogin";
import { ChevronDown, X } from "tabler-icons-react";
import CommonModal from "../../components/common/CommonModal";
import { ReviewIcon, SuggestionIcon } from "../../components/common/Svgs";
import { useNotifications } from "../../hooks/useNotifications";
import { IoArrowBackCircleOutline } from "react-icons/io5";

import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const NotificationCard = ({ notification, onActionClick }) => {
  const { tc } = useBatchTranslation();
  
  return (
    <article className="flex flex-col w-full px-4 py-4 mb-3.5 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex flex-row items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] sm:min-w-[56px] shrink-0 bg-gray-50 rounded-full">
          {notification.type === "appointment" ? (
            "📅"
          ) : notification.type === "review" ? (
            <ReviewIcon />
          ) : (
            <SuggestionIcon />
          )}
        </div>
        <div className="w-full min-h-[50px] flex-1 overflow-hidden">
          <h2 className="text-sm sm:text-md font-medium text-gray-900 truncate">
            {tc(notification.title)}
          </h2>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-light text-gray-400 line-clamp-2">
            {tc(notification.message)}
          </p>
        </div>
      </div>

      {notification.cta && (
        <div
          className={`flex mt-3 sm:mt-5 max-w-full flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-semibold justify-center w-full`}
        >
          <Button
            onClick={() => onActionClick(notification)}
            className="!flex !items-center !justify-center !min-h-8 sm:!min-h-10 !px-3 sm:!px-5 !py-2 sm:!py-3 !text-white !bg-gray-900 !rounded-lg !text-xs sm:!text-sm"
          >
            <span className="!text-center !px-1">{tc('viewDetails')}</span>
          </Button>
        </div>
      )}
    </article>
  );
};

const Topbar = ({
  subtitle,
  toggle,
  isAdmin = false,
  title,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState("unread");
  
  // Filter constants
  const FILTER_ALL = "all";
  const FILTER_READ = "read";
  const FILTER_UNREAD = "unread";
  const { tc } = useBatchTranslation();

  // Translation variables
  const logoutConfirmation = tc('logoutConfirmation');
  const areYouSureLogout = tc('areYouSureLogout');
  const cancel = tc('cancel');
  const logout = tc('logout');
  const notification = tc('notifications');
  const neverMissUpdate = tc('neverMissUpdate');
  const profileSettings = tc('profileSettings');
  const markAsAllRead = tc('markAsAllRead');
  const all = tc('all');
  const unread = tc('unread');
  const read = tc('read');

  const {
    notifications,
    isLoadingNotifications,
    markAllRead,
    isMarkingAsRead,
  } = useNotifications("client"); // Staff management should show client-type notifications

  const { mutate: logoutMutation } = useLogout("user");

  let routeName;
  if (location.pathname?.split("/")[3]?.split("-")?.length === 2) {
    routeName = location.pathname?.split("/")[3]?.split("-");
  } else if (location.pathname?.split("/")[2]) {
    routeName = location.pathname?.split("/")[2]?.split("-");
  } else {
    routeName = location.pathname?.split("/")[1]?.split("-");
  }

  // Route to translation key mapping
  const routeTranslationMap = {
    'dashboard': 'dashboard',
    'clients': 'clients',
    'marketing': 'marketing',
    'staff-management': 'staffManagement',
    'clients-note': 'clientsNotes',
    'business-setting': 'businessSettings',
    'support': 'support',
    'suggest-feature': 'suggestFeature',
    'barber-management': 'barberManagement',
    'client-management': 'clientManagement',
    'platform-settings': 'platformSettings',
    'support-and-communication': 'supportAndCommunication',
    'security-and-auditing': 'securityAndAuditing',
    'proposed-interfaces': 'proposedInterfaces',
    'setting': 'setting'
  };

  let displayHeaderText = "";
  if (location.pathname === "/admin/dashboard") {
    displayHeaderText = tc('dashboard');
  } else if (location.pathname === "/dashboard") {
    displayHeaderText = tc('dashboard');
  } else {
    // Extract the main route segment
    const mainRoute = location.pathname.split('/').filter(segment => segment)[1] || location.pathname.split('/').filter(segment => segment)[0];
    const translationKey = routeTranslationMap[mainRoute];
    displayHeaderText = translationKey ? tc(translationKey) : (
      routeName?.length > 2
        ? routeName[0] + " " + routeName[1] + " " + routeName[2]
        : routeName?.length > 1
        ? routeName[0] + " " + routeName[1]
        : routeName[0]);
  }

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };

  const handleNotificationClick = (notification) => {
    if (notification.cta) {
      navigate(notification.cta);
      setShowNotifications(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === FILTER_ALL) return true;
    if (filter === FILTER_READ) return notification.isRead;
    return !notification.isRead;
  });
  
  // Default subtitle if not provided
  const defaultSubtitle = tc('welcomeToYouCalendyManagement');

  const LogoutModalContent = () => (
    <div className="p-4 text-center">
      <Title order={3} className="!mb-4">
        {logoutConfirmation}
      </Title>
      <Text c="dimmed" size="sm" className="!mb-6 text-[#7898AB]">
        {areYouSureLogout}
      </Text>
      <div className="flex justify-center gap-4">
        <Button
          variant="default"
          onClick={() => setShowLogoutModal(false)}
          className="!px-4 !py-2"
        >
          {cancel}
        </Button>
        <Button color="red" onClick={handleLogout} className="!px-4 !py-2">
          {logout}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full px-2 py-2 bg-white rounded-xl md:px-4 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="lg:hidden">
              <Button
                onClick={toggle}
                variant="subtle"
                p={0}
                className="!cursor-pointer !text-gray-500 !focus:outline-none !p-0 !bg-transparent"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </Button>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 capitalize truncate md:text-md lg:text-3xl max-w-[150px] md:max-w-full">
                {title || displayHeaderText}
              </h1>
              <p className="hidden mt-2 text-xs text-gray-500 lg:block">
                {subtitle || defaultSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {isAdmin ? (
              <div
                className="relative flex items-center justify-center w-10 h-10 cursor-pointer bg-gray-100 rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <FaBell size={20} className="text-gray-500" />
                {unreadCount > 0 && (
                  <Badge
                    className="!absolute -top-1 -right-1"
                    color="red"
                    circle
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            ) : (
              <div
                className="relative flex items-center gap-1 px-2 py-2 cursor-pointer md:gap-2 md:px-3 lg:px-5 md:py-3 bg-slate-200 rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <p className="hidden text-sm text-slate-800 lg:block">
                  {notification}
                </p>
                <FaBell size={16} className="text-gray-500 cursor-pointer" />
                {unreadCount > 0 && (
                  <Badge
                    className="!absolute -top-1 -right-1"
                    color="red"
                    circle
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            )}

            <Menu shadow="md" width={200} position="top-end">
              <Menu.Target>
                <div className="flex items-center gap-1 md:gap-2">
                  <Avatar
                    radius="xl"
                    size="md"
                    className="md:h-10 md:w-10 lg:h-12 lg:w-12"
                  />
                  <ChevronDown
                    size={20}
                    className="text-gray-500 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6"
                  />
                </div>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={() =>
                    navigate(isAdmin ? "/admin/setting" : "/dashboard/setting")
                  }
                >
                  {profileSettings}
                </Menu.Item>
                <Menu.Item color="red" onClick={() => setShowLogoutModal(true)}>
                  {logout}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <Drawer
          opened={showNotifications}
          onClose={() => setShowNotifications(false)}
          position="right"
          size={{ base: "100%", sm: "500px" }}
          withCloseButton={false}
          className="!border-none"
          classNames={{
            root: "!h-[95vh] sm:!h-[95vh] !p-0 sm:!p-6 !m-0 !border-none",
            content:
              "!rounded-none sm:!rounded-[40px] !h-full sm:!h-[95vh] !border-none !shadow-lg !w-full sm:!w-[500px] !max-w-full sm:!max-w-[500px]",
            inner: "!p-0 sm:!p-6 !m-0 !right-0 !border-none",
            body: "!p-0 !border-none",
            header: "!p-0 !m-0 !border-none",
            title: "!p-0 !m-0 !border-none",
            overlay: "!border-none",
          }}
        >
          <div className="px-4 pt-4 pb-3 bg-gray-50 sm:px-6 sm:pt-6 sm:pb-4 relative">
            <Button
              onClick={() => setShowNotifications(false)}
              variant="subtle"
              p={0}
              className="!absolute !right-4 !top-4 !p-1 !rounded-full !hover:bg-gray-200 !transition-colors !bg-transparent !inline-flex md:!hidden"
              aria-label="Close notification panel"
            >
              <X size={24} className="text-gray-700" />
            </Button>

            <div className="flex flex-col sm:flex-row flex-wrap w-full max-md:max-w-full gap-3 sm:gap-0">
              <div className="w-fit grow shrink-0 basis-0 min-h-[30px]">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {notification}
                </h1>
                <p className="text-xs sm:text-sm font-normal text-gray-500">
                  {neverMissUpdate}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="subtle"
                  onClick={markAllRead}
                  loading={isMarkingAsRead}
                  className="!text-gray-700 !text-xs sm:!text-sm !font-medium !border-[#E2E2E2] !border-2 !rounded-lg !h-auto !p-2 !min-h-0 !bg-white !self-start"
                >
                  {markAsAllRead}
                </Button>
              )}
            </div>

            <nav className="flex justify-between mt-6 sm:mt-10 md:mt-[45px] w-full sm:w-[269px] max-w-full gap-5 whitespace-nowrap">
              <div>
                <Button
                  onClick={() => setFilter("all")}
                  variant="subtle"
                  p={0}
                  className="!flex !gap-1 !p-0 !h-auto !min-h-0 !bg-transparent"
                >
                  <span
                    className={`text-xs sm:text-sm md:text-md ${
                      filter === "all"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400 font-normal"
                    }`}
                  >
                    {all}
                  </span>
                </Button>
                {filter === "all" && (
                  <div className="border border-gray-900 shrink-0" />
                )}
              </div>

              <div>
                <Button
                  onClick={() => setFilter("unread")}
                  variant="subtle"
                  p={0}
                  className="!flex !gap-1 !p-0 !h-auto !min-h-0 !bg-transparent"
                >
                  <span
                    className={`text-xs sm:text-sm md:text-md ${
                      filter === "unread"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400 font-normal"
                    }`}
                  >
                    {unread}
                  </span>
                  <span className="text-xs sm:text-sm md:text-md font-normal text-green-700">
                    {String(unreadCount).padStart(2, "0")}
                  </span>
                </Button>
                {filter === "unread" && (
                  <div className="border border-gray-900 shrink-0" />
                )}
              </div>

              <div>
                <Button
                  onClick={() => setFilter("read")}
                  variant="subtle"
                  p={0}
                  className="!flex !gap-1 !p-0 !h-auto !min-h-0 !bg-transparent"
                >
                  <span
                    className={`text-xs sm:text-sm md:text-md ${
                      filter === "read"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400 font-normal"
                    }`}
                  >
                    {read}
                  </span>
                </Button>
                {filter === "read" && (
                  <div className="border border-gray-900 shrink-0" />
                )}
              </div>
            </nav>
          </div>

          <div className="px-3 pt-4 pb-16 sm:px-4 sm:pt-6 sm:pb-10">
            <div className="flex flex-col w-full">
              {isLoadingNotifications ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Skeleton height={40} width={40} radius="xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton height={16} width="80%" />
                          <Skeleton height={14} width="60%" />
                          <Skeleton height={12} width="40%" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onActionClick={handleNotificationClick}
                  />
                ))
              ) : (
                <Text>{tc('noNotifications', { filter: tc(filter + 'Notifications') })}</Text>
              )}
            </div>
          </div>
        </Drawer>
      )}

      <CommonModal
        opened={showLogoutModal}
        close={() => setShowLogoutModal(false)}
        content={<LogoutModalContent />}
        size="sm"
      />
    </>
  );
};

const StaffManagement = () => {
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  
  // Sort direction constants
  const SORT_ASCENDING = "ascending";
  const SORT_DESCENDING = "descending";
  
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    workingHours: "",
    position: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Prepare query parameters for backend
  const queryParams = {
    search: searchQuery || undefined,
    sortBy: sortConfig.key || undefined,
    sortOrder: sortConfig.direction === SORT_ASCENDING ? "asc" : "desc",
    workingDay: appliedFilters.workingHours || undefined,
    position: appliedFilters.position || undefined,
  };

  const { data: staffApiData, isLoading: isFetching } = useGetStaff(queryParams);
  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();

  const staffData = staffApiData?.data?.data?.staff || [];
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  
  const sortOptions = [
    { value: 'firstName', label: tc('name') },
    { value: 'email', label: tc('email') },
    { value: 'role', label: tc('staffer') },
    { value: 'position', label: tc('position') },
  ];
  
  const workingDaysOptions = [
    { value: 'Monday', label: tc('monday') },
    { value: 'Tuesday', label: tc('tuesday') },
    { value: 'Wednesday', label: tc('wednesday') },
    { value: 'Thursday', label: tc('thursday') },
    { value: 'Friday', label: tc('friday') },
    { value: 'Saturday', label: tc('saturday') },
    { value: 'Sunday', label: tc('sunday') },
  ];
  
  const positionOptions = useMemo(() => {
    if (!staffData) return [];
    const uniquePositions = [...new Set(staffData.map(s => s.position))];
    return uniquePositions.map(p => ({ value: p, label: p }));
  }, [staffData]);

  const handleEdit = (staff) => {
    navigate(`/dashboard/staff-management/edit-member/${staff._id}`, { state: { staffData: staff } });
  };

  const handleDelete = (staff) => {
    setStaffToDelete(staff);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = (reason) => {
    if (staffToDelete) {
      deleteStaff({ staffId: staffToDelete._id, reason }, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setStaffToDelete(null);
        }
      });
    }
  };

  const handleAddNewMember = () => {
    navigate("/dashboard/staff-management/add-member");
  };

  const handleSort = (key) => {
    let direction = SORT_ASCENDING;
    if (sortConfig.key === key && sortConfig.direction === SORT_ASCENDING) {
      direction = SORT_DESCENDING;
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === SORT_DESCENDING
    ) {
      direction = SORT_ASCENDING;
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
    setFilterPopoverOpen(false);
  };

  const resetFilters = () => {
    setFilterOptions({
      workingHours: "",
      position: "",
    });
    setAppliedFilters({});
  };

  // Server-side filtering and sorting is handled by the backend
  const sortedAndFilteredStaffData = staffData;
  
  const formatWorkingHours = (workingHours) => {
    if (!workingHours || workingHours.length === 0) return tc('notSet');
    const enabledDay = workingHours.find(d => d.enabled && d.shifts && d.shifts.length > 0);
    if (enabledDay) {
      const shift = enabledDay.shifts[0];
      return `${enabledDay.day.charAt(0).toUpperCase() + enabledDay.day.slice(1)} (${shift.start}-${shift.end})`;
    }
    return tc('notAvailable');
  };

  const calculateTotalHours = (workingHours) => {
    if (!workingHours || workingHours.length === 0) return "0h";
    let totalMinutes = 0;
    workingHours.forEach(day => {
      if (day.enabled && day.shifts) {
        day.shifts.forEach(shift => {
          const [startH, startM] = shift.start.split(':').map(Number);
          const [endH, endM] = shift.end.split(':').map(Number);
          totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
        });
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h`;
  };

  return (
    <BatchTranslationLoader>
      <Box
        component="main"
        className="min-h-screen h-[83vh] overflow-auto bg-gray-100"
      >
      <LoadingOverlay visible={isDeleting} />
      <Paper radius="lg" sx={{ padding: "8px", paddingBottom: "112px" }}>
        <Container
          size="xl"
          mb={40}
          px={0}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-6">
            <Button
              size="lg"
              className="!mt-4 md:!mt-6 !w-42 !text-black !bg-gradient-to-r !from-[#fafafa] !to-slate-200 max-md:!text-sm max-md:!py-2 max-md:!px-4 max-md:size-md"
              onClick={() => navigate(-1)}
            >
              <IoArrowBackCircleOutline size={24} className="me-2 max-md:w-5 max-md:h-5" /> {tc('goBack')}
            </Button>
          </div>
          <div className="flex flex-wrap justify-between items-start mb-4 p-6">
            <div className=" md:w-2/3">
              <p className="text-2xl text-slate-800 font-semibold">
                {tc('manageYourTeam')}
              </p>
              <Text c="rgba(147,151,153,1)" size="md" mt={8}>
                {tc('manageYourTeamDescription')}
              </Text>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                size="md"
                h={50}
                px={20}
                bg="#323334"
                radius="md"
                fz="md"
                fw={500}
                onClick={handleAddNewMember}
              >
                <Flex align="center" gap={2} >
                  <FaPlus size={18} />
                  <span>{tc('addNewMember')}</span>
                </Flex>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center p-4">
            <Box className="!flex-2 !max-w-[450px]">
              <TextInput
                placeholder={tc('searchByNameEmail')}
                className="w-[310px] "
                radius="md"
                size="md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<FaSearch size={18} color="#222" opacity={0.5} />}
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
                    <SortIcon style={{ marginRight: "8px" }} /> {tc('sortBy')}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{tc('sortByField')}</Menu.Label>
                  {sortOptions.map((option) => (
                    <Menu.Item 
                      key={option.value} 
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label} {sortConfig.key === option.value && (sortConfig.direction === SORT_ASCENDING ? '↑' : '↓')}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <Popover opened={filterPopoverOpen} onChange={setFilterPopoverOpen} width={300} position="bottom-end" shadow="md" withArrow>
                <Popover.Target>
              <Button
                h={50}
                w={130}
                radius="md"
                bg="#323334"
                c="white"
                fz="md"
                fw={500}
                onClick={() => setFilterPopoverOpen((o) => !o)}
              >
                <FilterIcon style={{ marginRight: "8px" }} />
                {tc('filter')}
              </Button>
                </Popover.Target>
                <Popover.Dropdown p="lg">
                  <Text fw={600} fz="md" mb={15}>{tc('filterStaff')}</Text>
                  
                  <Box mb={15}>
                    <Text fw={500} fz="sm" mb={5}>{tc('workingDay')}</Text>
                    <Select
                                              placeholder={tc('selectWorkingDay')}
                      data={workingDaysOptions}
                      value={filterOptions.workingHours}
                      onChange={(value) => handleFilterChange('workingHours', value)}
                      styles={{ input: { backgroundColor: "#F9F9F9", border: "1px solid #E6E6E6", borderRadius: "8px", height: "40px" } }}
                    />
                  </Box>
                  
                  <Box mb={20}>
                    <Text fw={500} fz="sm" mb={5}>{tc('position')}</Text>
                    <Select
                                              placeholder={tc('selectPosition')}
                      data={positionOptions}
                      value={filterOptions.position}
                      onChange={(value) => handleFilterChange('position', value)}
                      styles={{ input: { backgroundColor: "#F9F9F9", border: "1px solid #E6E6E6", borderRadius: "8px", height: "40px" } }}
                    />
                  </Box>
                  
                  <Flex gap="md" justify="space-between">
                    <Button variant="outline" radius="md" size="sm" onClick={resetFilters} fullWidth styles={{ root: { border: "1px solid #E6E6E6", color: "#333" } }}>
                      {tc('reset')}
                    </Button>
                    <Button radius="md" size="sm" bg="#323334" fullWidth onClick={applyFilters}>
                      {tc('apply')}
                    </Button>
                  </Flex>
                </Popover.Dropdown>
              </Popover>
            </div>
          </div>

          {isFetching ? (
            <div style={{ padding: '20px' }}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={40} mt="md" radius="sm" />
                ))}
            </div>
            ) : (
            <div className="overflow-auto">
                <StaffTable
                staffData={sortedAndFilteredStaffData}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                sortConfig={sortConfig}
                handleSort={handleSort}
                formatWorkingHours={formatWorkingHours}
                calculateTotalHours={calculateTotalHours}
                />
            </div>
          )}
        </Container>
      </Paper>
      
      <CommonModal
        opened={deleteModalOpen}
        close={() => setDeleteModalOpen(false)}
        content={
          <DeleteStaffModal
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            staffName={staffToDelete?.name || `${staffToDelete?.firstName || ''} ${staffToDelete?.lastName || ''}`.trim() || 'this staff member'}
          />
        }
      />
      </Box>
    </BatchTranslationLoader>
  );
};

export default StaffManagement;
