"use client";
import React, { useState, useEffect } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper: Get the most recent Monday given a date.
const getMostRecentMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  return monday;
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

const MiniTimeline: React.FC<MiniTimelineProps> = ({ shifts, dayDate }) => {
  // Timeline boundaries: 9 AM to 10 PM.
  const timelineStart = 9;
  const timelineEnd = 22; // 10 PM
  const timelineDuration = timelineEnd - timelineStart; // e.g., 13 hours

  // Helper: Convert a Date into a decimal hour.
  const getTimeInDecimal = (date: Date) =>
    date.getHours() + date.getMinutes() / 60;

  // Filter shifts for the given day.
  const dayShifts = shifts.filter((shift) => {
    const shiftStart = new Date(shift.startTime);
    return shiftStart.toLocaleDateString() === dayDate.toLocaleDateString();
  });

  return (
    <div className="w-full border rounded overflow-hidden">
      {/* Time Markers Row */}
      <div className="flex text-[0.7rem] border-b border-gray-300">
        {Array.from({ length: timelineDuration + 1 }, (_, i) => {
          const hour = timelineStart + i;
          // Display in 12-hour format: if hour > 12, subtract 12.
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

      {/* Shift Bar Row */}
      <div className="relative w-full h-4 bg-gray-100">
        {dayShifts.map((shift, index) => {
          const shiftStartDate = new Date(shift.startTime);
          const shiftEndDate = new Date(shift.endTime);
          const startDecimal = getTimeInDecimal(shiftStartDate);
          const endDecimal = getTimeInDecimal(shiftEndDate);

          // Clamp the shift within the timeline boundaries.
          const effectiveStart = Math.max(startDecimal, timelineStart);
          const effectiveEnd = Math.min(endDecimal, timelineEnd);

          if (effectiveEnd <= timelineStart || effectiveStart >= timelineEnd) {
            return null;
          }

          // Calculate left offset and width as percentages.
          const leftPercent =
            ((effectiveStart - timelineStart) / timelineDuration) * 100;
          const widthPercent =
            ((effectiveEnd - effectiveStart) / timelineDuration) * 100;

          // Determine label and background color.
          let label = "Work";
          let bgColorClass = "bg-blue-200 text-blue-800";
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

const WeeklyView: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<Employee[]>([]);
  const today = new Date();
  const mondayDate = getMostRecentMonday(today);

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

  // Build the week days with corresponding dates.
  const weekDays = days.map((day, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    return { day, date };
  });

  return (
    <div className="p-6 bg-white shadow-md rounded-lg overflow-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Week of{" "}
        {mondayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </h2>
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(({ day, date }, dayIndex) => (
          <div key={dayIndex} className="border p-2 rounded">
            {/* Day header */}
            <div className="text-center font-bold mb-2">
              {day}
              <br />
              {date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
              })}
            </div>
            {/* Employee schedules for the day */}
            <div className="space-y-2">
              {scheduleData.length > 0 ? (
                scheduleData.map((employee, index) => (
                  <div key={index} className="border p-1 rounded">
                    <div className="text-xs font-semibold mb-1">
                      {employee.name}
                    </div>
                    <MiniTimeline shifts={employee.shifts} dayDate={date} />
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No employees</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;
