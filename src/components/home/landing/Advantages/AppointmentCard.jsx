import { useState } from "react";
import { Button } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import dayjs from "dayjs";

const AppointmentCard = () => {
  const [activeTab, setActiveTab] = useState("date");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState(["11:00", "12:00", "01:00"]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Helper to generate time slots with 1 hour gap, starting from 1:00 after right rider
  const generateTimeSlots = (startHour = 11, count = 3) => {
    let slots = [];
    for (let i = 0; i < count; i++) {
      let hour = (startHour + i) % 24;
      let displayHour = hour > 12 ? hour - 12 : hour;
      let ampm = hour >= 12 ? "PM" : "AM";
      slots.push(`${displayHour === 0 ? 12 : displayHour}:00`);
    }
    return slots;
  };

  // Left/Right rider handlers
  const handleLeft = () => {
    // Move time slots 1 hour back
    let first = parseInt(timeSlots[0]);
    let newStart = first - 1 < 0 ? 23 : first - 1;
    setTimeSlots(generateTimeSlots(newStart, 3));
  };
  const handleRight = () => {
    // Move time slots 1 hour forward
    let last = parseInt(timeSlots[timeSlots.length - 1]);
    let newStart = last + 1 > 23 ? 0 : last + 1;
    setTimeSlots(generateTimeSlots(newStart, 3));
  };

  // Date change handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setTimeSlots(generateTimeSlots(11, 3)); // Reset to default slots on date change
    setSelectedTime("12:00");
  };

  return (
    <div className="md:w-[40%] w-full bg-white shadow-[5.027px_42px_102.296px_0px_rgba(167,186,201,0.32)] rounded-2xl border-white mt-8 md:mt-0 p-5 h-full">
      <div className="flex flex-col gap-5 h-full">
        <Button
          leftSection={<Calendar size={18} />}
          className="!bg-black !text-white !font-medium !hover:bg-gray-800 !px-4 !py-2 !h-auto !w-max"
          radius="md"
          mb={20}
          onClick={() => setShowDatePicker((prev) => !prev)}
        >
          Select Date
        </Button>
        {showDatePicker && (
          <DatePickerInput
            value={selectedDate}
            onChange={handleDateChange}
            className="mb-2"
            popoverProps={{ withinPortal: true }}
          />
        )}
        <div className="flex gap-2 bg-[#F4F4F4] p-1 w-4/5 rounded-md">
          <Button
            onClick={() => setActiveTab("date")}
            className={`flex-1 text-sm font-medium ${
              activeTab === "date"
                ? "!bg-black !text-white"
                : "!text-gray-500 !bg-transparent"
            } !hover:bg-gray-800 !hover:text-white !transition-all !duration-300`}
            radius="md"
          >
            Date
          </Button>
          <Button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 text-sm font-medium ${
              activeTab === "notes"
                ? "!bg-black !text-white"
                : "!text-gray-500 !bg-transparent"
            } !hover:bg-gray-800 !hover:text-white !transition-all !duration-300`}
            radius="md"
          >
            Notes & Info
          </Button>
          <Button
            onClick={() => setActiveTab("evening")}
            className={`flex-1 text-sm font-medium ${
              activeTab === "evening"
                ? "!bg-black !text-white"
                : "!text-gray-500 !bg-transparent"
            } !hover:bg-gray-800 !hover:text-white !transition-all !duration-300`}
            radius="md"
          >
            Evening
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button
            className="!p-2 !bg-white !text-gray-400 !border-0"
            radius="full"
            onClick={handleLeft}
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`text-sm font-medium !px-6 !py-2 !h-auto ${
                  selectedTime === time
                    ? "!bg-[#7d9a4b] !text-white"
                    : "!bg-white !text-black !border !border-gray-200"
                }`}
                radius="lg"
              >
                {time}
              </Button>
            ))}
          </div>
          <Button
            className="!p-2 !bg-white !text-gray-400 !border-0"
            radius="full"
            onClick={handleRight}
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        <div className="bg-[#F7F7F8] border border-[#E6E8EC] rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-[#343a40]">
                Gentleman's Cut
              </h3>
              <p className="text-xs text-gray-500">
                Classic or modern cut + hairstyle
              </p>
            </div>
            <div className="text-right">
              <span className="block font-semibold text-lg text-[#343a40]">
                $10.00
              </span>
              <span className="text-xs text-gray-500">15:00 : 16:00</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
            <span className="text-[#343a40]">
              Employee: <span className="font-semibold">Any</span>
            </span>
            <Button
              className="!px-4 !py-1 !rounded-lg !border !border-gray-300 !bg-white !text-black !font-medium !text-xs !h-auto"
            >
              Change
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-auto">
          <Button
            leftSection={<Plus size={16} />}
            className="!flex !items-center !gap-2 !border !border-black !rounded-lg !px-5 !py-2 !font-medium !text-sm !text-black !bg-white !w-max !h-auto"
          >
            Add Another Service
          </Button>
          <div className="text-right ml-4">
            <div className="text-lg font-bold">
              Total: <span className="text-black">$15.00</span>{" "}
              <span className="text-xs font-normal text-gray-500">USD</span>
            </div>
            <span className="block text-xs text-gray-500">1h</span>
          </div>
        </div>

        <Button
          className="w-full !mt-6 !bg-[#343a40] !text-white !rounded-lg !font-semibold !text-md hover:!bg-black"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AppointmentCard;