"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { PT_Serif } from "next/font/google";

const ptSerif = PT_Serif({ subsets: ["latin"], weight: "700" });

// Dynamically import the components for the other tabs:
const TeamComponent = dynamic(() => import("../team/page"), { ssr: false });
const WeekComponent = dynamic(() => import("../week/page"), { ssr: false });
const PeopleComponent = dynamic(() => import("../orginization/page"), { ssr: false });
// Dynamically import the Schedule Builder component
const ScheduleBuilderComponent = dynamic(() => import("../builder/page"), { ssr: false });

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
      whileHover={{ width: 160 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <span className="ml-6 text-base text-white font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {label}
      </span>
    </motion.div>
  );
};

const SideMenu: React.FC = () => {
  return (
    <div className="fixed left-4 top-4 flex flex-col gap-4 z-20 p-2">
      {/*<SideMenuItem label="Dashboard" bgColor="bg-orange-400" />
      <SideMenuItem label="Time Off" bgColor="bg-purple-400" />
      <SideMenuItem label="My Info" bgColor="bg-green-400" />
      <SideMenuItem label="Schedule Builder" bgColor="bg-red-400" />
      <SideMenuItem label="My Team" bgColor="bg-yellow-400" />
      */}
    </div>
  );
};

/* -----------------------------------------------------
   DASHBOARD PAGE
----------------------------------------------------- */
export default function Dashboard() {
  // =============================
  // Tab state & Session
  // Updated to include "scheduleEditor" in the union type
  // =============================
  const [activeTab, setActiveTab] = useState<"mySchedule" | "viewDay" | "viewWeek" | "people" | "scheduleEditor">(
    "mySchedule"
  );
  const { data: session, status } = useSession();
  const userName = session?.user?.name || "Employee";

  // =============================
  // State for Employee's Shifts Data
  // =============================
  const [employeeData, setEmployeeData] = useState<{
    name: string;
    shifts: { startTime: string; endTime: string }[];
  } | null>(null);

  useEffect(() => {
    async function fetchEmployeeShifts() {
      try {
        const res = await fetch("/api/shifts");
        const data = await res.json();
        // Find the shifts for the current user based on their name
        const employee = data.employees.find(
          (e: { name: string }) => e.name === userName
        );
        setEmployeeData(employee);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    }
    if (userName !== "Employee") {
      fetchEmployeeShifts();
    }
  }, [userName]);

  // =============================
  // State for Company Name
  // =============================
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    async function fetchCompanyName() {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        setCompanyName(data.name);
      } catch (error) {
        console.error("Error fetching company name:", error);
      }
    }
    fetchCompanyName();
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  // =============================
  // MY SCHEDULE TAB
  // =============================
  function MyScheduleTab() {
    if (!employeeData) {
      return (
        <div className="w-full max-w-5xl text-center">
          <p>Loading your schedule...</p>
        </div>
      );
    }

    const today = new Date();
    const todaysShift = employeeData.shifts.find((shift) => {
      const shiftStart = new Date(shift.startTime);
      return shiftStart.toDateString() === today.toDateString();
    });

    const currentShift = todaysShift
      ? `${format(new Date(todaysShift.startTime), "h:mm a")} - ${format(
          new Date(todaysShift.endTime),
          "h:mm a"
        )}`
      : "Off";

    const upcomingSchedule = employeeData.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.startTime);
        return (
          shiftDate > today &&
          shiftDate <= new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 3
          )
        );
      })
      .map((shift) => ({
        day: format(new Date(shift.startTime), "EEEE"),
        shift: `${format(new Date(shift.startTime), "h:mm a")} - ${format(
          new Date(shift.endTime),
          "h:mm a"
        )}`,
      }));

    const monthlyEvents = employeeData.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.startTime);
        return (
          shiftDate.getMonth() === today.getMonth() &&
          shiftDate.getFullYear() === today.getFullYear()
        );
      })
      .map((shift) => ({
        title: `${format(new Date(shift.startTime), "h:mm a")} - ${format(
          new Date(shift.endTime),
          "h:mm a"
        )}`,
        start: new Date(shift.startTime),
        end: new Date(shift.endTime),
      }));

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 z-10 relative"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {userName}</h1>
          <p className="text-gray-600 text-xl">Here's a quick look at your schedule</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Your Current Shift</h2>
            <p className="text-gray-700 text-lg">{currentShift}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Time Off Balances</h2>
            <div className="text-gray-700 text-lg space-y-2">
              <p>Sick Time: 24 hrs</p>
              <p>Vacation Time: 40 hrs</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Upcoming Schedule</h2>
            {upcomingSchedule.length > 0 ? (
              <ul className="text-gray-700 text-lg space-y-2">
                {upcomingSchedule.map((slot, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{slot.day}:</span>
                    <span>{slot.shift}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming shifts</p>
            )}
          </motion.div>
        </div>

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
  // VIEW DAY TAB
  // =============================
  function ViewDayTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl z-10 relative"
      >
        <TeamComponent />
      </motion.div>
    );
  }

  // =============================
  // VIEW WEEK TAB
  // =============================
  function ViewWeekTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-10xl z-10 relative"
      >
        <WeekComponent />
      </motion.div>
    );
  }

  // =============================
  // PEOPLE TAB
  // =============================
  function PeopleTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-10xl z-10 relative"
      >
        <PeopleComponent />
      </motion.div>
    );
  }

  // =============================
  // SCHEDULE EDITOR TAB
  // =============================
  function ScheduleEditorTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-10xl z-10 relative"
      >
        <ScheduleBuilderComponent />
      </motion.div>
    );
  }

  // =============================
  // Render
  // =============================
  return (
    <div className="relative bg-[#F9F7F4] min-h-screen overflow-hidden">
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

      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <SideMenu />

      <main className="flex flex-col items-center justify-start p-6 z-10 relative">
        {/* Company Name Display */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            {companyName || "Loading Company..."}
          </h1>
        </div>

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
            onClick={() => setActiveTab("viewDay")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "viewDay"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Day
          </button>
          <button
            onClick={() => setActiveTab("viewWeek")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "viewWeek"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            View Week
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "people"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            People
          </button>
          {/* New Schedule Editor Tab Button */}
          <button
            onClick={() => setActiveTab("scheduleEditor")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${
              activeTab === "scheduleEditor"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Schedule Editor
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "mySchedule" && <MyScheduleTab />}
        {activeTab === "viewDay" && <ViewDayTab />}
        {activeTab === "viewWeek" && <ViewWeekTab />}
        {activeTab === "people" && <PeopleTab />}
        {activeTab === "scheduleEditor" && <ScheduleEditorTab />}
      </main>
    </div>
  );
}