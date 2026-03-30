import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Burger, Divider, Group, Accordion } from "@mantine/core";
import { FaTools, FaUsers, FaFileInvoice, FaCog, FaQuestionCircle, FaTachometerAlt } from "react-icons/fa";
import { CreditCard, BadgeCheck } from "lucide-react";
import {
  AppointmentIcon,
  BussinessIcon,
  ClientIcon,
  MarketingIcon,
  SelectionIcon,
} from "../icons";
import { FeatureIcon } from "../common/Svgs";
import {
  FaChevronUp,
  FaChevronDown,
  FaCaretRight,
  FaCaretLeft,
} from "react-icons/fa";
import { HeaderLogoLight } from "../../components/common/Svgs";
import { AppointmentHistoryIcon } from "../../components/common/Svgs";
import { ClientsNoteIcon } from "../../components/common/Svgs";
import { SubscriptonManagementIcon, SettingIcon, SecurityAuditingIcon, ProposedInterfacesIcon, SupportIcon } from "../../components/common/Svgs";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const Sidebar = ({ opened, toggle, collapsed, collapseToggle, isAdmin }) => {
  const { pathname } = useLocation();
  const [openItem, setOpenItem] = useState(null);
  const { tc } = useBatchTranslation();

  const handleToggle = (value) => {
    setOpenItem(openItem === value ? null : value);
  };

  const mainMenu = [
    {
      id: 1,
      icon: <AppointmentIcon />,
      label: tc('dashboard'),
      link: "/dashboard",
      type: "route",
    },
    {
      id: 3,
      icon: <ClientIcon />,
      label: tc('clients'),
      link: "/dashboard/clients",
      type: "route",
    },
    {
      id: 4,
      icon: <MarketingIcon />,
      label: tc('marketing'),
      link: "/dashboard/marketing",
      type: "route",
    },
    
    {
      id: 13,
      icon: <ClientsNoteIcon />,
      label: tc('clientsNotes'),
      link: "/dashboard/clients-note",
      type: "route",
    },
    {
      id: 10,
      type: "divider",
    },
    {
      id: 14,
      icon: <CreditCard size={20} color="#fff" />,
      label: tc('purchaseCredits'),
      link: "/dashboard/purchase-credits",
      type: "route",
    },
    {
      id: 15,
      icon: <BadgeCheck size={20} color="#fff" />,
      label: tc('subscriptionStatus'),
      link: "/dashboard/subscription-status",
      type: "route",
    },
    {
      id: 8,
      icon: <BussinessIcon />,
      label: tc('businessSettings'),
      link: "/dashboard/business-setting",
      type: "route",
    },
    {
      id: 12,
      icon: <SupportIcon/>,
      label: tc('support'),
      link: "/dashboard/support",
      type:"route"
    },
    {
      id: 11,
      icon: <FeatureIcon />,
      label: tc('suggestFeature'),
      link: "/dashboard/suggest-feature",
      type: "route",
    },
  ];

const adminMenu = [
  {
    id: 1,
    icon: <FaTachometerAlt />,
    label: tc('dashboard'),
    link: "/admin/dashboard",
    type: "route",
  },

  {
    id: 2,
    icon: <SelectionIcon />,
    label: tc('barberManagement'),
    link: "/admin/barber-management",
    type: "route",
  },
  {
    id: 3,
    icon: <ClientIcon />,
    label: tc('clientManagement'),
    link: "/admin/client-management",
    type: "route",
  },
  {
    id: 12,
    icon: <CreditCard size={20} color="#fff" />,
    label: tc('creditManagement'),
    link: "/admin/credit-management",
    type: "route",
  },
  {
    id: 10,
    type: "divider",
  },
  {
    id: 4,
    icon: <SubscriptonManagementIcon />,
    label: tc('platformSettings'),
    link: "/admin/platform-settings",
    type: "route",
  },
  {
    id: 7,
    icon: <SupportIcon />,
    label: tc('supportAndCommunication'),
    link: "/admin/support-and-communication",
    type: "route",
  },
  {
    id: 8,
    icon: <SecurityAuditingIcon />,
    label: tc('securityAndAuditing'),
    link: "/admin/security-and-auditing",
    type: "route",
  },
  {
    id: 11,
    icon: <ProposedInterfacesIcon />,
    label: tc('proposedInterfaces'),
    link: "/admin/proposed-interfaces",
    type: "route",
  },
  // {
  //   id: 5,
  //   icon: <InvoiceIcon />,
  //   label: "Invoice",
  //   link: "/admin/invoice",
  //   type: "route",
  // },
  {
    id: 6,
    icon: <SettingIcon />,
    label: tc('setting'),
    link: "/admin/setting",
    type: "route",
  },
];

  const menu = isAdmin ? adminMenu : mainMenu;

  return (
    <aside
      className={`h-[98vh] bg-[#222]  lg:sticky top-0 left-0 z-40 
                   transition-transform duration-700 fixed
                  ${opened
          ? "translate-x-2 translate-y-2"
          : "-translate-x-[700px] translate-y-2 lg:translate-y-0 lg:translate-x-0"
        } ${collapsed
          // On mobile we always keep full width; collapse only affects lg screens
          ? "w-64 lg:w-20 transition-all duration-700"
          : " w-64 lg:w-72 transition-all duration-700"
        }`}
    >
      {/* Collapse toggle hidden on mobile so only the Burger (cross) icon controls sidebar there */}
      <div
        onClick={collapseToggle}
        className="hidden lg:flex absolute cursor-pointer bg-white p-1.5 rounded-full top-6 -right-4 drop-shadow-2xl"
      >
        {collapsed ? <FaCaretRight /> : <FaCaretLeft />}
      </div>
      <div className="h-full flex flex-col">
        <div className="lg:hidden absolute right-4 top-4">
          <Burger
            color="#fff"
            opened={opened}
            onClick={toggle}
            aria-label="Toggle navigation"
            data-i18n-skip="true"
          />
        </div>

        <div
          className={`flex-col px-5  bg-[#222] ${collapsed ? "py-10" : "py-4"
            }`}
        >
          <div className={`${collapsed ? "hidden" : "flex"}`}>
            <Link to="/dashboard">
              <HeaderLogoLight />
            </Link>
          </div>
        </div>

        <Divider className="my-2" color="#333" />

        <nav className="flex-1 overflow-y-auto">
          {menu.map((item, i) => {
            if (item?.type === "divider") {
              return <Divider key={i} className="my-2" color="#333" />;
            } else if (item?.type === "linkWithDropdown") {
              const isItemActive = pathname === item.link;
              const isSubItemActive = item.items?.some(
                (subItem) => pathname === subItem.link
              );
              const isActive = isItemActive || isSubItemActive;

              return (
                <div key={i} className={`${collapsed ? "hidden" : "block"}`}>
                  <Accordion 
                    value={openItem}
                    onChange={handleToggle}
                    chevronPosition="right" 
                    styles={{
                      control: {
                        padding: 0,
                        height: '50px',
                      },
                    }}
                    chevron={null}
                  >
                    <Accordion.Item value={item.label} className="!border-0">
                      <div className="flex">
                        <Accordion.Control 
                          className={`!p-0 !flex-1 ${isActive ? "!bg-[#93B45A]" : "!bg-[#222] !hover:bg-[#333]"}`}
                        >
                          <Link
                            to={item.link}
                            className={`flex items-center px-5 py-3.5 text-white font-normal`}
                          >
                            <Group spacing={10}>
                              <span className="text-lg">{item.icon}</span>
                              <span className="text-sm">{item.label}</span>
                            </Group>
                          </Link>
                        </Accordion.Control>
                        <button
                          onClick={() => handleToggle(item.label)}
                          className={`w-10 flex items-center justify-center py-3.5 text-white
                            ${isActive
                              ? "bg-[#93B45A]"
                              : "bg-[#222]"
                            }
                          `}
                        >
                          {openItem === item.label ? (
                            <FaChevronUp size={12} />
                          ) : (
                            <FaChevronDown size={12} />
                          )}
                        </button>
                      </div>
                      <Accordion.Panel className="!p-0 !bg-[#222]">
                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-[#444] z-10"></div>

                          {item?.items?.map((subItem, j) => {
                            const isSubActive = pathname === subItem.link;

                            return (
                              <Link key={`${i}-${j}`} to={subItem.link}>
                                <div
                                  className={`
                                    flex items-center pl-8 py-3 text-white relative
                                    ${isSubActive
                                      ? "bg-[#93B45A26] font-medium"
                                      : "hover:bg-[#333] font-normal"
                                    }
                                  `}
                                >
                                  <div className="absolute left-2 w-2 h-2 rounded-full bg-[#93B45A] z-10"></div>
                                  <span className="text-sm">{subItem.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </div>
              );
            } else {
              const isActive = pathname === item.link;

              return (
                <Link key={i} to={item.link}>
                  <div
                    className={`
                      flex items-center gap-3 px-5 py-3.5 text-white
                      ${isActive ? "bg-[#93B45A]" : "hover:bg-[#333]"}
                      ${collapsed ? "justify-center" : "justify-start"}
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span
                      className={`text-sm ${collapsed ? "hidden" : "flex"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            }
          })}
        </nav>
        

      </div>
    </aside>
  );
};

export default Sidebar;
