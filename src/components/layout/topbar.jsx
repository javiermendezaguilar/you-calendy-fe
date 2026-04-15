import React, { Suspense, lazy, useEffect, useState } from "react";
import { Avatar, Badge, Button, Menu } from "@mantine/core";
import { FaBell } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "tabler-icons-react";
import CommonModal from "../common/CommonModal";
import { useNotifications } from "../../hooks/useNotifications";
import { useLogout } from "../../hooks/useLogin";
import { useGetProfileSettings } from "../../hooks/useAuth";
import { useAdminProfile } from "../../hooks/useAdmin";
import BatchLanguageSelector from "../barber/BatchLanguageSelector";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const TopbarNotificationsPanel = lazy(() =>
  import("./TopbarNotificationsPanel")
);

const Topbar = ({ subtitle, toggle, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdminPath = location.pathname.startsWith("/admin");
  const { mutate: logout } = useLogout(isAdminPath ? "admin" : "user");

  const { data: profileData, refetch: refetchProfile } =
    useGetProfileSettings();
  const { data: adminData } = useAdminProfile();

  const profileImage = isAdminPath
    ? adminData?.profileImage || null
    : profileData?.data?.profileImage || null;

  const { notifications, markAllRead, isMarkingAsRead } = useNotifications(
    isAdminPath ? "admin" : "client"
  );

  useEffect(() => {
    if (!isAdminPath) {
      refetchProfile();
    }
  }, [isAdminPath, refetchProfile]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate(location.pathname.startsWith("/admin") ? "/admin" : "/login");
      },
    });
  };

  const routeName = (() => {
    if (location.pathname?.split("/")[3]?.split("-")?.length === 2) {
      return location.pathname?.split("/")[3]?.split("-");
    }
    if (location.pathname?.split("/")[2]) {
      return location.pathname?.split("/")[2]?.split("-");
    }
    return location.pathname?.split("/")[1]?.split("-");
  })();

  const routeTranslationMap = {
    dashboard: "dashboard",
    clients: "clients",
    marketing: "marketing",
    "staff-management": "staffManagement",
    "clients-note": "clientsNotes",
    "business-setting": "businessSettings",
    support: "support",
    "suggest-feature": "suggestFeature",
    "barber-management": "barberManagement",
    "client-management": "clientManagement",
    "platform-settings": "platformSettings",
    "support-and-communication": "supportAndCommunication",
    "security-and-auditing": "securityAndAuditing",
    "proposed-interfaces": "proposedInterfaces",
    setting: "setting",
  };

  let displayHeaderText = "";
  if (location.pathname === "/admin/dashboard") {
    displayHeaderText = tc("dashboard");
  } else if (location.pathname === "/dashboard") {
    displayHeaderText = tc("dashboard");
  } else {
    const mainRoute =
      location.pathname.split("/").filter((segment) => segment)[1] ||
      location.pathname.split("/").filter((segment) => segment)[0];
    const translationKey = routeTranslationMap[mainRoute];
    displayHeaderText = translationKey
      ? tc(translationKey)
      : routeName?.length > 2
      ? routeName[0] + " " + routeName[1] + " " + routeName[2]
      : routeName?.length > 1
      ? routeName[0] + " " + routeName[1]
      : routeName?.[0];
  }

  const LogoutModalContent = () => (
    <div className="p-4 text-center">
      <h3 className="mb-4 text-xl font-semibold">{tc("logoutConfirmation")}</h3>
      <p className="mb-6 text-sm text-[#7898AB]">{tc("areYouSureLogout")}</p>
      <div className="flex justify-center gap-4">
        <Button
          variant="default"
          onClick={() => setShowLogoutModal(false)}
          className="!px-4 !py-2"
        >
          {tc("cancel")}
        </Button>
        <Button color="red" onClick={handleLogout} className="!px-4 !py-2">
          {tc("logout")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white px-2 py-2 md:px-4 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="lg:hidden">
              <Button
                onClick={toggle}
                variant="subtle"
                p={0}
                className="!cursor-pointer !bg-transparent !p-0 !text-gray-500 !focus:outline-none"
              >
                <svg
                  className="h-5 w-5 md:h-6 md:w-6"
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
              <h1 className="max-w-[150px] truncate text-sm font-bold capitalize text-gray-800 md:max-w-full md:text-md lg:text-3xl">
                {tc(title || displayHeaderText)}
              </h1>
              <p className="mt-2 hidden text-xs text-gray-500 lg:block">
                {tc(subtitle || "welcomeToYouCalendyManagement")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="md:hidden">
              <BatchLanguageSelector
                variant="menu"
                size="sm"
                showFlag
                showLabel
                placement="bottom-end"
                className="rounded-full border border-slate-300 bg-slate-200 hover:bg-slate-300"
                darkMode={false}
                mobileCompact
              />
            </div>

            <div className="hidden md:block">
              <BatchLanguageSelector
                variant="dropdown"
                size="sm"
                showFlag
                showLabel={false}
                placement="bottom-end"
                className=""
                darkMode={false}
              />
            </div>

            <div
              className="relative flex cursor-pointer items-center gap-1 rounded-full bg-slate-200 px-2 py-2 md:gap-2 md:px-3 md:py-3 lg:px-5"
              onClick={() => setShowNotifications(true)}
            >
              <p className="hidden text-sm text-slate-800 lg:block">
                {tc("notification")}
              </p>
              <FaBell size={16} className="cursor-pointer text-gray-500" />
              {unreadCount > 0 ? (
                <Badge
                  className="!absolute -top-1 -right-1"
                  color="red"
                  circle
                >
                  {unreadCount}
                </Badge>
              ) : null}
            </div>

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
                    className="cursor-pointer text-gray-500 md:h-6 md:w-6 lg:h-6 lg:w-6"
                  />
                </div>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={() =>
                    navigate(
                      isAdminPath ? "/admin/setting" : "/dashboard/setting"
                    )
                  }
                >
                  {tc("profileSettings")}
                </Menu.Item>
                <Menu.Item color="red" onClick={() => setShowLogoutModal(true)}>
                  {tc("logout")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>

      {showNotifications ? (
        <Suspense fallback={null}>
          <TopbarNotificationsPanel
            opened={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            markAllRead={markAllRead}
            isMarkingAsRead={isMarkingAsRead}
          />
        </Suspense>
      ) : null}

      <CommonModal
        opened={showLogoutModal}
        close={() => setShowLogoutModal(false)}
        content={<LogoutModalContent />}
        size="sm"
      />
    </>
  );
};

export default Topbar;
