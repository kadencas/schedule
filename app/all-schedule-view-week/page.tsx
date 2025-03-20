"use client";
import React, { useState, useEffect } from "react";
import { days } from "@/constants/constants";
import { getMostRecentMonday } from "../individual-schedule-builder/helper/helper";
import { Segment, Shift } from "@/types/types";
import { FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";

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
    <div className="w-full rounded-md overflow-hidden bg-gray-50">
      {/* Time Markers Row */}
      <div className="flex text-[0.65rem] text-gray-500">
        {Array.from({ length: timelineDuration + 1 }, (_, i) => {
          const hour = timelineStart + i;
          const displayHour = hour > 12 ? hour - 12 : hour;
          return (
            <div
              key={i}
              className="flex-1 text-start px-0.5"
            >
              {displayHour}
            </div>
          );
        })}
      </div>

      {/* Shift Bar Row */}
      <div className="relative w-full h-5 bg-white">
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
              className="bg-blue-500/80 text-white absolute flex items-center justify-center text-xs rounded-sm px-1"
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
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Instead of computing mondayDate only once, store the current week's Monday in state.
  const [currentMonday, setCurrentMonday] = useState<Date>(
    getMostRecentMonday(new Date())
  );

  // Handlers to change weeks.
  const handlePreviousWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(newMonday.getDate() - 7);
    setCurrentMonday(newMonday);
  };

  const handleNextWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(newMonday.getDate() + 7);
    setCurrentMonday(newMonday);
  };

  const resetFilters = () => {
    setSelectedDepartment("");
    setSelectedLocation("");
    setSelectedRole("");
  };

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

  // Build the week days with corresponding dates using currentMonday.
  const weekDays = days.map((day, index) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + index);
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

  const isCurrentWeek = () => {
    const today = new Date();
    const mostRecentMonday = getMostRecentMonday(today);
    return mostRecentMonday.toDateString() === currentMonday.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">All Schedules</h1>
        <p className="text-sm text-gray-500">View and manage all employee schedules</p>
      </div>

      {/* Week Navigation & Filters */}
      <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-4">
          <motion.button
            onClick={handlePreviousWeek}
            whileTap={{ scale: 0.97 }}
            className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          >
            <FiChevronLeft size={16} className="mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>
          
          <h2 className="text-base font-medium text-gray-700 flex items-center">
            <span className={isCurrentWeek() ? "bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md" : ""}>
              Week of {currentMonday.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </h2>
          
          <motion.button
            onClick={handleNextWeek}
            whileTap={{ scale: 0.97 }}
            className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <FiChevronRight size={16} className="ml-1" />
          </motion.button>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiFilter size={14} className="mr-1" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          {(selectedDepartment || selectedLocation || selectedRole) && (
            <button 
              onClick={resetFilters}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiRefreshCw size={14} className="mr-1" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Section */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-md"
          >
            <div>
              <label htmlFor="department" className="block text-xs font-medium text-gray-600 mb-1">
                Department
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-medium text-gray-600 mb-1">
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-medium text-gray-600 mb-1">
                Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Schedule Content */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500">Loading schedules...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">😔 {error}</div>
            <button className="text-sm text-blue-500 hover:underline">Try Again</button>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ day, date }, dayIndex) => (
              <div key={dayIndex} className={`
                relative rounded-lg overflow-hidden
                ${isToday(date) ? 'ring-2 ring-blue-500' : 'border border-gray-100'}
              `}>
                {/* Day header */}
                <div className={`
                  text-center py-2 font-medium
                  ${isToday(date) ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'}
                `}>
                  <div className="text-sm">{day}</div>
                  <div className="text-xs opacity-80">
                    {date.toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </div>
                </div>
                
                {/* Employee schedules for the day */}
                <div className="p-1.5 space-y-1.5 max-h-[450px] overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee, index) => (
                      <div key={index} className="bg-gray-50 rounded-md overflow-hidden">
                        <div className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 truncate">
                          {employee.name}
                        </div>
                        <div className="p-1">
                          <MiniTimeline shifts={employee.shifts} dayDate={date} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-4">No employees</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyView;
