import React, { useMemo, useState } from "react";
import { Avatar, Button, Menu } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import BatchLanguageSelector from "../barber/BatchLanguageSelector";
import CommonModal from "../common/CommonModal";
import { useLogout } from "../../hooks/useLogin";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

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

const getStoredBarberInitials = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return "B";
    }

    const user = JSON.parse(storedUser);
    const first = user?.firstName?.trim?.()?.[0] || "";
    const last = user?.lastName?.trim?.()?.[0] || "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "B";
  } catch {
    return "B";
  }
};

const LightweightTopbar = ({ subtitle, toggle, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tc } = useBatchTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { mutate: logout } = useLogout("user");

  const displayHeaderText = useMemo(() => {
    if (title) {
      return tc(title);
    }

    if (location.pathname === "/dashboard") {
      return tc("dashboard");
    }

    const segments = location.pathname.split("/").filter(Boolean);
    const mainRoute = segments[1] || segments[0] || "dashboard";
    const translationKey = routeTranslationMap[mainRoute];

    if (translationKey) {
      return tc(translationKey);
    }

    return mainRoute
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [location.pathname, tc, title]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

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
                {displayHeaderText}
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
                darkMode={false}
              />
            </div>

            <Menu shadow="md" width={200} position="top-end">
              <Menu.Target>
                <div className="flex items-center gap-1 md:gap-2">
                  <Avatar
                    radius="xl"
                    size="md"
                    className="md:h-10 md:w-10 lg:h-12 lg:w-12"
                  >
                    {getStoredBarberInitials()}
                  </Avatar>
                  <ChevronDown
                    size={20}
                    className="cursor-pointer text-gray-500 md:h-6 md:w-6 lg:h-6 lg:w-6"
                  />
                </div>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate("/dashboard/setting")}>
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

      <CommonModal
        opened={showLogoutModal}
        close={() => setShowLogoutModal(false)}
        content={<LogoutModalContent />}
        size="sm"
      />
    </>
  );
};

export default LightweightTopbar;
