"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

function parseTime(timeString: any) {
  const [time, meridiem] = timeString.split(/\s/);
  let [hourStr] = time.split(":");
  let hour = parseInt(hourStr, 10);

  if (meridiem?.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (meridiem?.toUpperCase() === "AM" && hour === 12) {
    hour = 0; // 12 AM is 0 in 24-hour
  }

  return hour;
}
function parseShift(shiftString: any) {
  if (!shiftString || shiftString.toLowerCase() === "off") {
    return null;
  }
  const [startTime, endTime] = shiftString.split("-");
  const start = parseTime(startTime.trim());
  const end = parseTime(endTime.trim());
  return { start, end };
}

////////////////////////////////////////////
// MOCK DATA
////////////////////////////////////////////

// We’ll store a mock monthly schedule for Bob
// Keyed by date in YYYY-MM-DD format => shift string
const monthlyShifts: Record<string, string> = {
  "2025-02-01": "Off",
  "2025-02-02": "9:00 AM - 5:00 PM",
  "2025-02-03": "8:00 AM - 4:00 PM",
  "2025-02-04": "Off",
  "2025-02-05": "9:00 AM - 5:00 PM",
  "2025-02-06": "1:00 PM - 6:00 PM",
  "2025-02-07": "Off",
};

// Build events array for RBC from the monthlyShifts data
function buildEventsFromShifts(shiftsObj: Record<string, string>) {
  // For each date key, parse the shift
  // RBC expects each event to have: title, start, end
  // We'll just store the shift as the "title". If shift is "Off", skip.

  const events = [];
  for (const [dateStr, shift] of Object.entries(shiftsObj)) {
    if (!shift || shift.toLowerCase() === "off") {
      continue; 
    }
    const shiftParsed = parseShift(shift);
    if (!shiftParsed) {
      continue; // skip if it failed
    }
    // dateStr is YYYY-MM-DD, so let's build Date objects for start/end
    // We'll ignore minutes for simplicity
    // RBC requires actual Date objects
    // e.g. new Date(year, monthIndex, day, hour, minute)

    const [year, month, day] = dateStr.split("-").map(Number);
    // shiftParsed.start => e.g. 9 for 9 AM, shiftParsed.end => e.g. 17 for 5 PM

    const eventStart = new Date(year, month - 1, day, shiftParsed.start);
    const eventEnd = new Date(year, month - 1, day, shiftParsed.end);

    events.push({
      title: shift, // e.g. "9:00 AM - 5:00 PM"
      start: eventStart,
      end: eventEnd,
    });
  }
  return events;
}

export default function Dashboard() {
  // Tab state to toggle between 'My Schedule' and 'View Others'
  const [activeTab, setActiveTab] = useState("mySchedule");

  // Mock data for demonstration
  const currentShift = "9:00 AM - 5:00 PM";
  const sickTime = "24 hrs";
  const vacationTime = "40 hrs";
  const upcomingSchedule = [
    { day: "Thursday", shift: "9:00 AM - 5:00 PM" },
    { day: "Friday", shift: "1:00 PM - 9:00 PM" },
    { day: "Saturday", shift: "Off" },
  ];

  // Mock data for 'View Others'
  const coworkers = [
    { name: "Alice", shift: "8:00 AM - 4:00 PM" },
    { name: "John", shift: "10:00 AM - 6:00 PM" },
    { name: "Maria", shift: "2:00 PM - 10:00 PM" },
  ];

  // Mock data for weekly schedule (just a simple text-based list)
  const weeklySchedule = [
    { day: "Monday", shift: "8:00 AM - 4:00 PM" },
    { day: "Tuesday", shift: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", shift: "Off" },
    { day: "Thursday", shift: "9:00 AM - 5:00 PM" },
    { day: "Friday", shift: "10:00 AM - 6:00 PM" },
    { day: "Saturday", shift: "1:00 PM - 5:00 PM" },
    { day: "Sunday", shift: "Off" },
  ];

  // For the daily timeline bar
  const parsedDailyShift = parseShift(currentShift);
  let dayLeftPercent = 0;
  let dayWidthPercent = 0;
  if (parsedDailyShift) {
    const { start, end } = parsedDailyShift;
    dayLeftPercent = (start / 24) * 100;
    dayWidthPercent = ((end - start) / 24) * 100;
  }

  // Build RBC events from monthly shifts
  const monthlyEvents = buildEventsFromShifts(monthlyShifts);

  ////////////////////////////////////////////
  // MY SCHEDULE TAB
  ////////////////////////////////////////////
  const MyScheduleTab = () => {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, Bob</h1>
          <p className="text-gray-600 text-xl">Here’s a quick look at your schedule</p>
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
            {/* Green bar representing Bob's shift */}
            {parsedDailyShift && (
              <div
                className="absolute top-0 bottom-0 bg-green-500 rounded-md"
                style={{
                  left: `${dayLeftPercent}%`,
                  width: `${dayWidthPercent}%`,
                }}
              ></div>
            )}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>12:00 AM</span>
            <span>12:00 PM</span>
            <span>11:59 PM</span>
          </div>
        </motion.div>

        {/* This Month's Calendar - React Big Calendar */}
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
  };

  ////////////////////////////////////////////
  // VIEW OTHERS TAB
  ////////////////////////////////////////////
  const ViewOthersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl bg-white rounded-2xl shadow p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Others' Schedules</h2>
      <ul className="space-y-3">
        {coworkers.map((coworker, idx) => (
          <li key={idx} className="flex justify-between text-lg text-gray-700">
            <span className="font-medium">{coworker.name}</span>
            <span>{coworker.shift}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

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
