import React, { useState } from "react";
import Sidebar from "../components/layout/sidebar";
import Topbar from "../components/layout/topbar";
import { Outlet } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import BatchTranslationLoader from "../components/barber/BatchTranslationLoader";

const DashboardLayout = () => {
  const [opened, setOpened] = useState(false);
  const [collapsed, { toggle }] = useDisclosure();

  return (
    <BatchTranslationLoader>
      <div className="p-2 gap-3 flex flex-col lg:flex-row bg-gray-100 h-full overflow-hidden">
        <Sidebar
          opened={opened}
          toggle={() => setOpened(!opened)}
          collapseToggle={toggle}
          collapsed={collapsed}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar toggle={() => setOpened(!opened)} />

          <div className="py-3 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default DashboardLayout;
