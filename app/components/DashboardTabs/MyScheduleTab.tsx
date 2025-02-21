"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "react-big-calendar";
import { format } from "date-fns";

interface Shift {
  startTime: string;
  endTime: string;
}

interface EmployeeData {
  name: string;
  shifts: Shift[];
}

interface MyScheduleTabProps {
  employeeData: EmployeeData | null;
  userName: string;
  localizer: any;
}

export default function MyScheduleTab({ employeeData, userName, localizer }: MyScheduleTabProps) {
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
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl z-10 relative">
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
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h2 className="text-xl font-semibold mb-3">Upcoming Shifts</h2>
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
