import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import AppointmentChart from "../../components/barber/appointment/AppointmentChart";
import Overview from "../../components/barber/appointment/Overview";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import dayjs from "dayjs";

const AppointmentsCalender = lazy(() =>
  import("../../components/barber/appointment/AppointmentsCalender")
);

const DeferredSection = ({ children, minHeight = 640, rootMargin = "250px 0px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

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
      {isVisible ? children : null}
    </div>
  );
};

const Appointment = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("month").toDate());
  const [selectedStaffId, setSelectedStaffId] = useState("");

  return (
    <BatchTranslationLoader>
      <div className="h-[83vh] overflow-auto">
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white rounded-2xl">
          <div className="lg:col-span-2 bg-slate-50 p-2 rounded-xl">
            <AppointmentChart 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
          </div>
          <div>
            <Overview 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
              staffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl mt-4">
          <DeferredSection>
            <Suspense fallback={null}>
              <AppointmentsCalender />
            </Suspense>
          </DeferredSection>
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default Appointment;
