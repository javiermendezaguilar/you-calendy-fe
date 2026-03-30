import React from "react";
import { Button } from "@mantine/core";
import { Link } from "react-router-dom";

const FooterColumn = ({ title, links }) => {
  const handleScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-[140px] sm:w-auto">
      <h3 className="text-base sm:text-lg font-semibold leading-none tracking-[0.4px] text-[rgba(50,51,52,1)]">
        {title}
      </h3>
      <nav className="flex flex-col mt-3 sm:mt-[18px]">
        {links.map((link, index) => {
          const isInternalLink = link.href && link.href.startsWith("#");

          if (isInternalLink) {
            return (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="text-xs sm:text-sm font-light text-[rgba(50,51,52,1)] mt-2 sm:mt-[10px] first:mt-0 cursor-pointer"
              >
                {link.text}
              </a>
            );
          }

          if (link.href) {
            return (
              <Link
                key={index}
                to={link.href}
                className="text-xs sm:text-sm font-light text-[rgba(50,51,52,1)] mt-2 sm:mt-[10px] first:mt-0 cursor-pointer"
              >
                {link.text}
              </Link>
            );
          }

          return (
            <span
              key={index}
              className="text-xs sm:text-sm font-light text-[rgba(50,51,52,1)] mt-2 sm:mt-[10px] first:mt-0 cursor-default"
            >
              {link.text}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default FooterColumn;
