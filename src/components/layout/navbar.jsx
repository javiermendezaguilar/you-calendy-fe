import React from "react";
import { HeaderLogoLight } from "../common/Svgs";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";

const Navbar = () => {
  const scrollToTop = () => {
    const scrollStep = -window.scrollY / 15;
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 10);
  };

  return (
    <div className="fixed w-screen border-b border-cyan-400/50 bg-[#022a52] flex justify-between items-center p-4 lg:px-8 shadow-md z-50">
      <div onClick={scrollToTop} className="cursor-pointer">
        <HeaderLogoLight />
      </div>
      <div className="flex gap-4 items-center">
        <a href="#advantages" className="text-slate-50 hidden lg:block">
          Advantages
        </a>
        <a href="#features" className="text-slate-50 hidden lg:block">
          Features
        </a>
        <Link to="/login" className="text-slate-50">
          <Button
            variant="outline"
            color="white"
            className="!px-4 !py-2 !text-sm lg:!px-6 lg:!py-2 lg:!text-base"
          >
            Log in
          </Button>
        </Link>
        <Button
          component={Link}
          to="/registration"
          color="#556B2F"
          className="!px-4 !py-2 !text-sm lg:!px-6 lg:!py-2 lg:!text-base"
        >
          <span className="hidden lg:inline">Sign Up Free</span>
          <span className="lg:hidden">Sign Up</span>
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
