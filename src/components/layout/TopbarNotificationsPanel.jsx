import React, { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  Drawer,
  ScrollArea,
  Select,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { Check, Copy, X } from "tabler-icons-react";
import CommonModal from "../common/CommonModal";
import { ReviewIcon, SuggestionIcon } from "../common/Svgs";
import SuggestionModalContent from "../common/SuggestionModalContent";
import NotificationDetailModal from "../common/NotificationDetailModal";
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
    title: localized.title || tc(notification.title || notification.message),
    description: localized.description || tc(notification.message),
    type: localized.type || notification.type || "client",
    image: notification.image,
    data: notification.data,
    actions: {
      primary: {
        label: tc("viewDetails"),
        onClick: () => onActionClick(notification),
      },
    },
  };

  const getNotificationIcon = () => {
    if (cardData.data?.notificationType === "review") return <ReviewIcon />;
    if (cardData.data?.notificationType === "suggestion")
      return <SuggestionIcon />;
    if (cardData.type === "barber") return "✂️";
    if (cardData.type === "client") return "👤";
    if (cardData.type === "admin") return "⚙️";
    return "📝";
  };

  return (
    <article className="mb-3.5 flex w-full flex-col rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-row items-center gap-3">
        <div className="flex h-12 w-12 min-w-[48px] shrink-0 items-center justify-center rounded-full bg-gray-50 sm:h-14 sm:w-14 sm:min-w-[56px]">
          {getNotificationIcon()}
        </div>
        <div className="min-h-[50px] w-full flex-1 overflow-hidden">
          <h2 className="truncate text-sm font-medium text-gray-900 sm:text-md">
            {cardData.title}
          </h2>
          <p className="mt-1 text-xs font-light text-gray-400 line-clamp-2 sm:mt-1.5 sm:text-sm">
            {cardData.description}
          </p>
        </div>
      </div>
      {cardData.image ? (
        <img
          src={cardData.image}
          alt="Suggestion preview"
          className="mx-auto mt-2 aspect-[1.36] w-20 rounded-lg object-contain sm:w-24"
        />
      ) : null}
      <div className="mt-3 flex w-full max-w-full flex-wrap justify-center gap-2 text-xs font-semibold sm:mt-5 sm:gap-4 sm:text-sm">
        <Button
          onClick={cardData.actions.primary.onClick}
          className="!flex !min-h-8 !items-center !justify-center !rounded-lg !bg-gray-900 !px-3 !py-2 !text-xs !text-white sm:!min-h-10 sm:!px-5 sm:!py-3 sm:!text-sm"
        >
          <span className="!px-1 !text-center">{tc("viewDetails")}</span>
        </Button>
      </div>
    </article>
  );
};

