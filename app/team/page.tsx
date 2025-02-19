"use client";
import React, { useState, useEffect } from "react";

// Create an array of hours (from 9 AM to 10 PM) with both numeric and display labels.
const hours = Array.from({ length: 14 }, (_, i) => {
  const numeric = i + 9; // 9, 10, 11, ... up to 22
  const hour12 = numeric % 12 === 0 ? 12 : numeric % 12;
  const period = numeric >= 12 ? "PM" : "AM";
  return { numeric, label: `${hour12} ${period}` };
});

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to get the most recent Monday based on today's date.
const getMostRecentMonday = (date: Date): Date => {
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  return monday;
};

/**
 * getCellContent:
 * Used for each Employee cell. 
 * If the segment has a location (Desk 1, Desk 2, Desk 3), we color it accordingly 
 * and display the segmentType as text in the cell.
 */
const getCellContent = (
  hour: number,
  shifts: Array<{
    startTime: string;
    endTime: string;
    segments?: Array<{
      startTime: string;
      endTime: string;
      segmentType: string;
      location?: string;
    }>;
  }>,
  selectedDate: Date
) => {
  for (const shift of shifts) {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);

    // Only consider shifts that occur on the selected date
    if (shiftStart.toLocaleDateString() !== selectedDate.toLocaleDateString()) {
      continue;
    }

    // Check if the hour is within the shift's start and end hours
    if (hour >= shiftStart.getHours() && hour < shiftEnd.getHours()) {
      // Look for a segment covering this hour
      if (shift.segments && shift.segments.length > 0) {
        const segment = shift.segments.find((seg) => {
          const segStart = new Date(seg.startTime);
          const segEnd = new Date(seg.endTime);
          return hour >= segStart.getHours() && hour < segEnd.getHours();
        });

        if (segment) {
          // If this segment has a location, override the color with that desk's color
          if (segment.location) {
            const label = segment.segmentType || "Work"; // fallback if no segmentType
            switch (segment.location) {
              case "Desk 1":
                return (
                  <span
                    className="bg-red-200 text-red-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs"
                  >
                    {label}
                  </span>
                );
              case "Desk 2":
                return (
                  <span
                    className="bg-yellow-200 text-yellow-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs"
                  >
                    {label}
                  </span>
                );
              case "Desk 3":
                return (
                  <span
                    className="bg-green-200 text-green-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs"
                  >
                    {label}
                  </span>
                );
              default:
                // If there's some other desk name not in Desk 1/2/3, just fallback
                return (
                  <span
                    className="bg-blue-200 text-blue-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs"
                  >
                    {label}
                  </span>
                );
            }
          } else {
            // No location => color by segmentType
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
      }
      // If no segment is found, show the generic "Work"
      return (
        <span className="bg-blue-200 text-blue-800 rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs">
          Work
        </span>
      );
    }
  }
  // Outside any shifts
  return null;
};

// This helper is for the Location (Desk) rows themselves
function getDeskCellContent(
  desk: string,
  hour: number,
  scheduleData: Array<{
    name: string;
    shifts: Array<{
      startTime: string;
      endTime: string;
      segments?: Array<{
        startTime: string;
        endTime: string;
        segmentType: string;
        location?: string;
      }>;
    }>;
  }>,
  selectedDate: Date
) {
  const employeesAtDesk: string[] = [];

  scheduleData.forEach((employee) => {
    employee.shifts.forEach((shift) => {
      const shiftStart = new Date(shift.startTime);
      const shiftEnd = new Date(shift.endTime);

      // Only consider shifts on the selected date
      if (shiftStart.toLocaleDateString() !== selectedDate.toLocaleDateString()) {
        return;
      }
      if (hour >= shiftStart.getHours() && hour < shiftEnd.getHours()) {
        // If location is stored in segments:
        if (shift.segments && shift.segments.length > 0) {
          shift.segments.forEach((seg) => {
            const segStart = new Date(seg.startTime);
            const segEnd = new Date(seg.endTime);
            if (hour >= segStart.getHours() && hour < segEnd.getHours()) {
              if (seg.location === desk) {
                employeesAtDesk.push(employee.name);
              }
            }
          });
        }
      }
    });
  });

  if (employeesAtDesk.length === 0) return null;

  // Decide color based on desk
  let bgColorClass = "";
  if (desk === "Desk 1") {
    bgColorClass = "bg-red-200 text-red-800";
  } else if (desk === "Desk 2") {
    bgColorClass = "bg-yellow-200 text-yellow-800";
  } else if (desk === "Desk 3") {
    bgColorClass = "bg-green-200 text-green-800";
  } else {
    // fallback if there's some other desk name
    bgColorClass = "bg-blue-200 text-blue-800";
  }

  return (
    <div
      className={`${bgColorClass} rounded w-full h-full flex flex-col items-center justify-center text-xs p-1`}
    >
      {employeesAtDesk.map((emp, idx) => (
        <div key={idx}>{emp}</div>
      ))}
    </div>
  );
}

const defaultSelectedDay = (() => {
  const today = new Date();
  const dayNumber = today.getDay(); // 0 (Sun) to 6 (Sat)
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
        segments?: Array<{
          startTime: string;
          endTime: string;
          segmentType: string;
          location?: string;
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
        <span className="text-lg font-medium">
          Week of: {formattedMondayDate}
        </span>
      </div>

      {/* Centered Week Tabs with dynamic date labels */}
      <div className="flex justify-center space-x-4 mb-6">
        {days.map((day, index) => {
          const currentDayDate = new Date(mondayDate);
          currentDayDate.setDate(mondayDate.getDate() + index);
          // Format the date as "M/D"
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

      {/* Use table-fixed to force equal column widths */}
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-gray-500 text-white">
          <tr>
            {/* The first column header labeled "Locations" (fixed width via Tailwind) */}
            <th className="border border-gray-300 px-2 py-2 w-24">Locations</th>
            {hours.map((hour) => (
              <th
                key={hour.numeric}
                className="border border-gray-300 px-2 py-2 text-sm w-1/12"
              >
                {hour.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Location Rows */}
          {["Desk 1", "Desk 2", "Desk 3"].map((desk) => (
            <tr key={desk} className="bg-gray-100 border-b border-gray-400">
              <td className="border border-gray-300 px-2 py-2 font-semibold h-12">
                {desk}
              </td>
              {hours.map((hour) => (
                <td
                  key={hour.numeric}
                  className="border border-gray-300 px-1 py-1 relative h-12"
                >
                  {getDeskCellContent(desk, hour.numeric, scheduleData, selectedDate)}
                </td>
              ))}
            </tr>
          ))}

          {/* Spacer Row for separation */}
          <tr>
            <td colSpan={hours.length + 1} className="h-4"></td>
          </tr>

          {/* Separator Row with label "Employees" and replicated time labels */}
          <tr className="bg-white">
            <td className="border border-gray-300 px-2 py-2 font-semibold w-24 h-12">
              Employees
            </td>
            {hours.map((hour) => (
              <td
                key={hour.numeric}
                className="border border-gray-300 px-2 py-2 text-sm text-gray-600 text-center w-1/12 h-12"
              >
                {hour.label}
              </td>
            ))}
          </tr>

          {/* Employee Rows */}
          {scheduleData.map((employee, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-2 py-2 font-semibold h-12">
                {employee.name}
              </td>
              {hours.map((hour) => (
                <td
                  key={hour.numeric}
                  className="border border-gray-300 px-1 py-1 relative h-12"
                >
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
