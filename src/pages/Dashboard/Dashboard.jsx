import React, { useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import Topbar from "../../components/layout/topbar";

const Dashboard = () => {
  const [opened, setOpened] = useState(false);

  return (
    <div className="p-2 gap-3 flex flex-col lg:flex-row  bg-gray-100">
      <Sidebar opened={opened} toggle={() => setOpened(!opened)} />

      <div className="flex-1 flex flex-col">
        {/* Mobile hamburger menu button */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setOpened(!opened)}
            className="text-gray-500 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
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
          </button>
        </div>

        <Topbar />

        <div className="p-6 flex-1 h-[83vh] overflow-auto">
          {/* Main content will be added here in future */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
