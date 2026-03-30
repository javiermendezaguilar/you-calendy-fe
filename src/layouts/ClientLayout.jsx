import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Header from "../pages/Client/Header";
import { useBatchTranslation } from "../contexts/BatchTranslationContext";
import BatchTranslationLoader from "../components/barber/BatchTranslationLoader";

const ClientLayout = () => {
  const { tc } = useBatchTranslation();
  const [activeTab, setActiveTab] = useState("appointments");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <BatchTranslationLoader>
      <div className="h-full flex flex-col overflow-hidden">
        <div>
          <Header onTabChange={handleTabChange} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Outlet context={[activeTab, setActiveTab]} />
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default ClientLayout;
