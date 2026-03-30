import React, { useState, useEffect } from "react";
import { Avatar, Badge, Menu, ScrollArea, Button, Text, Title, Drawer, Image, Select, Textarea, CopyButton, Tooltip, Loader } from "@mantine/core";
import { FaBell } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, X, Copy, Check } from "tabler-icons-react";
import CommonModal from "../common/CommonModal";
import { ReviewIcon, SuggestionIcon } from "../common/Svgs";
import SuggestionModalContent from '../common/SuggestionModalContent';
import NotificationDetailModal from '../common/NotificationDetailModal'; // Import the new modal
import { useNotifications } from "../../hooks/useNotifications";
import { useLogout } from "../../hooks/useLogin";
import { useGetProfileSettings } from "../../hooks/useAuth";
import { useAdminProfile } from "../../hooks/useAdmin";
import BatchLanguageSelector from "../barber/BatchLanguageSelector";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { localizeNotification } from "../../utils/notificationLocalization";
import { useGetClients } from "../../hooks/useClients";
import { useGenerateReviewLink } from "../../hooks/useAppointments";
import { toast } from "sonner";

const NotificationCard = ({ notification, onActionClick }) => {
  const { tc } = useBatchTranslation();

  const localized = localizeNotification(notification, tc);
  const cardData = {
    id: notification._id,
    title: localized.title || tc(notification.title || notification.message), // Translate the title/message
    description: localized.description || tc(notification.message), // Translate the message
    type: localized.type || (notification.type || 'client'), // New type field from backend (barber/client)
    image: notification.image,
    data: notification.data, // Additional data from backend
    actions: {
      primary: {
        label: tc('viewDetails'),
        onClick: () => onActionClick(notification),
      },
    },
  };

  // Display appropriate icon based on notification type
  const getNotificationIcon = () => {
    if (cardData.data?.notificationType === "review") return <ReviewIcon />;
    if (cardData.data?.notificationType === "suggestion") return <SuggestionIcon />;
    if (cardData.type === "barber") return "✂️";
    if (cardData.type === "client") return "👤";
    if (cardData.type === "admin") return "⚙️";
    return "📅";
  };

  return (
    <article className="flex flex-col w-full px-4 py-4 mb-3.5 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex flex-row items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] sm:min-w-[56px] shrink-0 bg-gray-50 rounded-full">
          {getNotificationIcon()}
        </div>
        <div className="w-full min-h-[50px] flex-1 overflow-hidden">
          <h2 className="text-sm sm:text-md font-medium text-gray-900 truncate">
            {cardData.title}
          </h2>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-light text-gray-400 line-clamp-2">
            {cardData.description}
          </p>
        </div>
      </div>
      {cardData.image && (
        <img
          src={cardData.image}
          alt="Suggestion preview"
          className="object-contain w-20 sm:w-24 mt-2 mx-auto rounded-lg aspect-[1.36]"
        />
      )}
      <div className={`flex mt-3 sm:mt-5 max-w-full flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-semibold justify-center w-full`}>
        <Button
          onClick={cardData.actions.primary.onClick}
          className="!flex !items-center !justify-center !min-h-8 sm:!min-h-10 !px-3 sm:!px-5 !py-2 sm:!py-3 !text-white !bg-gray-900 !rounded-lg !text-xs sm:!text-sm"
        >
          <span className="!text-center !px-1">
            {tc('viewDetails')}
          </span>
        </Button>
      </div>
    </article>
  );
};
const Topbar = ({ subtitle, toggle, isAdmin = false, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  
  const defaultSubtitle = tc('welcomeToYouCalendyManagement');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState("unread");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewLinkModal, setShowReviewLinkModal] = useState(false);
  const [showGeneratedLinkModal, setShowGeneratedLinkModal] = useState(false);
  const [generatedReviewLink, setGeneratedReviewLink] = useState("barbershop.com/review/xyz123");
  const [user, setUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false); // State for the new modal
  const isAdminPath = location.pathname.startsWith("/admin");
  const { mutate: logout } = useLogout(isAdminPath ? "admin" : "user");

  // Check if user is authenticated
  const token = isAdminPath ? localStorage.getItem("adminToken") : localStorage.getItem("token");
  const isAuthenticated = !!token;

  const { data: profileData, refetch: refetchProfile, isLoading, error } = useGetProfileSettings();
  const { data: adminData } = useAdminProfile();

  // Get profile image based on user type
  const profileImage = isAdminPath
    ? (adminData?.profileImage || null)
    : (profileData?.data?.profileImage || null);

  // Get notifications based on user type
  const { notifications, markAllRead, isMarkingAsRead } = useNotifications(
    isAdminPath ? "admin" : "client" // Fetch admin notifications for admin users, client for regular users
  );
  useEffect(() => {
    try {
      const userKey = isAdminPath ? "adminUser" : "user";
      const storedUser = localStorage.getItem(userKey);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }, [isAdminPath]);

  useEffect(() => {
    if (!isAdminPath) {
      refetchProfile();
    }
  }, [isAdminPath, refetchProfile]);

  const handleViewSuggestion = (notification) => {
    setSelectedNotification(notification);
    setShowSuggestionModal(true);
  };

  const handleViewReview = (notification) => {
    setSelectedReview(notification);
    setShowReviewModal(true);
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleNotificationClick = (notification) => {
    if (notification.cta) {
      navigate(notification.cta);
      setShowNotifications(false);
    } else {
      const notificationType = notification.data?.notificationType;

      if (notificationType === 'review') {
        handleViewReview(notification);
      } else if (notificationType === 'suggestion') {
        handleViewSuggestion(notification);
      } else {
        handleViewDetails(notification); // Use the new handler for other types
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "read") return notification.isRead;
    return !notification.isRead;
  });

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate(location.pathname.startsWith("/admin") ? "/admin" : "/login");
      }
    });
  };

  const handleGenerateReviewLink = () => {
    setShowReviewLinkModal(true);
  };

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
    displayHeaderText = translationKey ? tc(translationKey) : (routeName?.length > 2
      ? routeName[0] + " " + routeName[1] + " " + routeName[2]
      : routeName?.length > 1
        ? routeName[0] + " " + routeName[1]
        : routeName[0]);
  }

  const LogoutModalContent = () => (
    <div className="p-4 text-center">
      <Title order={3} className="!mb-4">{tc('logoutConfirmation')}</Title>
      <Text c="dimmed" size="sm" className="!mb-6 text-[#7898AB]">
        {tc('areYouSureLogout')}
      </Text>
      <div className="flex justify-center gap-4">
        <Button
          variant="default"
          onClick={() => setShowLogoutModal(false)}
          className="!px-4 !py-2"
        >
          {tc('cancel')}
        </Button>
        <Button
          color="red"
          onClick={handleLogout}
          className="!px-4 !py-2"
        >
          {tc('logout')}
        </Button>
      </div>
    </div>
  );

  const ReviewLinkModalContent = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [message, setMessage] = useState(tc('defaultReviewMessage'));
    const [selectOpen, setSelectOpen] = useState(false);
    const [selectDisabled, setSelectDisabled] = useState(true);
    
    // Fetch real clients from the API
    const { data: clientsData, isLoading: clientsLoading } = useGetClients({ limit: 1000 });
    
    // Use the real generate review link mutation
    const { mutate: sendReviewLink, isPending: isSendingReview } = useGenerateReviewLink();
    
    // Transform clients data for the Select component
    const clients = React.useMemo(() => {
      if (!clientsData?.clients) return [];
      return clientsData.clients
        .filter(client => client.phone) // Only include clients with phone numbers
        .map(client => ({
          value: client._id,
          label: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.phone,
          phone: client.phone,
        }));
    }, [clientsData]);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setSelectDisabled(false);
      }, 300);
      return () => clearTimeout(timer);
    }, []);

    const handleGenerateLink = () => {
      if (!selectedClient) {
        toast.error(tc('pleaseSelectClient') || 'Please select a client');
        return;
      }
      
      // Find the selected client details
      const client = clients.find(c => c.value === selectedClient);
      if (!client) return;
      
      // Call the actual API to send the review link via SMS
      sendReviewLink(
        {
          clientId: selectedClient,
          customMessage: message,
        },
        {
          onSuccess: (response) => {
            const data = response?.data;
            if (data?.smsSent) {
              toast.success(tc('reviewLinkSentSuccessfully') || 'Review link sent successfully via SMS!');
            } else {
              // SMS wasn't sent but link was generated
              toast.warning(tc('reviewLinkGeneratedButSmsNotSent') || 'Review link generated but SMS was not sent');
            }
            // Store the link for the generated link modal
            if (data?.reviewLink) {
              setGeneratedReviewLink(data.reviewLink);
            }
            setShowReviewLinkModal(false);
            setShowGeneratedLinkModal(true);
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || tc('failedToGenerateReviewLink') || 'Failed to send review link';
            toast.error(errorMessage);
          },
        }
      );
    };

    return (
      <div className="p-6 sm:p-8">
        <Title className="!text-left !text-2xl !font-semibold !mb-2">{tc('sendReviewRequest')}</Title>
        <Text className="!text-gray-600 !text-left !text-sm !mb-8">
          {tc('generateCustomGoogleReviewLink')}
        </Text>

        <div className="mb-6">
          <Text className="!text-left !font-medium !mb-3">{tc('selectClient')}</Text>
          <Select
            placeholder={clientsLoading ? (tc('loadingClients') || 'Loading clients...') : tc('selectClient')}
            data={clients}
            value={selectedClient}
            onChange={setSelectedClient}
            searchable
            clearable
            disabled={selectDisabled || clientsLoading}
            initiallyOpened={false}
            opened={selectOpen}
            onDropdownOpen={() => setSelectOpen(true)}
            onDropdownClose={() => setSelectOpen(false)}
            closeDropdownOnScroll={true}
            withinPortal={true}
            dropdownPosition="bottom"
            clickOutsideEvents={['mouseup', 'touchend']}
            className="w-full"
            nothingFoundMessage={tc('noClientsWithPhone') || 'No clients with phone numbers found'}
            styles={{
              dropdown: { maxHeight: 200, zIndex: 1000 },
              root: { zIndex: 1 }
            }}
          />
          {clients.length === 0 && !clientsLoading && (
            <Text size="xs" c="dimmed" mt="xs">
              {tc('noClientsAvailableHint') || 'Add clients with phone numbers to send review requests.'}
            </Text>
          )}
        </div>

        <div className="mb-8">
          <Text className="!text-left !font-medium !mb-3">{tc('writeMessage')}</Text>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minRows={6}
            className="w-full"
            styles={{
              input: {
                border: '1px solid #E4E9F2',
                borderRadius: '10px',
                padding: '10px',
                height: '100px',
              },
            }}
          />
        </div>

        <Button
          fullWidth
          onClick={handleGenerateLink}
          size="lg"
          loading={isSendingReview}
          disabled={!selectedClient || isSendingReview}
          className="!bg-gray-800 !text-white !rounded-md !font-medium !mt-16 !h-[40px] !text-base disabled:!opacity-50"
        >
          {isSendingReview ? (tc('sendingReviewLink') || 'Sending...') : (tc('sendReviewLink') || 'Send Review Link')}
        </Button>
      </div>
    );
  };

  const GeneratedLinkModalContent = () => (
    <div className="p-6 sm:p-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check size={32} className="text-green-600" />
        </div>
      </div>
      <Title align="center" className="!text-2xl !font-semibold !mb-2">{tc('smsSentSuccessfully') || 'SMS Sent Successfully!'}</Title>
      <Text align="center" c="dimmed" size="sm" className="!mb-8">
        {tc('reviewLinkSentToClient') || 'The review link has been sent to your client via SMS.'}
      </Text>

      <Text className="!text-left !font-medium !mb-2">{tc('reviewLinkCopy') || 'Review Link (for your reference):'}</Text>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
        <Text size="md" className="flex-1 mr-2 truncate text-left">
          {generatedReviewLink}
        </Text>
        <CopyButton value={generatedReviewLink} timeout={2000}>
          {({ copied, copy }) => (
            <Button
              variant="subtle"
              onClick={copy}
              className="!p-2 !bg-gray-200 !rounded-xl !min-w-[40px] !min-h-[40px]"
              aria-label={tc('copyLink')}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </Button>
          )}
        </CopyButton>
      </div>
    </div>
  );

  const ReviewModalContent = () => (
    <div className="relative p-4">
      <Title className="!text-left !text-xl sm:!text-2xl md:!text-3xl !mt-2 !font-semibold !mb-6 sm:!mb-10">{tc('clientReview')}</Title>
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-xl ${i < (selectedReview?.reviewDetails?.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
          ))}
        </div>
        <span className="ml-2 text-gray-600 text-sm">{selectedReview?.reviewDetails?.clientName}</span>
      </div>
      <Text className="!text-gray-900 !text-left !text-xs sm:!text-sm">
        {selectedReview?.reviewDetails?.message}
      </Text>
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
                {tc(title || displayHeaderText)}
              </h1>
              <p className="hidden mt-2 text-xs text-gray-500 lg:block" data-translated="true">
                {tc(subtitle || 'welcomeToYouCalendyManagement')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {/* Language Selector - Mobile Compact */}
            <div className="md:hidden">
              <BatchLanguageSelector
                variant="menu"
                size="sm"
                showFlag={true}
                showLabel={true}
                placement="bottom-end"
                className="bg-slate-200 hover:bg-slate-300 rounded-full border border-slate-300"
                darkMode={false}
                mobileCompact={true}
              />
            </div>
            

            {/* Language Selector - Desktop */}
            <div className="hidden md:block">
              <BatchLanguageSelector
                variant="dropdown"
                size="sm"
                showFlag={true}
                showLabel={false}
                placement="bottom-end"
                className=""
                darkMode={false}
              />
            </div>



            {isAdmin ? (
              <div
                className="relative flex items-center gap-1 px-2 py-2 cursor-pointer md:gap-2 md:px-3 lg:px-5 md:py-3 bg-slate-200 rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <p className="hidden text-sm text-slate-800 lg:block">
                  {tc('notification')}
                </p>
                <FaBell size={16} className="text-gray-500 cursor-pointer" />
                {unreadCount > 0 &&
                  <Badge className="!absolute -top-1 -right-1" color="red" circle>
                    {unreadCount}
                  </Badge>
                }
              </div>
            ) : (
              <div
                className="relative flex items-center gap-1 px-2 py-2 cursor-pointer md:gap-2 md:px-3 lg:px-5 md:py-3 bg-slate-200 rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <p className="hidden text-sm text-slate-800 lg:block">
                  {tc('notification')}
                </p>
                <FaBell size={16} className="text-gray-500 cursor-pointer" />
                {unreadCount > 0 &&
                  <Badge className="!absolute -top-1 -right-1" color="red" circle>
                    {unreadCount}
                  </Badge>
                }
              </div>
            )}

            <Menu shadow="md" width={200} position="top-end">
              <Menu.Target>
                <div className="flex items-center gap-1 md:gap-2">
                  <Avatar
                    radius="xl"
                    size="md"
                    className="md:h-10 md:w-10 lg:h-12 lg:w-12"
                    src={profileImage}
                    alt="Profile"
                  />
                  <ChevronDown
                    size={20}
                    className="text-gray-500 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6"
                  />
                </div>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate(isAdmin ? '/admin/setting' : '/dashboard/setting')}>{tc('profileSettings')}</Menu.Item>
                <Menu.Item color="red" onClick={() => setShowLogoutModal(true)}>{tc('logout')}</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>

      <Drawer
          opened={showNotifications}
          onClose={() => setShowNotifications(false)}
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
          <div className="px-4 pt-4 pb-3 bg-gray-50 sm:px-6 sm:pt-6 sm:pb-4 relative">
            <Button
              onClick={() => setShowNotifications(false)}
              variant="subtle"
              p={0}
              className="!absolute !right-4 !top-4 !p-1 !rounded-full !hover:bg-gray-200 !transition-colors !bg-transparent !inline-flex md:!hidden"
              aria-label={tc('closeNotificationPanel')}
            >
              <X size={24} className="text-gray-700" />
            </Button>

            <div className="flex flex-col sm:flex-row flex-wrap w-full max-md:max-w-full gap-3 sm:gap-0">
              <div className="w-fit grow shrink-0 basis-0 min-h-[30px]">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {tc('notification')}
                </h1>
                <p className="text-xs sm:text-sm font-normal text-gray-500">
                  {tc('neverMissUpdate')}
                </p>
              </div>
              <Button
                variant="subtle"
                className="!text-gray-700 !text-xs sm:!text-sm !font-medium !border-[#E2E2E2] !border-2 !rounded-lg !h-auto !p-2 !min-h-0 !bg-white !self-start"
                onClick={markAllRead}
                disabled={isMarkingAsRead || unreadCount === 0}
              >
                {tc('markAsAllRead')}
              </Button>
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
                    className={`text-xs sm:text-sm md:text-md ${filter === "all"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400 font-normal"
                      }`}
                  >
                    {tc('all')}
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
                    className={`text-xs sm:text-sm md:text-md ${filter === "unread"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400 font-normal"
                      }`}
                  >
                    {tc('unread')}
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
                    className={`text-xs sm:text-sm md:text-md ${filter === "read"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400 font-normal"
                      }`}
                  >
                    {tc('read')}
                  </span>
                </Button>
                {filter === "read" && (
                  <div className="border border-gray-900 shrink-0" />
                )}
              </div>
            </nav>
          </div>

          <ScrollArea className="h-full" style={{ padding: '0 1rem 4rem 1rem' }}>
            <div className="flex flex-col w-full">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onActionClick={handleNotificationClick}
                  />
                ))
              ) : (
                <Text align="center" mt="lg" c="dimmed">
                  {tc('noNotifications', { filter: tc(filter) })}
                </Text>
              )}
            </div>
          </ScrollArea>
        </Drawer>
      <CommonModal
        opened={showLogoutModal}
        close={() => setShowLogoutModal(false)}
        content={<LogoutModalContent />}
        size="sm"
      />

      <CommonModal
        opened={showSuggestionModal}
        close={() => setShowSuggestionModal(false)}
        content={<SuggestionModalContent suggestion={selectedNotification} onClose={() => setShowSuggestionModal(false)} />}
        size="md"
        styles={{
          content: {
            borderRadius: '30px',
            border: '1px solid rgba(228, 233, 242, 0.5)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            padding: 0,
            overflow: 'visible',
            position: 'relative'
          },
          body: {
            overflow: 'visible'
          },
          inner: {
            overflow: 'visible'
          }
        }}
      />

      <CommonModal
        opened={showReviewModal}
        close={() => setShowReviewModal(false)}
        content={<ReviewModalContent />}
        size="md"
        styles={{
          content: {
            borderRadius: '30px',
            border: '1px solid rgba(228, 233, 242, 0.5)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            padding: 0
          }
        }}
      />

      <CommonModal
        opened={showReviewLinkModal}
        close={() => setShowReviewLinkModal(false)}
        content={<ReviewLinkModalContent />}
        size="lg"
        styles={{
          content: {
            borderRadius: '30px',
            border: '1px solid rgba(228, 233, 242, 0.5)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            padding: 0,
            minHeight: '500px',
            width: '90%',
            maxWidth: '600px'
          }
        }}
      />

      <CommonModal
        opened={showGeneratedLinkModal}
        close={() => setShowGeneratedLinkModal(false)}
        content={<GeneratedLinkModalContent />}
        size="md"
        styles={{
          content: {
            borderRadius: '30px',
            border: '1px solid rgba(228, 233, 242, 0.5)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
            padding: 0
          }
        }}
      />
      {/* Add the new NotificationDetailModal to the DOM */}
      <NotificationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        notification={selectedNotification}
      />
    </>
  );
};

export default Topbar;
