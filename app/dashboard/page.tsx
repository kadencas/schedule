"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { useSession, signOut } from "next-auth/react";
import "react-big-calendar/lib/css/react-big-calendar.css";

// import tabs
import MyScheduleTab from "../components/DashboardTabs/MyScheduleTab";
import ViewDayTab from "../components/DashboardTabs/ViewDayTab";
import ViewWeekTab from "../components/DashboardTabs/ViewWeekTab";
import ViewPeopleTab from "../components/DashboardTabs/ViewPeopleTab"
import ViewScheduleBuilder from "../components/DashboardTabs/ViewScheduleBuilder"

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

export default function Dashboard() {
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
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${activeTab === "mySchedule"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab("viewDay")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${activeTab === "viewDay"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            View Day
          </button>
          <button
            onClick={() => setActiveTab("viewWeek")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${activeTab === "viewWeek"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            View Week
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${activeTab === "people"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab("scheduleEditor")}
            className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ${activeTab === "scheduleEditor"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Schedule Editor
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "mySchedule" && (<MyScheduleTab employeeData={employeeData} userName={userName} localizer={localizer} />)}
        {activeTab === "viewDay" && <ViewDayTab />}
        {activeTab === "viewWeek" && <ViewWeekTab />}
        {activeTab === "people" && <ViewPeopleTab />}
        {activeTab === "scheduleEditor" && <ViewScheduleBuilder />}
      </main>
    </div>
  );
}