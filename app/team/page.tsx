'use client';
import React, { useState, useEffect } from "react";

// Create an array of hours (from 9 AM to 10 PM) with both numeric and display labels.
// We're using these numbers as UTC hours.
const hours = Array.from({ length: 14 }, (_, i) => {
  const numeric = i + 9; // 9, 10, 11, ... up to 22
  const hour12 = numeric % 12 === 0 ? 12 : numeric % 12;
  const period = numeric >= 12 ? "PM" : "AM";
  return { numeric, label: `${hour12} ${period}` };
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleTable = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [scheduleData, setScheduleData] = useState<
    Array<{ name: string; shifts: { startTime: string; endTime: string }[] }>
  >([]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetch("/api/shifts");
        const data = await res.json();
        setScheduleData(data.employees);
      } catch (error) {
        console.error("Error fetching shift data:", error);
      }
    };

    fetchShifts();
  }, []);

  // Using getUTCHours to avoid local time zone conversions.
  const isHourInShift = (hour: number, shifts: { startTime: string; endTime: string }[]) => {
    return shifts.some(shift => {
      const shiftStart = new Date(shift.startTime).getUTCHours();
      const shiftEnd = new Date(shift.endTime).getUTCHours();
      return hour >= shiftStart && hour < shiftEnd;
    });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex space-x-2 mb-4">
        {days.map((day) => (
          <button
            key={day}
            className={`px-4 py-2 rounded ${
              selectedDay === day ? "bg-green-600 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Employee Name</th>
            {hours.map((hour) => (
              <th key={hour.numeric} className="border border-gray-300 px-4 py-2">
                {hour.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((employee, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2 font-semibold">{employee.name}</td>
              {hours.map((hour) => (
                <td key={hour.numeric} className="border border-gray-300 px-4 py-2 relative">
                  {isHourInShift(hour.numeric, employee.shifts) && (
                    <span className="bg-blue-200 text-blue-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs">
                      Work
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