const TopbarNotificationsPanel = ({
  opened,
  onClose,
  notifications,
  markAllRead,
  isMarkingAsRead,
}) => {
  const { tc } = useBatchTranslation();
  const [filter, setFilter] = useState("unread");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewLinkModal, setShowReviewLinkModal] = useState(false);
  const [showGeneratedLinkModal, setShowGeneratedLinkModal] = useState(false);
  const [generatedReviewLink, setGeneratedReviewLink] = useState(
    "barbershop.com/review/xyz123"
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState(tc("defaultReviewMessage"));
  const [selectOpen, setSelectOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "read") return notification.isRead;
    return !notification.isRead;
  });

  const { data: clientsData, isLoading: clientsLoading } = useGetClients({
    limit: 1000,
  });
  const { mutate: sendReviewLink, isPending: isSendingReview } =
    useGenerateReviewLink();

  const clients = useMemo(() => {
    if (!clientsData?.clients) return [];
    return clientsData.clients
      .filter((client) => client.phone)
      .map((client) => ({
        value: client._id,
        label:
          `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
          client.phone,
        phone: client.phone,
      }));
  }, [clientsData]);

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
    const notificationType = notification.data?.notificationType;

    if (notificationType === "review") {
      handleViewReview(notification);
      return;
    }

    if (notificationType === "suggestion") {
      handleViewSuggestion(notification);
      return;
    }

    handleViewDetails(notification);
  };

  const handleGenerateLink = () => {
    if (!selectedClient) {
      toast.error(tc("pleaseSelectClient") || "Please select a client");
      return;
    }

    sendReviewLink(
      {
        clientId: selectedClient,
        customMessage: message,
      },
      {
        onSuccess: (response) => {
          const data = response?.data;
          if (data?.smsSent) {
            toast.success(
              tc("reviewLinkSentSuccessfully") ||
                "Review link sent successfully via SMS!"
            );
          } else {
            toast.warning(
              tc("reviewLinkGeneratedButSmsNotSent") ||
                "Review link generated but SMS was not sent"
            );
          }
          if (data?.reviewLink) {
            setGeneratedReviewLink(data.reviewLink);
          }
          setShowReviewLinkModal(false);
          setShowGeneratedLinkModal(true);
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            tc("failedToGenerateReviewLink") ||
            "Failed to send review link";
          toast.error(errorMessage);
        },
      }
    );
  };

  const ReviewLinkModalContent = () => (
    <div className="p-6 sm:p-8">
      <Title className="!mb-2 !text-left !text-2xl !font-semibold">
        {tc("sendReviewRequest")}
      </Title>
      <Text className="!mb-8 !text-left !text-sm !text-gray-600">
        {tc("generateCustomGoogleReviewLink")}
      </Text>

      <div className="mb-6">
        <Text className="!mb-3 !text-left !font-medium">
          {tc("selectClient")}
        </Text>
        <Select
          placeholder={
            clientsLoading
              ? tc("loadingClients") || "Loading clients..."
              : tc("selectClient")
          }
          data={clients}
          value={selectedClient}
          onChange={setSelectedClient}
          searchable
          clearable
          disabled={clientsLoading}
          initiallyOpened={false}
          opened={selectOpen}
          onDropdownOpen={() => setSelectOpen(true)}
          onDropdownClose={() => setSelectOpen(false)}
          closeDropdownOnScroll
          withinPortal
          dropdownPosition="bottom"
          clickOutsideEvents={["mouseup", "touchend"]}
          className="w-full"
          nothingFoundMessage={
            tc("noClientsWithPhone") || "No clients with phone numbers found"
          }
          styles={{
            dropdown: { maxHeight: 200, zIndex: 1000 },
            root: { zIndex: 1 },
          }}
        />
      </div>

      <div className="mb-8">
        <Text className="!mb-3 !text-left !font-medium">
          {tc("writeMessage")}
        </Text>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={6}
          className="w-full"
          styles={{
            input: {
              border: "1px solid #E4E9F2",
              borderRadius: "10px",
              padding: "10px",
              height: "100px",
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
        className="!mt-16 !h-[40px] !rounded-md !bg-gray-800 !text-base !font-medium !text-white disabled:!opacity-50"
      >
        {isSendingReview
          ? tc("sendingReviewLink") || "Sending..."
          : tc("sendReviewLink") || "Send Review Link"}
      </Button>
    </div>
  );

  const GeneratedLinkModalContent = () => (
    <div className="p-6 sm:p-8">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check size={32} className="text-green-600" />
        </div>
      </div>
      <Title align="center" className="!mb-2 !text-2xl !font-semibold">
        {tc("smsSentSuccessfully") || "SMS Sent Successfully!"}
      </Title>
      <Text align="center" c="dimmed" size="sm" className="!mb-8">
        {tc("reviewLinkSentToClient") ||
          "The review link has been sent to your client via SMS."}
      </Text>

      <Text className="!mb-2 !text-left !font-medium">
        {tc("reviewLinkCopy") || "Review Link (for your reference):"}
      </Text>
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Text size="md" className="mr-2 flex-1 truncate text-left">
          {generatedReviewLink}
        </Text>
        <CopyButton value={generatedReviewLink} timeout={2000}>
          {({ copied, copy }) => (
            <Button
              variant="subtle"
              onClick={copy}
              className="!min-h-[40px] !min-w-[40px] !rounded-xl !bg-gray-200 !p-2"
              aria-label={tc("copyLink")}
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
      <Title className="!mt-2 !mb-6 !text-left !text-xl !font-semibold sm:!mb-10 sm:!text-2xl md:!text-3xl">
        {tc("clientReview")}
      </Title>
      <div className="mb-4 flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${
                i < (selectedReview?.reviewDetails?.rating || 0)
                  ? "text-yellow-500"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">
          {selectedReview?.reviewDetails?.clientName}
        </span>
      </div>
      <Text className="!text-left !text-xs !text-gray-900 sm:!text-sm">
        {selectedReview?.reviewDetails?.message}
      </Text>
    </div>
  );

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size={{ base: "100%", sm: "500px" }}
        withCloseButton={false}
        className="!border-none"
        classNames={{
          root: "!m-0 !h-[95vh] !border-none !p-0 sm:!p-6",
          content:
            "!h-full !w-full !max-w-full !rounded-none !border-none !shadow-lg sm:!h-[95vh] sm:!w-[500px] sm:!max-w-[500px] sm:!rounded-[40px]",
          inner: "!m-0 !right-0 !border-none !p-0 sm:!p-6",
          body: "!border-none !p-0",
          header: "!border-none !m-0 !p-0",
          title: "!border-none !m-0 !p-0",
          overlay: "!border-none",
        }}
      >
        <div className="relative bg-gray-50 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <Button
            onClick={onClose}
            variant="subtle"
            p={0}
            className="!absolute !right-4 !top-4 !inline-flex !rounded-full !bg-transparent !p-1 !transition-colors !hover:bg-gray-200 md:!hidden"
            aria-label={tc("closeNotificationPanel")}
          >
            <X size={24} className="text-gray-700" />
          </Button>

          <div className="flex w-full max-w-full flex-col flex-wrap gap-3 sm:flex-row sm:gap-0">
            <div className="min-h-[30px] w-fit grow shrink-0 basis-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {tc("notification")}
              </h1>
              <p className="text-xs font-normal text-gray-500 sm:text-sm">
                {tc("neverMissUpdate")}
              </p>
            </div>
            <Button
              variant="subtle"
              className="!h-auto !min-h-0 !self-start !rounded-lg !border-2 !border-[#E2E2E2] !bg-white !p-2 !text-xs !font-medium !text-gray-700 sm:!text-sm"
              onClick={markAllRead}
              disabled={isMarkingAsRead || unreadCount === 0}
            >
              {tc("markAsAllRead")}
            </Button>
          </div>

          <nav className="mt-6 flex w-full max-w-full justify-between gap-5 whitespace-nowrap sm:mt-10 sm:w-[269px] md:mt-[45px]">
            {["all", "unread", "read"].map((value) => (
              <div key={value}>
                <Button
                  onClick={() => setFilter(value)}
                  variant="subtle"
                  p={0}
                  className="!flex !min-h-0 !h-auto !gap-1 !bg-transparent !p-0"
                >
                  <span
                    className={`text-xs sm:text-sm md:text-md ${
                      filter === value
                        ? "font-medium text-gray-900"
                        : "font-normal text-gray-400"
                    }`}
                  >
                    {tc(value)}
                  </span>
                  {value === "unread" ? (
                    <span className="text-xs font-normal text-green-700 sm:text-sm md:text-md">
                      {String(unreadCount).padStart(2, "0")}
                    </span>
                  ) : null}
                </Button>
                {filter === value ? (
                  <div className="shrink-0 border border-gray-900" />
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <ScrollArea className="h-full" style={{ padding: "0 1rem 4rem 1rem" }}>
          <div className="flex w-full flex-col">
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
                {tc("noNotifications", { filter: tc(filter) })}
              </Text>
            )}
          </div>
        </ScrollArea>
      </Drawer>

      <CommonModal
        opened={showSuggestionModal}
        close={() => setShowSuggestionModal(false)}
        content={
          <SuggestionModalContent
            suggestion={selectedNotification}
            onClose={() => setShowSuggestionModal(false)}
          />
        }
        size="md"
      />

      <CommonModal
        opened={showReviewModal}
        close={() => setShowReviewModal(false)}
        content={<ReviewModalContent />}
        size="md"
      />

      <CommonModal
        opened={showReviewLinkModal}
        close={() => setShowReviewLinkModal(false)}
        content={<ReviewLinkModalContent />}
        size="lg"
      />

      <CommonModal
        opened={showGeneratedLinkModal}
        close={() => setShowGeneratedLinkModal(false)}
        content={<GeneratedLinkModalContent />}
        size="md"
      />

      <NotificationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        notification={selectedNotification}
      />
    </>
  );
};

export default TopbarNotificationsPanel;
