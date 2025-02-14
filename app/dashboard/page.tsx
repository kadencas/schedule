"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { useSession, signOut } from "next-auth/react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { PT_Serif } from "next/font/google";

const ptSerif = PT_Serif({ subsets: ["latin"], weight: "700" });



// Set up the date-fns localizer for React Big Calendar
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function parseTime(timeString: string) {
  const [time, meridiem] = timeString.split(/\s/);
  if (!time) return 0;
  let [hourStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  if (meridiem?.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (meridiem?.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }
  return hour;
}

// "9:00 AM - 5:00 PM" => { start: 9, end: 17 } or null if "Off"
function parseShift(shiftString: string) {
  if (!shiftString || shiftString.toLowerCase() === "off") {
    return null;
  }
  const [startTime, endTime] = shiftString.split("-");
  const start = parseTime(startTime.trim());
  const end = parseTime(endTime.trim());
  return { start, end };
}

// Build RBC event objects from a hardcoded { date: shift } map
function buildEventsFromShifts(shiftsObj: Record<string, string>) {
  const events = [];
  for (const [dateStr, shiftStr] of Object.entries(shiftsObj)) {
    if (!shiftStr || shiftStr.toLowerCase() === "off") continue;
    const parsedShift = parseShift(shiftStr);
    if (!parsedShift) continue;
    const [year, month, day] = dateStr.split("-").map(Number);
    const eventStart = new Date(year, month - 1, day, parsedShift.start);
    const eventEnd = new Date(year, month - 1, day, parsedShift.end);
    events.push({
      title: shiftStr,
      start: eventStart,
      end: eventEnd,
    });
  }
  return events;
}

/* -----------------------------------------------------
   LEFT SIDE MENU COMPONENTS
----------------------------------------------------- */
type SideMenuItemProps = {
  label: string;
  bgColor: string;
};

const SideMenuItem: React.FC<SideMenuItemProps> = ({ label, bgColor }) => {
  return (
    <motion.div
      className={`group flex items-center justify-center rounded-full cursor-pointer overflow-hidden ${bgColor}`}
      initial={{ width: 50, height: 40 }}
      whileHover={{ width: 250 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <span className="ml-6 text-2xl text-white font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {label}
      </span>
    </motion.div>
  );
};

const SideMenu: React.FC = () => {
  return (
    <div className="fixed left-4 top-4 flex flex-col gap-4 z-20 p-2">
      <SideMenuItem label="Dashboard" bgColor="bg-orange-400" />
      <SideMenuItem label="Time Off" bgColor="bg-purple-400" />
      <SideMenuItem label="My Info" bgColor="bg-green-400" />
      <SideMenuItem label="Schedule Builder" bgColor="bg-red-400" />
      <SideMenuItem label="My Team" bgColor="bg-yellow-400" />
    </div>
  );
};

/* -----------------------------------------------------
   DASHBOARD PAGE
----------------------------------------------------- */
export default function Dashboard() {
  // =============================
  // Tab state
  // =============================
  const [activeTab, setActiveTab] = useState<"mySchedule" | "viewOthers">("mySchedule");
  const { data: session, status } = useSession();
  const userName = session?.user?.name || "Employee";

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  // =============================
  // Hardcoded data for demonstration
  // =============================
  const currentShift = "9:00 AM - 5:00 PM";
  const sickTime = "24 hrs";
  const vacationTime = "40 hrs";
  const upcomingSchedule = [
    { day: "Thursday", shift: "9:00 AM - 5:00 PM" },
    { day: "Friday", shift: "1:00 PM - 9:00 PM" },
    { day: "Saturday", shift: "Off" },
  ];

  const monthlyShifts: Record<string, string> = {
    "2025-02-01": "Off",
    "2025-02-02": "9:00 AM - 5:00 PM",
    "2025-02-03": "8:00 AM - 4:00 PM",
    "2025-02-04": "Off",
    "2025-02-05": "9:00 AM - 5:00 PM",
    "2025-02-06": "1:00 PM - 6:00 PM",
    "2025-02-07": "Off",
  };
  const monthlyEvents = buildEventsFromShifts(monthlyShifts);

  const coworkers = [
    { name: "Alice", shift: "8:00 AM - 4:00 PM" },
    { name: "John", shift: "10:00 AM - 6:00 PM" },
    { name: "Maria", shift: "2:00 AM - 10:00 PM" },
  ];

  // =============================
  // MY SCHEDULE TAB
  // =============================
  function MyScheduleTab() {
    const parsedDailyShift = parseShift(currentShift);
    let dayLeftPercent = 0;
    let dayWidthPercent = 0;
    if (parsedDailyShift) {
      const { start, end } = parsedDailyShift;
      dayLeftPercent = (start / 24) * 100;
      dayWidthPercent = ((end - start) / 24) * 100;
    }
    return (
      <>
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 z-10 relative"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {userName}
          </h1>
          <p className="text-gray-600 text-xl">
            Here’s a quick look at your schedule
          </p>
        </motion.div>

        {/* Grid Container for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10 relative">
          {/* Card 1: Current Shift */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Your Current Shift</h2>
            <p className="text-gray-700 text-lg">{currentShift}</p>
          </motion.div>

          {/* Card 2: Time Off Balances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Time Off Balances</h2>
            <div className="text-gray-700 text-lg space-y-2">
              <p>Sick Time: {sickTime}</p>
              <p>Vacation Time: {vacationTime}</p>
            </div>
          </motion.div>

          {/* Card 3: Upcoming Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Upcoming Schedule</h2>
            <ul className="text-gray-700 text-lg space-y-2">
              {upcomingSchedule.map((slot, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{slot.day}:</span>
                  <span>{slot.shift}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* This Month's Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 w-full max-w-5xl bg-white rounded-2xl shadow p-6 z-10 relative"
        >
          <h2 className="text-xl font-semibold mb-4">This Month</h2>
          <Calendar
            localizer={localizer}
            events={monthlyEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            popup
          />
        </motion.div>
      </>
    );
  }

  // =============================
  // VIEW OTHERS TAB (Hardcoded)
  // =============================
  function ViewOthersTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow p-6 z-10 relative"
      >
        <h2 className="text-2xl font-semibold mb-4">Others&apos; Schedules</h2>
        <ul className="space-y-3">
          {coworkers.map((cw, idx) => (
            <li key={idx} className="flex justify-between text-lg text-gray-700">
              <span className="font-medium">{cw.name}</span>
              <span>{cw.shift}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  // =============================
  // Render
  // =============================
  return (
    <div className="relative bg-[#F9F7F4] min-h-screen overflow-hidden">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-64 h-64 bg-blue-200 rounded-full filter blur-3xl"
        style={{ top: "-100px", left: "-100px" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-green-200 rounded-full filter blur-3xl"
        style={{ bottom: "-50px", right: "-50px" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fixed Sign Out Button at Top Right */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Left Side Menu */}
      <SideMenu />

      {/* Main Content remains centered */}
      <main className="flex flex-col items-center justify-start p-6 z-10 relative">
        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("mySchedule")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "mySchedule"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab("viewOthers")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "viewOthers"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Others
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "mySchedule" && <MyScheduleTab />}
        {activeTab === "viewOthers" && <ViewOthersTab />}
      </main>
    </div>
  );
}
