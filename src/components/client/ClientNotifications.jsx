import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { Drawer, Badge, Button, Text, ScrollArea } from "@mantine/core";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import NotificationDetailModal from "../common/NotificationDetailModal"; // Import the modal
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { localizeNotification } from "../../utils/notificationLocalization";

const ClientNotificationCard = ({ notification, onActionClick }) => {
  const { tc } = useBatchTranslation();
  const localized = localizeNotification(notification, tc);
  const cardData = {
    title: localized.title || tc(notification.title || notification.type || 'notification'),
    description: localized.description || tc(notification.message),
    time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
    isRead: notification.isRead,
    primaryAction: tc('viewDetails')
  };

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(notification);
    }
  };

  return (
    <div className="flex flex-col justify-center px-4 py-3 w-full border-b border-gray-600">
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-sm ${!cardData.isRead ? 'font-semibold text-gray-100' : 'font-normal text-gray-200'} truncate`}>
            {cardData.title}
          </h3>
          {!cardData.isRead && (
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <p className="text-sm text-gray-300 mb-1 line-clamp-2">
          {cardData.description}
        </p>
        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-400">
            {cardData.time}
          </time>
          <button
            onClick={handleActionClick}
            className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
          >
            {cardData.primaryAction}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientNotifications = () => {
  const { tc } = useBatchTranslation();
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("unread");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Determine if client is authenticated; fall back to generic token if clientToken missing.
  // This prevents the bell icon from doing nothing when only a generic token is present.
  const rawClientToken = localStorage.getItem('clientToken');
  const clientId = localStorage.getItem('clientId');
  const genericToken = localStorage.getItem('token');
  const hasClientAuth = !!((rawClientToken || genericToken) && clientId);
  const { notifications = [], markAllRead, isMarkingAsRead } = useNotifications("client");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "read") return notification.isRead;
    return !notification.isRead;
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <div
          className="relative flex items-center gap-1 px-2 py-2 cursor-pointer md:gap-2 md:px-3 lg:px-5 md:py-3 bg-gray-700 rounded-full"
          onClick={() => setOpened(true)}
          title={!hasClientAuth ? tc('pleaseLoginToViewNotifications') : undefined}
        >
          <p className="hidden text-sm text-gray-200 lg:block">
            {tc('notification')}
          </p>
          <Bell size={16} className="text-gray-300 cursor-pointer" />
          {hasClientAuth && unreadCount > 0 && (
            <Badge className="!absolute -top-1 -right-1" color="red" circle>
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

  <Drawer
    opened={opened}
    onClose={() => setOpened(false)}
        position="right"
        size={{ base: "100%", sm: "500px" }}
        withCloseButton={false}
        className="!border-none"
        classNames={{
          root: "!h-[95vh] sm:!h-[95vh] !p-0 sm:!p-6 !m-0 !border-none",
          content: "!rounded-none sm:!rounded-[40px] !h-full sm:!h-[95vh] !border-none !shadow-lg !w-full sm:!w-[500px] !max-w-full sm:!max-w-[500px] !bg-gray-800",
          inner: "!p-0 sm:!p-6 !m-0 !right-0 !border-none",
          body: "!p-0 !border-none !bg-gray-800",
          header: "!p-0 !m-0 !border-none",
          title: "!p-0 !m-0 !border-none",
          overlay: "!border-none"
        }}
      >
  <div className="px-4 pt-4 pb-3 bg-gray-700 sm:px-6 sm:pt-6 sm:pb-4 relative">
          <Button
            onClick={() => setOpened(false)}
            variant="subtle"
            p={0}
            className="!absolute !right-4 !top-4 !p-1 !rounded-full !hover:bg-gray-600 !transition-colors !bg-transparent !inline-flex md:!hidden"
            aria-label="Close notification panel"
          >
            <X size={24} className="text-gray-200" />
          </Button>

          <div className="flex flex-col sm:flex-row flex-wrap w-full max-md:max-w-full gap-3 sm:gap-0">
            <div className="w-fit grow shrink-0 basis-0 min-h-[30px]">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">
                {tc('notification')}
              </h1>
              <p className="text-xs sm:text-sm font-normal text-gray-300">
                {tc('neverMissImportantUpdate')}
              </p>
            </div>
            <Button
              variant="subtle"
              className="!text-gray-200 !text-xs sm:!text-sm !font-medium !border-gray-500 !border-2 !rounded-lg !h-auto !p-2 !min-h-0 !bg-gray-600 !self-start"
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
                  className={`text-xs sm:text-sm md:text-md ${
                    filter === "all"
                      ? "text-gray-100 font-medium"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {tc('all')}
                </span>
              </Button>
              {filter === "all" && (
                <div className="border border-gray-100 shrink-0" />
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
                      ? "text-gray-100 font-medium"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {tc('unread')}
                </span>
                <span className="text-xs sm:text-sm md:text-md font-normal text-green-400">
                  {String(unreadCount).padStart(2, "0")}
                </span>
              </Button>
              {filter === "unread" && (
                <div className="border border-gray-100 shrink-0" />
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
                      ? "text-gray-100 font-medium"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {tc('read')}
                </span>
              </Button>
              {filter === "read" && (
                <div className="border border-gray-100 shrink-0" />
              )}
            </div>
          </nav>
        </div>

        <ScrollArea className="h-full bg-gray-800" style={{ padding: '0 1rem 4rem 1rem' }}>
          <div className="flex flex-col w-full">
            {!hasClientAuth && (
              <Text align="center" mt="lg" c="dimmed" className="text-gray-400 text-sm px-4">
                {tc('pleaseLoginToViewNotifications') || 'Please complete sign in to view notifications.'}
              </Text>
            )}
            {hasClientAuth && (
              filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <ClientNotificationCard
                    key={notification._id}
                    notification={notification}
                    onActionClick={handleNotificationClick}
                  />
                ))
              ) : (
                <Text align="center" mt="lg" c="dimmed" className="text-gray-400">
                  {tc('noNotifications', { filter: tc(filter) })}
                </Text>
              )
            )}
          </div>
        </ScrollArea>
  </Drawer>

      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notification={selectedNotification}
      />
    </>
  );
};

export default ClientNotifications;