"use client";
import React, { useState, useMemo } from "react";
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
import { FiSearch, FiFilter, FiGrid, FiList, FiInfo, FiUser, FiMapPin, FiBriefcase } from "react-icons/fi";
import { Employee } from "@/types/types";

export default function Page() {
  // Fetch all employees with their shifts
  const { employees, loading, error } = useAllEmployeesShifts();

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showEmptyEmployees, setShowEmptyEmployees] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    
    return employees
      .filter(employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (employee.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(employee => {
        if (filterDepartment && employee.department !== filterDepartment) return false;
        if (filterLocation && employee.location !== filterLocation) return false;
        return showEmptyEmployees || (employee.shifts && employee.shifts.length > 0);
      });
  }, [employees, searchTerm, filterDepartment, filterLocation, showEmptyEmployees]);

  // Get unique departments and locations for filters
  const uniqueDepartments = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  }, [employees]);
  
  const uniqueLocations = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(emp => emp.location).filter(Boolean))];
  }, [employees]);

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
    <div className="max-w-full mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Employee Schedule View</h1>
        <p className="text-sm text-gray-500">View all employees and their scheduled activities</p>
      </div>
      
      {/* Week Day Toggle */}
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <WeekDayToggle
          currentMonday={currentMonday}
          formattedMondayDate={formattedMondayDate}
          handlePreviousWeek={handlePreviousWeek}
          handleNextWeek={handleNextWeek}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-64">
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
          
          <div className="flex gap-2 items-center self-end">
            {/* Filter button */}
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className={`p-1.5 rounded-md border ${filtersVisible ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500 hover:text-gray-700'}`}
              title="Show filters"
            >
              <FiFilter size={16} />
            </button>
            
            {/* View mode toggle */}
            <div className="bg-gray-100 rounded-md p-1 flex items-center">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                title="List view"
              >
                <FiList size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                title="Grid view"
              >
                <FiGrid size={16} />
              </button>
            </div>
            
            {/* Show empty employees toggle */}
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showEmptyEmployees}
                onChange={() => setShowEmptyEmployees(!showEmptyEmployees)}
                className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2">Show all employees</span>
            </label>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <AnimatePresence>
          {filtersVisible && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBriefcase className="text-gray-400" size={14} />
                    </div>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-400" size={14} />
                    </div>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Employee Timelines */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-6">
            <FiInfo size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-gray-600 font-medium mb-1">No employees found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterDepartment || filterLocation ? "Try different search or filter criteria" : ""}
              {!showEmptyEmployees ? " or enable 'Show all employees' to see employees without schedules" : ""}
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
            <AnimatePresence>
              {filteredEmployees.map((employee: Employee) => (
                <motion.div
                  key={`${employee.id}-${selectedDay}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-b last:border-b-0 border-gray-100 pb-2 last:pb-0"
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
