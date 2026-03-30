import FooterColumn from "./FooterColumn";
import { FooterFacebookIcon, FooterTwitterIcon, FooterInstagramIcon, FooterLinkedinIcon, FooterTiktokIcon } from "../../common/Svgs";
import { HeaderLogo } from "../../common/Svgs";
import { motion } from "framer-motion";
import { useBatchTranslation } from "../../../contexts/BatchTranslationContext";

const LogoSection = ({ tc }) => (
  <div className="flex flex-col">
    <div className="w-[150px] max-w-full text-[rgba(50,51,52,1)] uppercase leading-none">
      <HeaderLogo />
    </div>
    <p className="mt-4 text-sm text-gray-600 normal-case w-64">
      {tc('youCalendyDescription')}
    </p>
  </div>
);

const SocialIcons = ({ socialIcons }) => (
  <div className="flex w-full items-center gap-3 sm:gap-4 mt-4 sm:mt-5 max-md:mt-6">
    {socialIcons.map((social, index) => (
      <a
        href={social.href}
        key={index} 
        className="transition-transform hover:transform hover:scale-110 cursor-pointer"
        aria-label={`${social.alt} icon`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <social.icon />
      </a>
    ))}
  </div>
);

const FooterLinks = ({ footerSections }) => (
  <>
    {Object.entries(footerSections).map(([title, links]) => (
      <FooterColumn key={title} title={title} links={links} />
    ))}
  </>
);

const CopyrightSection = ({ tc }) => (
  <div className="bg-[rgba(50,51,52,1)] flex w-full flex-col items-center text-sm sm:text-base text-white font-light justify-center py-3 sm:py-4 px-3 md:px-6 lg:px-16 max-md:max-w-full max-md:px-4">
    <div className="flex w-full max-w-[1200px] items-center gap-[20px] sm:gap-[30px_70px] justify-between flex-wrap max-md:max-w-full">
      <p className="self-stretch my-auto max-md:max-w-full">
        © {new Date().getFullYear()} {tc('copyrightAllRightsReserved')}{" "}
        <span className="font-medium">You Calendy</span>
      </p>
      <p className="self-stretch my-auto text-xs sm:text-sm">
        {tc('designDevelopedBy')}{" "}
        <span className="font-medium">Dotclickllc</span>
      </p>
    </div>
  </div>
);

const Footer = () => {
  const { tc } = useBatchTranslation();
  
  const socialIcons = [
    { icon: FooterInstagramIcon, alt: "Instagram", href: "#" },
    { icon: FooterFacebookIcon, alt: "Facebook", href: "#" },
    { icon: FooterTiktokIcon, alt: "Tiktok", href: "#" },
    { icon: FooterTwitterIcon, alt: "Twitter", href: "#" },
    { icon: FooterLinkedinIcon, alt: "LinkedIn", href: "#" }
  ];

  const footerSections = {
    [tc('quickLinks')]: [
      { text: tc('advantages'), href: "#advantages" },
      { text: tc('features'), href: "#features" },
    ],
    [tc('support')]: [
      { text: tc('helpCenter'), href: "/help-center" },
      { text: tc('termsAndConditions'), href: "/terms-and-conditions" },
      { text: tc('privacyPolicy'), href: "/privacy-policy" },
    ],
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="bg-[#FFFFFF] border flex w-full flex-col items-center py-8 sm:py-10 px-3 md:px-6 lg:px-16 border-t-[#D6D6D6] border-solid max-md:max-w-full max-md:pb-[70px] max-md:px-4">
        <div className="flex flex-col sm:flex-row mb-0 sm:mb-[-16px] w-full max-w-[1200px] gap-8 flex-wrap justify-between max-md:max-w-full max-md:mb-2">
          <LogoSection tc={tc} />
          <div className="flex gap-x-16">
            <FooterLinks footerSections={footerSections} />
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold leading-none tracking-[0.4px] text-[rgba(50,51,52,1)]">
                {tc('followUs')}
              </h3>
              <SocialIcons socialIcons={socialIcons} />
            </div>
          </div>
        </div>
      </div>
      <CopyrightSection tc={tc} />
    </motion.footer>
  );
};

export default Footer;
