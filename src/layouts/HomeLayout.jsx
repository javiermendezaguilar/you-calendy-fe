import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/navbar";

const HomeLayout = () => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div>
        <Navbar />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
