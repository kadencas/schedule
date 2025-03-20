"use client";
import React, { useState, useMemo } from "react";
import { useAllEntitiesShifts } from "./useAllEntities";
import EntityTimeline from "./entityTimeline";
import { defaultSelectedDay, formatMondayDate, getMostRecentMonday, getNextWeekMonday, getPreviousWeekMonday } from "../individual-schedule-builder/helper/helper";
import WeekDayToggle from "../individual-schedule-builder/components/weekDayToggle";
import { useAllEmployeesShifts } from "../all-schedule-view-day/useAllEmployeeShifts";
import { Shift, Employee, Entity } from "@/types/types";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiGrid, FiList, FiInfo } from "react-icons/fi";

export default function EntityShiftsPage() {
  const { entities, loading: entitiesLoading, error: entitiesError } = useAllEntitiesShifts();
  const { employees, loading: employeesLoading, error: employeesError } = useAllEmployeesShifts(); 

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showEmptyEntities, setShowEmptyEntities] = useState(false);

  // Process all shifts from all employees into a flat array
  const allUserShifts = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    
    // Flatten all shifts from all employees
    const allShifts: Shift[] = [];
    
    employees.forEach((employee: Employee) => {
      if (employee.shifts && employee.shifts.length > 0) {
        // Process each shift to ensure date objects
        const processedShifts = employee.shifts.map((shift: any) => ({
          ...shift,
          startTime: new Date(shift.startTime),
          endTime: new Date(shift.endTime),
          segments: shift.segments.map((segment: any) => ({
            ...segment,
            startTime: new Date(segment.startTime),
            endTime: new Date(segment.endTime),
          })),
          // Add username to help with debugging
          userName: employee.name 
        }));
        
        allShifts.push(...processedShifts);
      }
    });
    
    return allShifts;
  }, [employees]);

  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  const isLoading = entitiesLoading || employeesLoading;
  const error = entitiesError || employeesError;

  // Filter entities based on search term and whether they have shifts
  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    
    return entities
      .filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (entity.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(entity => showEmptyEntities || entity.entity_shifts.length > 0);
  }, [entities, searchTerm, showEmptyEntities]);

  // Loading state with animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading entity schedules...</p>
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
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Entity Schedule View</h1>
        <p className="text-sm text-gray-500">View all entities and their scheduled activities</p>
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
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 items-center self-end">
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
            
            {/* Show empty entities toggle */}
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showEmptyEntities}
                onChange={() => setShowEmptyEntities(!showEmptyEntities)}
                className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2">Show all entities</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Entity Timelines */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        {filteredEntities.length === 0 ? (
          <div className="text-center py-6">
            <FiInfo size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-gray-600 font-medium mb-1">No entities found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? "Try a different search term or " : ""}
              {!showEmptyEntities ? "enable 'Show all entities' to see entities without schedules" : "create some entities first"}
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
            <AnimatePresence>
              {filteredEntities.map((entity: Entity) => (
                <motion.div
                  key={`${entity.id}-${selectedDay}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-b last:border-b-0 border-gray-100 pb-2 last:pb-0"
                >
                  <EntityTimeline
                    userShifts={allUserShifts}
                    entity={entity}
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