"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAllEmployeesShifts } from "./useAllEmployeeShifts";
import EmployeeTimeline from "./EmployeeTimeline";
import WeekDayToggle from "@/app/individual-schedule-builder/components/weekDayToggle";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "@/app/individual-schedule-builder/helper/helper";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiInfo, FiX } from "react-icons/fi";
import { Employee } from "@/types/types";
import styles from "@/app/individual-schedule-builder/styles/Timeline.module.css";

// TimelineHeader component to display hour labels
const TimelineHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width
    updateWidth();
    
    // Update on resize
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  const numTicks = Math.floor(containerWidth / 25) + 1;
  
  return (
    <div className="relative overflow-visible flex items-stretch h-6">
      {/* Empty space to align with employee info column */}
      <div className="w-[70px] flex-shrink-0 pr-2"></div>
      
      {/* Timeline header area */}
      <div 
        ref={containerRef} 
        className="flex-1 relative h-6 overflow-visible"
      >
        {/* Time grid lines and hour labels */}
        {Array.from({ length: numTicks }).map((_, i) => {
          const leftPos = i * 25;
          const isMajorTick = i % 4 === 0;
          
          if (isMajorTick) {
            // Only render hour labels and major ticks
            const hour = Math.floor(i / 4) + 9; // Starting from 9AM
            const displayHour = hour > 12 ? hour - 12 : hour;
            const amPm = hour >= 12 ? 'PM' : 'AM';
            const hourLabel = `${displayHour}${amPm}`;
            
            return (
              <div key={i}>
                {/* Time marker tick */}
                <div
                  className="absolute w-[1px] h-2 bg-blue-400/40 bottom-0"
                  style={{ left: leftPos }}
                />
                
                {/* Hour label */}
                <div
                  className="absolute transform -translate-x-1/2 text-[7px] text-gray-500 font-medium"
                  style={{ 
                    left: leftPos,
                    top: '0px',
                  }}
                >
                  {hourLabel}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default function Page() {
  // Fetch all employees with their shifts
  const { employees, loading, error } = useAllEmployeesShifts();

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);

  // Get unique departments for the filter
  const uniqueDepartments = useMemo(() => {
    if (!employees) return [];
    
    const departments = new Set<string>();
    employees.forEach(employee => {
      if (employee.department) {
        departments.add(employee.department);
      }
    });
    
    return Array.from(departments).sort();
  }, [employees]);

  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  // Clear department filter
  const clearDepartmentFilter = () => {
    setDepartmentFilter(null);
    setShowDepartmentFilter(false);
  };

  // Filter employees based on search term and department
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (employee.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (employee.location || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, departmentFilter]);

  // Loading state with animation
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading employee schedules...</p>
      </div>
    );
  }

  // Error state with helpful message
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto mt-8">
        <h3 className="text-red-700 font-medium mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-2">{error.message}</p>
        <p className="text-sm text-red-500">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-0.5 md:p-1">
      {/* Week Day Toggle */}
      <div className="bg-white rounded-xl shadow-sm mb-1 overflow-hidden">
        <WeekDayToggle
          currentMonday={currentMonday}
          formattedMondayDate={formattedMondayDate}
          handlePreviousWeek={handlePreviousWeek}
          handleNextWeek={handleNextWeek}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm mb-1 p-2">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-grow sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter button */}
          <div className="relative">
            <button 
              onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
              className={`p-2 rounded-md ${departmentFilter ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} flex items-center`}
              title="Filter by department"
            >
              <FiFilter size={16} />
              {departmentFilter && (
                <span className="ml-1 text-xs font-medium hidden sm:inline">
                  {departmentFilter}
                </span>
              )}
            </button>
            
            {/* Filter dropdown */}
            {showDepartmentFilter && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-48 py-1">
                <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
                  Filter by Department
                </div>
                
                {departmentFilter && (
                  <button 
                    onClick={clearDepartmentFilter}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <FiX size={14} className="mr-2" />
                    Clear Filter
                  </button>
                )}
                
                {uniqueDepartments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No departments available
                  </div>
                ) : (
                  uniqueDepartments.map(department => (
                    <button
                      key={department}
                      onClick={() => {
                        setDepartmentFilter(department);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-sm w-full text-left hover:bg-gray-50 ${department === departmentFilter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                    >
                      {department}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Active filter indicator */}
          {departmentFilter && (
            <div className="flex items-center text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
              <span className="mr-1">{departmentFilter}</span>
              <button 
                onClick={clearDepartmentFilter}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Employee Timelines - Minimalistic Version */}
      <div className="bg-white rounded-lg p-1">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-6">
            <FiInfo size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-gray-600 font-medium mb-1">No employees found</h3>
            <p className="text-sm text-gray-500">
              {departmentFilter ? `No ${departmentFilter} employees found.` : 'Try a different search term'}
              {departmentFilter && ' Try clearing your filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-visible space-y-1">
            {/* Add TimelineHeader above the first timeline */}
            <TimelineHeader />
            
            <AnimatePresence>
              {filteredEmployees.map((employee: Employee, index: number) => (
                <motion.div
                  key={`${employee.id}-${selectedDay}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white overflow-visible pt-2"
                >
                  <EmployeeTimeline
                    employee={employee}
                    currentMonday={currentMonday}
                    selectedDay={selectedDay}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
