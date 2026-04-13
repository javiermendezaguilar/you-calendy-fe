import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import HeroSection from "../../components/home/landing/heroSection";
import LazyFooter from "../../components/home/landing/LazyFooter";
const Benefit = lazy(() => import("../../components/home/landing/Benefit"));
const AdvantagesSection = lazy(() => import("../../components/home/landing/Advantages/AdvantagesSection"));
const Booking = lazy(() => import("../../components/home/landing/Booking"));
const AppointmentHistorySection = lazy(() => import("../../components/home/landing/BenefitSection/AppointmentHistorySection"));
const BenefitSection = lazy(() => import("../../components/home/landing/BenefitSection/BenefitSection"));
const MarketingHero = lazy(() => import("../../components/home/landing/Marketing/MarketingHero"));
const MessageComposer = lazy(() => import("../../components/home/landing/Marketing/MessageComposer"));
const ClientSection = lazy(() => import("../../components/home/landing/ClientPage/ClientSection"));

const DeferredSection = ({ children, minHeight = 320, rootMargin = "300px 0px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {isVisible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};

const LandingPage = () => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, message: "" });
  const hideTimerRef = useRef(null);

  const showLoginTooltip = (x, y) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setTooltip({ visible: true, x, y, message: "Login to use this features" });
    hideTimerRef.current = setTimeout(() => {
      setTooltip((t) => ({ ...t, visible: false }));
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const interactiveSelector = 'button, [role="button"], input, select, textarea, [contenteditable="true"]';

  const handleClickCapture = (event) => {
    const target = event.target;
    if (!(target && target.closest)) return;
    const interactive = target.closest(interactiveSelector);
    if (!interactive) return;
    if (interactive.closest('[data-allow-without-login]')) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = interactive.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top; // show above element
    showLoginTooltip(x, y);
  };

  const handleFocusCapture = (event) => {
    const target = event.target;
    if (!(target && target.closest)) return;
    const interactive = target.closest(interactiveSelector);
    if (!interactive) return;
    if (interactive.closest('[data-allow-without-login]')) return;
    // Prevent typing/focus interactions
    if (typeof interactive.blur === "function") interactive.blur();
    const rect = interactive.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    showLoginTooltip(x, y);
  };

  const handleKeyDownCapture = (event) => {
    const target = event.target;
    if (!(target && target.closest)) return;
    const interactive = target.closest(interactiveSelector);
    if (!interactive) return;
    if (interactive.closest('[data-allow-without-login]')) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      const rect = interactive.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      showLoginTooltip(x, y);
    }
  };

  return (
    <div
      onClickCapture={handleClickCapture}
      onFocusCapture={handleFocusCapture}
      onKeyDownCapture={handleKeyDownCapture}
      className="overflow-x-hidden"
    >
      <HeroSection />
      <DeferredSection minHeight={720} rootMargin="150px 0px">
        <div id="features">
          <Benefit />
        </div>
      </DeferredSection>
      <DeferredSection minHeight={560} rootMargin="150px 0px">
        <div id="advantages">
          <AdvantagesSection />
        </div>
      </DeferredSection>
      <DeferredSection minHeight={900}>
        <main className="flex flex-col items-center w-full min-h-screen bg-white mt-20 p-10 max-md:p-[30px] max-sm:p-5">
          <div className="flex items-center w-[90%] max-md:w-full max-md:flex-col">
            <AppointmentHistorySection />
            <BenefitSection />
          </div>
        </main>
      </DeferredSection>
      <DeferredSection minHeight={900}>
        <main className="flex flex-col min-h-screen bg-white px-10">
          <div className="flex max-md:flex-col w-[70%] mx-14 max-md:w-full max-md:mx-0">
            <ClientSection />
          </div>
        </main>
      </DeferredSection>
      <DeferredSection minHeight={900}>
        <main className="flex flex-col items-center w-full min-h-screen bg-white px-10">
          <div className="flex w-full max-w-[90%] max-md:max-w-full max-md:flex-col">
            <MessageComposer />
            <MarketingHero />
          </div>
        </main>
      </DeferredSection>
      <DeferredSection minHeight={480}>
        <Booking />
      </DeferredSection>
      <DeferredSection minHeight={240}>
        <LazyFooter />
      </DeferredSection>
      {tooltip.visible && (
        <div
          style={{ position: "fixed", left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -120%)", pointerEvents: "none", zIndex: 9999 }}
          className="relative bg-blue-50 text-blue-900 text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap ring-1 ring-blue-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold">i</span>
            <span>{tooltip.message}</span>
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-[2px] h-2 w-2 rotate-45 bg-blue-50"></div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
