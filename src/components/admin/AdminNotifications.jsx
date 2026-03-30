import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { Drawer, Button, Text, ScrollArea, Badge } from "@mantine/core";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { localizeNotification } from "../../utils/notificationLocalization";

const AdminNotificationCard = ({ notification, onActionClick }) => {
  const { tc } = useBatchTranslation();
  
  const { title, description, type: localizedType } = localizeNotification(notification, tc);
  const cardData = {
    id: notification._id,
    title,
    description,
    type: localizedType || (notification.type || 'admin'),
    image: notification.image,
  };

  const handleClick = () => {
    onActionClick(notification);
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow mb-3"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {cardData.title?.charAt(0) || 'N'}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {cardData.title}
            </h4>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {cardData.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <Badge
              size="sm"
              variant="light"
              color={cardData.type === 'admin' ? 'red' : 'blue'}
            >
              {cardData.type}
            </Badge>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminNotifications = () => {
  const { tc } = useBatchTranslation();
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("unread");
  
  const {
    notifications,
    isLoading,
    markAllRead,
    isMarkingAsRead,
    unreadCount
  } = useNotifications();

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const handleNotificationClick = (notification) => {
    // Handle notification click logic here (disabled for admin)
    // console.log('Notification clicked:', notification);
  };

  return (
    <>
      <div className="relative">
        <div
          className="relative flex items-center gap-1 px-2 py-2 cursor-pointer md:gap-2 md:px-3 lg:px-5 md:py-3 bg-slate-200 rounded-full"
          onClick={() => setOpened(true)}
        >
          <p className="hidden text-sm text-slate-800 lg:block">
            {tc('notification')}
          </p>
          <Bell size={16} className="text-gray-500 cursor-pointer" />
          {unreadCount > 0 && (
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
            onClick={() => setOpened(false)}
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
                {tc('notification')}
              </h1>
              <p className="text-xs sm:text-sm font-normal text-gray-500">
                {tc('neverMissAnImportantUpdate')}
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
                  className={`text-xs sm:text-sm md:text-md ${
                    filter === "all"
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
                  className={`text-xs sm:text-sm md:text-md ${
                    filter === "unread"
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
                  className={`text-xs sm:text-sm md:text-md ${
                    filter === "read"
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
                <AdminNotificationCard
                  key={notification._id}
                  notification={notification}
                  onActionClick={handleNotificationClick}
                />
              ))
            ) : (
              <Text align="center" mt="lg" c="dimmed">
                {tc('youHaveNoNotifications', { filter })}
              </Text>
            )}
          </div>
        </ScrollArea>
      </Drawer>
    </>
  );
};

export default AdminNotifications;