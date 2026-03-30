import React, { useState } from "react";
import AppointmentChart from "../../components/barber/appointment/AppointmentChart";
import Overview from "../../components/barber/appointment/Overview";
import AppointmentsCalender from "../../components/barber/appointment/AppointmentsCalender";
import BatchTranslationLoader from "../../components/barber/BatchTranslationLoader";
import dayjs from "dayjs";

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
          <AppointmentsCalender />
        </div>
      </div>
    </BatchTranslationLoader>
  );
};

export default Appointment;
