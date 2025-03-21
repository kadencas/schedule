"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "react-big-calendar";
import { format, addDays, isToday, isTomorrow, differenceInMinutes, isAfter, isBefore } from "date-fns";
import { Employee } from "@/types/types";
import dynamic from "next/dynamic";
import { 
  FiClock, 
  FiCalendar, 
  FiArrowRight, 
  FiInfo, 
  FiChevronRight, 
  FiChevronLeft,
  FiLogOut,
  FiAlertCircle,
  FiCheck,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiEdit,
  FiPlusCircle
} from "react-icons/fi";

// Dynamically import ScheduleBuilderComponent with SSR disabled
const ScheduleBuilderComponent = dynamic(() => import("../individual-schedule-builder/page"), { ssr: false });

interface MyScheduleTabProps {
  employeeData: Employee | null;
  userName: string;
  localizer: any;
}

export default function MyScheduleTab({ employeeData, userName, localizer }: MyScheduleTabProps) {
  const [selectedView, setSelectedView] = useState<"schedule" | "details">("schedule");
  const [showNextShifts, setShowNextShifts] = useState(true);

  const today = new Date();
  
  // Move all hooks to the top, with null checks inside
  const todaysShift = employeeData?.shifts?.find((shift) => {
    const shiftStart = new Date(shift.startTime);
    return shiftStart.toDateString() === today.toDateString();
  });

  // Find the next upcoming shift (including today if shift hasn't started yet)
  const nextShift = useMemo(() => {
    if (!employeeData?.shifts) return null;
    
    return employeeData.shifts
      .filter(shift => {
        const shiftStart = new Date(shift.startTime);
        // Include shifts today that haven't started yet or future shifts
        return (isToday(shiftStart) && isAfter(shiftStart, today)) || isAfter(shiftStart, today);
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }, [employeeData?.shifts, today]);

  // Check if user is currently working
  const isCurrentlyWorking = useMemo(() => {
    if (!todaysShift) return false;
    const shiftStart = new Date(todaysShift.startTime);
    const shiftEnd = new Date(todaysShift.endTime);
    return isBefore(shiftStart, today) && isAfter(shiftEnd, today);
  }, [todaysShift, today]);

  // Format current shift time
  const currentShiftTime = todaysShift
    ? `${format(new Date(todaysShift.startTime), "h:mm a")} - ${format(
        new Date(todaysShift.endTime),
        "h:mm a"
      )}`
    : "Off today";
  
  // Get time remaining in current shift
  const timeRemainingInShift = useMemo(() => {
    if (!isCurrentlyWorking || !todaysShift) return null;
    const shiftEnd = new Date(todaysShift.endTime);
    const minutesRemaining = differenceInMinutes(shiftEnd, today);
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = minutesRemaining % 60;
    return { hours, minutes };
  }, [isCurrentlyWorking, todaysShift, today]);

  // Format next shift date in a human-readable way
  const formatNextShiftDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  };

  // Get upcoming shifts for the next 7 days
  const upcomingShifts = useMemo(() => {
    if (!employeeData?.shifts) return [];
    
    return employeeData.shifts
    .filter((shift) => {
      const shiftDate = new Date(shift.startTime);
        // Get shifts from today (if not already working that shift) until 7 days from now
      return (
          ((isToday(shiftDate) && !isCurrentlyWorking) || isAfter(shiftDate, today)) &&
          isBefore(shiftDate, addDays(today, 7))
        );
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5) // Limit to 5 shifts
    .map((shift) => ({
        date: formatNextShiftDate(new Date(shift.startTime)),
        day: format(new Date(shift.startTime), "EEE"),
        fullDate: new Date(shift.startTime),
      shift: `${format(new Date(shift.startTime), "h:mm a")} - ${format(
        new Date(shift.endTime),
        "h:mm a"
      )}`,
        segments: shift.segments || [],
        duration: differenceInMinutes(new Date(shift.endTime), new Date(shift.startTime)) / 60
      }));
  }, [employeeData?.shifts, today, isCurrentlyWorking]);

  // Prepare calendar events
  const calendarEvents = useMemo(() => {
    if (!employeeData?.shifts) return [];
    
    return employeeData.shifts.map((shift) => ({
      title: `Shift: ${format(new Date(shift.startTime), "h:mm a")} - ${format(
        new Date(shift.endTime),
        "h:mm a"
      )}`,
      start: new Date(shift.startTime),
      end: new Date(shift.endTime),
      resource: shift.segments && shift.segments.length > 0 
        ? `${shift.segments.length} activities` 
        : "No activities"
    }));
  }, [employeeData?.shifts]);

  // Calculate weekly hours
  const thisWeekHours = useMemo(() => {
    if (!employeeData?.shifts) return 0;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    return employeeData.shifts
      .filter(shift => {
        const shiftStart = new Date(shift.startTime);
        return shiftStart >= startOfWeek && shiftStart <= endOfWeek;
      })
      .reduce((total, shift) => {
        const start = new Date(shift.startTime);
        const end = new Date(shift.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
  }, [employeeData?.shifts, today]);
  
  // Loading state - after all hooks have been declared
  if (!employeeData) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6 p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-77.8C58.9,-69.3,69.3,-56.3,76.7,-42.1C84.1,-27.9,88.6,-13.9,87.4,-0.7C86.2,12.6,79.3,25.1,71.2,37.1C63.1,49.1,53.8,60.6,41.9,68.9C30,77.2,15,82.4,0.2,82.1C-14.7,81.8,-29.4,76,-42.5,67.4C-55.6,58.8,-67.1,47.4,-74.3,33.7C-81.6,20,-84.7,4,-82.4,-11.1C-80.1,-26.2,-72.4,-40.5,-61.6,-50.2C-50.8,-59.9,-37,-65,-24,-70.6C-11,-76.2,1.1,-82.3,14.4,-83C27.7,-83.6,41.1,-78.9,45.7,-77.8Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hello, {userName.split(' ')[0]}
            </h1>
            <p className="opacity-90 text-sm">
              {format(today, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
            <FiClock className="mr-2 text-white/80" />
            <div>
              <p className="text-sm font-medium">This Week's Hours</p>
              <p className="text-lg font-bold">{thisWeekHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-full p-1 inline-flex">
          <button
            onClick={() => setSelectedView("schedule")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedView === "schedule" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setSelectedView("details")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedView === "details" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Personal Details
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {selectedView === "schedule" ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Current Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`rounded-xl shadow-sm p-5 ${
                  isCurrentlyWorking 
                    ? "bg-green-50 border border-green-100" 
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {isCurrentlyWorking ? "Currently Working" : "Today's Status"}
                  </h2>
                  {isCurrentlyWorking ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <FiCheck className="mr-1" size={12} />
                      Active
                    </span>
                  ) : todaysShift ? (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <FiClock className="mr-1" size={12} />
                      Scheduled
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <FiInfo className="mr-1" size={12} />
                      Off
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {isCurrentlyWorking ? "Current Shift" : "Today"}
                  </div>
                  <div className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiClock className="mr-2 text-gray-400" size={18} />
                    {currentShiftTime}
                  </div>
                </div>
                
                {isCurrentlyWorking && timeRemainingInShift && (
                  <div className="mt-4 bg-white rounded-lg p-3 border border-green-100">
                    <div className="text-sm text-gray-500 mb-1">Remaining Time</div>
                    <div className="flex items-center text-green-700 font-semibold">
                      <FiArrowRight className="mr-2" />
                      {timeRemainingInShift.hours}h {timeRemainingInShift.minutes}m
                    </div>
                  </div>
                )}
        </motion.div>

              {/* Next Shift Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Next Shift</h2>
                  <button
                    onClick={() => setShowNextShifts(!showNextShifts)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    {showNextShifts ? "Hide" : "View"} more
                    {showNextShifts ? <FiChevronLeft size={16} className="ml-1" /> : <FiChevronRight size={16} className="ml-1" />}
                  </button>
                </div>
                
                {nextShift ? (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatNextShiftDate(new Date(nextShift.startTime))}
                    </div>
                    <div className="text-xl font-semibold text-gray-800 flex items-center">
                      <FiCalendar className="mr-2 text-gray-400" size={18} />
                      {format(new Date(nextShift.startTime), "h:mm a")} - {format(new Date(nextShift.endTime), "h:mm a")}
                    </div>
                    
                    <AnimatePresence>
                      {showNextShifts && upcomingShifts.length > 1 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="text-sm font-medium text-gray-700 mb-2">Upcoming Shifts</div>
                          <div className="space-y-2">
                            {upcomingShifts.slice(1).map((shift, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
                                    {shift.day.charAt(0)}
                                  </div>
                                  <span className="text-gray-700">{shift.date}</span>
                                </div>
                                <span className="text-gray-600 font-medium">{shift.shift}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FiCalendar size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No upcoming shifts scheduled</p>
                  </div>
          )}
        </motion.div>
              
              {/* Shift Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Summary</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Total Hours</div>
                    <div className="text-xl font-semibold text-gray-800">
                      {thisWeekHours.toFixed(1)} hours
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Shifts This Week</div>
                    <div className="text-xl font-semibold text-gray-800">
                      {upcomingShifts.length} shifts
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Average Shift Length</div>
                    <div className="text-xl font-semibold text-gray-800">
                      {upcomingShifts.length > 0 
                        ? (upcomingShifts.reduce((acc, shift) => acc + shift.duration, 0) / upcomingShifts.length).toFixed(1) 
                        : 0} hours
                    </div>
                  </div>
                </div>
              </motion.div>
      </div>

            {/* Schedule Builder Component - Added here */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 px-5 py-4 border-b border-gray-100 flex items-center">
                <FiEdit size={16} className="mr-2 text-blue-500" />
                Schedule Builder
              </h2>
              <div className="schedule-builder-container">
                <ScheduleBuilderComponent />
              </div>
            </motion.div>
            
            {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"
      >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Calendar</h2>
              <div className="calendar-container" style={{ height: 500 }}>
        <Calendar
          localizer={localizer}
                  events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
                  views={["month", "week", "day"]}
          popup
                  className="modern-calendar"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Employee Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiUser className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-800">{userName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiBriefcase className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-800">{employeeData.department || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiMapPin className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-800">{employeeData.location || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-4">Schedule Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-sm text-gray-500">Total Shifts</p>
                      <p className="text-xl font-semibold text-blue-700">{employeeData.shifts.length}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-sm text-gray-500">Avg. Hours/Week</p>
                      <p className="text-xl font-semibold text-blue-700">
                        {(thisWeekHours / 7 * 5).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5 h-full">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                    <p className="font-medium text-gray-800">{employeeData.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <div className="flex items-center space-x-2">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                        <FiMail className="mr-1" size={14} />
                        Email
                      </button>
                      <button className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                        <FiPhone className="mr-1" size={14} />
                        Call
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Quick Actions</p>
                    <div className="space-y-2">
                      <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors">
                        Request time off
                        <FiChevronRight size={16} />
                      </button>
                      <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors">
                        Report availability
                        <FiChevronRight size={16} />
                      </button>
                      <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors">
                        Request shift swap
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </motion.div>
        )}
      </AnimatePresence>
      
      {/* Custom styles for the calendar */}
      <style jsx global>{`
        .modern-calendar {
          font-family: inherit;
          border: none !important;
        }
        .modern-calendar .rbc-header {
          padding: 10px 3px;
          font-weight: 500;
          font-size: 0.85rem;
          color: #4B5563;
        }
        .modern-calendar .rbc-date-cell {
          padding: 4px 5px 0;
          font-size: 0.85rem;
          color: #4B5563;
        }
        .modern-calendar .rbc-today {
          background-color: rgba(59, 130, 246, 0.05);
        }
        .modern-calendar .rbc-month-view {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }
        .modern-calendar .rbc-event {
          background-color: #3B82F6;
          border-radius: 4px;
          border: none;
          padding: 2px 5px;
          font-size: 0.75rem;
        }
        .modern-calendar .rbc-event.rbc-selected {
          background-color: #2563EB;
        }
        .modern-calendar .rbc-toolbar button {
          color: #4B5563;
          border-color: #E5E7EB;
          border-radius: 6px;
        }
        .modern-calendar .rbc-toolbar button.rbc-active {
          background-color: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
        
        /* Schedule Builder Styling */
        .schedule-builder-container {
          overflow: hidden;
          border-top: 0;
          max-height: 600px;
        }
        
        .schedule-builder-container > div {
          height: auto !important;
          padding: 0;
          overflow: auto;
        }
        
        /* Hide the original header from the schedule builder */
        .schedule-builder-container :global(.bg-gradient-to-r.from-blue-600.to-blue-700) {
          display: none;
        }
        
        /* Adjust padding and spacing for the builder content */
        .schedule-builder-container :global(.max-w-7xl) {
          padding: 0;
          margin: 0;
        }
        
        /* Fix spacing in the schedule builder */
        .schedule-builder-container :global(.py-6) {
          padding-top: 1rem;
          padding-bottom: 0;
        }
        
        /* Ensure the timeline doesn't create extra space */
        .schedule-builder-container :global(.flex.flex-col.space-y-6) {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
