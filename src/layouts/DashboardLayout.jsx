import React, { useMemo, useState } from "react";
import Sidebar from "../components/layout/sidebar";
import Topbar from "../components/layout/topbar";
import LightweightTopbar from "../components/layout/LightweightTopbar";
import { Outlet, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";

const DashboardLayout = () => {
  const [opened, setOpened] = useState(false);
  const [collapsed, { toggle }] = useDisclosure();
  const location = useLocation();

  const useLightweightTopbar = useMemo(() => {
    return (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/clients"
    );
  }, [location.pathname]);

  return (
    <div className="p-2 gap-3 flex flex-col lg:flex-row bg-gray-100 h-full overflow-hidden">
      <Sidebar
        opened={opened}
        toggle={() => setOpened(!opened)}
        collapseToggle={toggle}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {useLightweightTopbar ? (
          <LightweightTopbar toggle={() => setOpened(!opened)} />
        ) : (
          <Topbar toggle={() => setOpened(!opened)} />
        )}

        <div className="py-3 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
