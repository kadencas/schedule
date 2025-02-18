"use client";
import React, { useState, useEffect } from "react";

// Day-of-week abbreviations (using Monday as the first day)
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Build a 2D array representing the month’s weeks.
 * Each week is an array of 7 items (either a Date object or null).
 * We assume Monday is the first day of the week.
 */
const getMonthData = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  // Get the weekday of the first day (0=Sun, 1=Mon, etc.).
  // For a Monday-first calendar, treat Sunday (0) as 7.
  let startDay = firstDayOfMonth.getDay();
  startDay = startDay === 0 ? 7 : startDay;
  const blanks = startDay - 1; // number of blank cells before the 1st

  const monthDays = new Date(year, month + 1, 0).getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  // Fill in blank cells before the 1st
  for (let i = 0; i < blanks; i++) {
    week.push(null);
  }
  // Fill in days of the month
  for (let day = 1; day <= monthDays; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  // Fill in any remaining blank cells for the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }
  return weeks;
};

interface Segment {
  startTime: string;
  endTime: string;
  segmentType: string;
}

interface Shift {
  startTime: string;
  endTime: string;
  segments?: Segment[];
}

interface MiniTimelineProps {
  shifts: Shift[];
  dayDate: Date;
}

/**
 * MiniTimeline renders two rows:
 * - A thin horizontal row on top with time numbers (9, 10, …, 12, 1, …)
 * - A shift bar row below showing the employee’s schedule for that day.
 */
const MiniTimeline: React.FC<MiniTimelineProps> = ({ shifts, dayDate }) => {
  // Timeline boundaries: 9 AM to 10 PM.
  const timelineStart = 9;
  const timelineEnd = 22;
  const timelineDuration = timelineEnd - timelineStart; // e.g., 13 hours

  // Convert a Date to a decimal hour (e.g., 9:30 becomes 9.5).
  const getTimeInDecimal = (date: Date) =>
    date.getHours() + date.getMinutes() / 60;

  // Filter the shifts to those that occur on the given day.
  const dayShifts = shifts.filter((shift) => {
    const shiftStart = new Date(shift.startTime);
    return shiftStart.toLocaleDateString() === dayDate.toLocaleDateString();
  });

  return (
    <div className="w-full border rounded overflow-hidden">
      {/* Time markers row */}
      <div className="flex text-[0.7rem] border-b border-gray-300">
        {Array.from({ length: timelineDuration + 1 }, (_, i) => {
          const hour = timelineStart + i;
          // Use 12-hour format: after 12, subtract 12.
          const displayHour = hour > 12 ? hour - 12 : hour;
          return (
            <div
              key={i}
              className="flex-1 text-center border-r border-gray-300 last:border-0"
            >
              {displayHour}
            </div>
          );
        })}
      </div>
      {/* Shift bar row */}
      <div className="relative w-full h-4 bg-gray-100">
        {dayShifts.map((shift, index) => {
          const shiftStartDate = new Date(shift.startTime);
          const shiftEndDate = new Date(shift.endTime);
          const startDecimal = getTimeInDecimal(shiftStartDate);
          const endDecimal = getTimeInDecimal(shiftEndDate);

          // Clamp the shift times within the timeline boundaries.
          const effectiveStart = Math.max(startDecimal, timelineStart);
          const effectiveEnd = Math.min(endDecimal, timelineEnd);

          // If the shift is completely outside our timeline, do not render it.
          if (effectiveEnd <= timelineStart || effectiveStart >= timelineEnd) {
            return null;
          }

          // Compute the left offset and width as percentages.
          const leftPercent =
            ((effectiveStart - timelineStart) / timelineDuration) * 100;
          const widthPercent =
            ((effectiveEnd - effectiveStart) / timelineDuration) * 100;

          // Default label and color.
          let label = "Work";
          let bgColorClass = "bg-blue-200 text-blue-800";

          // If segments exist, pick one and style accordingly.
          if (shift.segments && shift.segments.length > 0) {
            const segment = shift.segments.find((seg) => {
              const segStart = new Date(seg.startTime);
              const segEnd = new Date(seg.endTime);
              return segStart <= shiftEndDate && segEnd >= shiftStartDate;
            });
            if (segment) {
              label = segment.segmentType;
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
            }
          }

          return (
            <div
              key={index}
              className={`${bgColorClass} absolute flex items-center justify-center text-xs rounded`}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: "100%",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface Employee {
  name: string;
  shifts: Shift[];
}

/**
 * MonthView renders the entire month as a calendar grid.
 * Each day cell displays the date (if available) and a list of employees’ mini timelines.
 */
const MonthView: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<Employee[]>([]);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (0 = January)

  // Build the month grid.
  const monthGrid = getMonthData(currentYear, currentMonth);

  // Fetch schedule data (expects an object with an "employees" array).
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
    <div className="p-6 bg-white shadow-md rounded-lg overflow-auto">
      {/* Month title */}
      <h2 className="text-2xl font-semibold text-center mb-4">
        {today.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      {/* Days-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="text-center font-bold border p-1">
            {day}
          </div>
        ))}
      </div>
      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthGrid.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className="border h-32 p-1 overflow-hidden"
            >
              {day ? (
                <>
                  {/* Date header */}
                  <div className="text-xs font-bold">{day.getDate()}</div>
                  {/* List each employee's mini timeline for this day */}
                  <div className="mt-1 space-y-1 overflow-auto">
                    {scheduleData.map((employee, empIndex) => (
                      <div
                        key={empIndex}
                        className="border p-1 rounded"
                      >
                        <div className="text-[0.6rem] font-semibold">
                          {employee.name}
                        </div>
                        <MiniTimeline shifts={employee.shifts} dayDate={day} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Empty cell for days outside the current month
                <div className="h-full"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthView;
