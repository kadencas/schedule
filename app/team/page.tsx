"use client";
import React, { useState, useEffect } from "react";

// Create an array of hours (from 9 AM to 10 PM) with both numeric and display labels.
const hours = Array.from({ length: 14 }, (_, i) => {
  const numeric = i + 9; // 9, 10, 11, ... up to 22
  const hour12 = numeric % 12 === 0 ? 12 : numeric % 12;
  const period = numeric >= 12 ? "PM" : "AM";
  return { numeric, label: `${hour12} ${period}` };
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper function to get the most recent Monday based on today's date.
const getMostRecentMonday = (date: Date): Date => {
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  // If today is Sunday (0), subtract 6 days; otherwise, subtract (day - 1) days.
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  return monday;
};

// NEW HELPER: Given an hour, the shifts, and the selected date,
// check if that hour falls within a shift and, if so, whether it
// falls within a segment. If a segment exists, return it (with type info)
// so we can style it accordingly.
const getCellContent = (
  hour: number,
  shifts: Array<{
    startTime: string;
    endTime: string;
    segments?: Array<{
      startTime: string;
      endTime: string;
      segmentType: string;
    }>;
  }>,
  selectedDate: Date
) => {
  for (const shift of shifts) {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);
    // Only consider shifts that occur on the selected date.
    if (shiftStart.toLocaleDateString() !== selectedDate.toLocaleDateString()) {
      continue;
    }
    // Check if the hour is within the shift's start and end hours.
    if (hour >= shiftStart.getHours() && hour < shiftEnd.getHours()) {
      // If the shift has segments, check if the hour falls within any segment.
      if (shift.segments && shift.segments.length > 0) {
        const segment = shift.segments.find((seg) => {
          const segStart = new Date(seg.startTime);
          const segEnd = new Date(seg.endTime);
          return hour >= segStart.getHours() && hour < segEnd.getHours();
        });
        if (segment) {
          // Determine styling based on the segment type.
          let bgColorClass = "";
          switch (segment.segmentType.toLowerCase()) {
            case "lunch":
              bgColorClass = "bg-green-200 text-green-800";
              break;
            case "meeting":
              bgColorClass = "bg-yellow-200 text-yellow-800";
              break;
            case "deepwork":
              bgColorClass = "bg-purple-200 text-purple-800";
              break;
            default:
              bgColorClass = "bg-blue-200 text-blue-800";
          }
          return (
            <span
              className={`${bgColorClass} rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs`}
            >
              {segment.segmentType}
            </span>
          );
        }
      }
      // If no segment is found, show the generic "Work" indicator.
      return (
        <span className="bg-blue-200 text-blue-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs">
          Work
        </span>
      );
    }
  }
  return null;
};

const defaultSelectedDay = (() => {
  const today = new Date();
  const dayNumber = today.getDay(); // 0 (Sun) to 6 (Sat)
  // Convert to index for the `days` array where Monday is at index 0.
  return dayNumber === 0 ? "Sunday" : days[dayNumber - 1];
})();

const ScheduleTable = () => {
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [scheduleData, setScheduleData] = useState<
    Array<{
      name: string;
      shifts: Array<{
        startTime: string;
        endTime: string;
        // Make sure your API returns segments for each shift!
        segments?: Array<{
          startTime: string;
          endTime: string;
          segmentType: string;
        }>;
      }>;
    }>
  >([]);

  // Compute the most recent Monday.
  const today = new Date();
  const mondayDate = getMostRecentMonday(today);
  const formattedMondayDate = mondayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Compute the actual date for the selected day.
  const selectedDayIndex = days.indexOf(selectedDay);
  const selectedDate = new Date(mondayDate);
  selectedDate.setDate(mondayDate.getDate() + selectedDayIndex);

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

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      {/* Centered label above the week tabs */}
      <div className="flex justify-center mb-4">
        <span className="text-lg font-medium">Week of: {formattedMondayDate}</span>
      </div>

      {/* Centered Week Tabs with dynamic date labels */}
      <div className="flex justify-center space-x-4 mb-6">
        {days.map((day, index) => {
          const currentDayDate = new Date(mondayDate);
          currentDayDate.setDate(mondayDate.getDate() + index);
          // Format the date as "M/D" (e.g., "2/10")
          const formattedDate = currentDayDate.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          });
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-t-md font-semibold text-sm transition-colors duration-200 ${
                selectedDay === day
                  ? "bg-blue-600 text-white border-b-4 border-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day} {formattedDate}
            </button>
          );
        })}
      </div>

      <table className="min-w-full border-collapse">
        <thead className="bg-gray-500 text-white">
          <tr>
            {/* The first column header labeled "Locations" */}
            <th className="border border-gray-300 px-4 py-2">Locations</th>
            {hours.map((hour) => (
              <th key={hour.numeric} className="border border-gray-300 px-4 py-2 text-sm">
                {hour.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Location Rows */}
          {["Desk 1", "Desk 2", "Desk 3"].map((desk) => (
            <tr key={desk} className="bg-gray-100 border-b border-gray-400">
              <td className="border border-gray-300 px-4 py-2 font-semibold">{desk}</td>
              {hours.map((hour) => (
                <td key={hour.numeric} className="border border-gray-300 px-4 py-2"></td>
              ))}
            </tr>
          ))}

          {/* Spacer Row for separation */}
          <tr>
            <td colSpan={hours.length + 1} className="h-4"></td>
          </tr>

          {/* Separator Row with label "Employees" and replicated time labels */}
          <tr className="bg-white">
            <td className="border border-gray-300 px-4 py-2 font-semibold">Employees</td>
            {hours.map((hour) => (
              <td
                key={hour.numeric}
                className="border border-gray-300 px-4 py-2 text-sm text-gray-600 text-center"
              >
                {hour.label}
              </td>
            ))}
          </tr>

          {/* Employee Rows */}
          {scheduleData.map((employee, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2 font-semibold">{employee.name}</td>
              {hours.map((hour) => (
                <td key={hour.numeric} className="border border-gray-300 px-4 py-2 relative">
                  {getCellContent(hour.numeric, employee.shifts, selectedDate)}
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

