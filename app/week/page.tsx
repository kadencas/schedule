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

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? " PM" : " AM";
  hours = hours % 12 || 12; // Convert 0 (midnight) and 12 (noon) correctly
  return `${hours}${
    minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""
  }${ampm}`;
};

const MiniTimeline: React.FC<MiniTimelineProps> = ({ shifts, dayDate }) => {
  // Timeline boundaries: 9 AM to 10 PM.
  const timelineStart = 9;
  const timelineEnd = 22; // 10 PM
  const timelineDuration = timelineEnd - timelineStart;

  const getTimeInDecimal = (date: Date) =>
    date.getHours() + date.getMinutes() / 60;

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
          const displayHour = hour > 12 ? hour - 12 : hour;
          return (
            <div
              key={i}
              className="flex-1 text-start border-r border-gray-300 last:border-0"
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

          const effectiveStart = Math.max(startDecimal, timelineStart);
          const effectiveEnd = Math.min(endDecimal, timelineEnd);

          if (effectiveEnd <= timelineStart || effectiveStart >= timelineEnd) {
            return null;
          }

          const leftPercent =
            ((effectiveStart - timelineStart) / timelineDuration) * 100;
          const widthPercent =
            ((effectiveEnd - effectiveStart) / timelineDuration) * 100;

          const shiftTimeLabel = `${formatTime(
            shiftStartDate
          )} - ${formatTime(shiftEndDate)}`;

          return (
            <div
              key={index}
              className="bg-blue-200 text-blue-800 absolute flex items-center justify-center text-xs rounded px-1"
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {shiftTimeLabel}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface Employee {
  // companyId is presumably already filtered by your backend
  name: string;
  role: string;
  department: string;
  location: string;
  shifts: Shift[];
}

const WeeklyView: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const today = new Date();
  const mondayDate = getMostRecentMonday(today);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetch("/api/shifts");
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        // The backend already filters by companyId, so we can use the data directly
        setScheduleData(data.employees || []);
      } catch (err) {
        console.error("Error fetching shift data:", err);
        setError("Unable to load schedule data.");
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Build the week days with corresponding dates
  const weekDays = days.map((day, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    return { day, date };
  });

  // Get all unique options for department, location, and role
  const departments = Array.from(
    new Set(scheduleData.map((emp) => emp.department).filter(Boolean))
  );
  const locations = Array.from(
    new Set(scheduleData.map((emp) => emp.location).filter(Boolean))
  );
  const roles = Array.from(
    new Set(scheduleData.map((emp) => emp.role).filter(Boolean))
  );

  // Filter employees by department, location, and role
  const filteredEmployees = scheduleData
    .filter((emp) =>
      selectedDepartment === "" ? true : emp.department === selectedDepartment
    )
    .filter((emp) =>
      selectedLocation === "" ? true : emp.location === selectedLocation
    )
    .filter((emp) => (selectedRole === "" ? true : emp.role === selectedRole));

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

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4">
        <div>
          <label htmlFor="department" className="mr-2 font-semibold">
            Department:
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="">All</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mr-2 font-semibold">
            Location:
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="">All</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="mr-2 font-semibold">
            Role:
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="">All</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading schedule...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
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
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => (
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
      )}
    </div>
  );
};

export default WeeklyView;
