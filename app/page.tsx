"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

// =============================
// Utility functions
// =============================
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

export default function Dashboard() {
  // =============================
  // Tab state
  // =============================
  const [activeTab, setActiveTab] = useState<"mySchedule" | "viewOthers">("mySchedule");

  // =============================
  // Only the user's name is fetched from the server
  // =============================
  const [userName, setUserName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  // =============================
  // Hardcoded data for demonstration
  // =============================

  // 1) Shift info
  const currentShift = "9:00 AM - 5:00 PM";
  const sickTime = "24 hrs";
  const vacationTime = "40 hrs";
  const upcomingSchedule = [
    { day: "Thursday", shift: "9:00 AM - 5:00 PM" },
    { day: "Friday", shift: "1:00 PM - 9:00 PM" },
    { day: "Saturday", shift: "Off" },
  ];

  // 2) Hardcoded monthly shifts
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

  // 3) Hardcoded coworkers for "View Others"
  const coworkers = [
    { name: "Alice", shift: "8:00 AM - 4:00 PM" },
    { name: "John", shift: "10:00 AM - 6:00 PM" },
    { name: "Maria", shift: "2:00 PM - 10:00 PM" },
  ];

  // =============================
  // Fetch the user's name on mount
  // =============================
  useEffect(() => {
    async function fetchUserName() {
      try {
        const response = await fetch("/api/userSchedule"); 
        const data = await response.json();
        setUserName(data.name || "Employee");
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("Error");
      } finally {
        setLoading(false);
      }
    }

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading user name...</p>
      </main>
    );
  }

  // =============================
  // MY SCHEDULE TAB
  // =============================
  function MyScheduleTab() {
    // For the daily timeline bar
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
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {userName}
          </h1>
          <p className="text-gray-600 text-xl">
            Here’s a quick look at your schedule
          </p>
        </motion.div>

        {/* Grid Container for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1: Current Shift */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center"
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

        {/* Day Timeline Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 w-full max-w-5xl bg-white rounded-2xl shadow p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Today’s Timeline</h2>
          <div className="relative w-full h-6 bg-gray-200 rounded-md">
            {/* Green bar representing shift */}
            {parsedDailyShift && (
              <div
                className="absolute top-0 bottom-0 bg-green-500 rounded-md"
                style={{
                  left: `${dayLeftPercent}%`,
                  width: `${dayWidthPercent}%`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>12:00 AM</span>
            <span>12:00 PM</span>
            <span>11:59 PM</span>
          </div>
        </motion.div>

        {/* This Month's Calendar (hardcoded shifts) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 w-full max-w-5xl bg-white rounded-2xl shadow p-6"
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
        className="w-full max-w-5xl bg-white rounded-2xl shadow p-6"
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
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("mySchedule")}
          className={
            `px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ` +
            (activeTab === "mySchedule"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300")
          }
        >
          My Schedule
        </button>
        <button
          onClick={() => setActiveTab("viewOthers")}
          className={
            `px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ` +
            (activeTab === "viewOthers"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300")
          }
        >
          View Others
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "mySchedule" && <MyScheduleTab />}
      {activeTab === "viewOthers" && <ViewOthersTab />}
    </main>
  );
}
