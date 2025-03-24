"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAllEntitiesShifts } from "./useAllEntities";
import EntityTimeline from "./entityTimeline";
import { defaultSelectedDay, formatMondayDate, getMostRecentMonday, getNextWeekMonday, getPreviousWeekMonday, days } from "../individual-schedule-builder/helper/helper";
import WeekDayToggle from "../individual-schedule-builder/components/weekDayToggle";
import { useAllEmployeesShifts } from "../all-schedule-view-day/useAllEmployeeShifts";
import { Shift, Employee, Entity } from "@/types/types";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiInfo, FiFilter, FiX } from "react-icons/fi";
import styles from "@/app/individual-schedule-builder/styles/Timeline.module.css";
import { useEntities } from "../individual-schedule-builder/hooks/useEntities";

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
      {/* Empty space to align with entity info column */}
      <div className="w-[75px] flex-shrink-0 pr-1"></div>
      
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
                  className="absolute transform -translate-x-1/2 text-[10px] text-gray-500 font-medium"
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

export default function EntityShiftsPage() {
  const { entities, loading: entitiesLoading, error: entitiesError } = useAllEntitiesShifts();
  const { employees, loading: employeesLoading, error: employeesError } = useAllEmployeesShifts(); 

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  
  // Animation state
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Update the selectedDay handler to include animation
  const handleDayChange = (day: string) => {
    // Determine direction based on current and new day
    const currentIndex = days.indexOf(selectedDay);
    const newIndex = days.indexOf(day);
    
    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? "left" : "right");
    } else {
      setDirection("right"); // Default direction
    }
    
    setAnimationKey(prev => prev + 1);
    setSelectedDay(day);
  };

  // Week navigation with animation
  const handlePreviousWeek = () => {
    setDirection("right");
    setAnimationKey(prev => prev + 1);
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  const handleNextWeek = () => {
    setDirection("left");
    setAnimationKey(prev => prev + 1);
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      transition: { 
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
      opacity: 0,
      transition: {
        x: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }
    })
  };
  
  // Get all unique entity types for the filter
  const entityTypes = useMemo(() => {
    if (!entities) return [];
    
    const types = new Set<string>();
    entities.forEach(entity => {
      if (entity.type) {
        types.add(entity.type);
      }
    });
    
    return Array.from(types).sort();
  }, [entities]);
  
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

  const formattedMondayDate = formatMondayDate(currentMonday);

  const isLoading = entitiesLoading || employeesLoading;
  const error = entitiesError || employeesError;

  // Clear type filter
  const clearTypeFilter = () => {
    setTypeFilter(null);
    setShowTypeFilter(false);
  };

  // Filter entities based on search term and type
  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    
    return entities.filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (entity.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || entity.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, typeFilter]);

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
    <div className="w-full mx-auto p-0.5 md:p-1">
      {/* Week Day Toggle */}
      <div className="bg-white rounded-xl shadow-sm mb-1 overflow-hidden">
        <WeekDayToggle
          currentMonday={currentMonday}
          formattedMondayDate={formattedMondayDate}
          handlePreviousWeek={handlePreviousWeek}
          handleNextWeek={handleNextWeek}
          selectedDay={selectedDay}
          setSelectedDay={handleDayChange}
        />
      </div>
      
      {/* Combined Search/Filter and Timelines Container */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Search and Filter */}
        <div className="p-2">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-grow sm:max-w-sm">
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
            
            {/* Filter button */}
            <div className="relative">
              <button 
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className={`p-2 rounded-md ${typeFilter ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} flex items-center`}
                title="Filter by type"
              >
                <FiFilter size={16} />
                {typeFilter && (
                  <span className="ml-1 text-xs font-medium hidden sm:inline">
                    {typeFilter}
                  </span>
                )}
              </button>
              
              {/* Filter dropdown */}
              {showTypeFilter && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-48 py-1">
                  <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
                    Filter by Type
                  </div>
                  
                  {typeFilter && (
                    <button 
                      onClick={clearTypeFilter}
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FiX size={14} className="mr-2" />
                      Clear Filter
                    </button>
                  )}
                  
                  {entityTypes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No types available
                    </div>
                  ) : (
                    entityTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setTypeFilter(type);
                          setShowTypeFilter(false);
                        }}
                        className={`px-3 py-2 text-sm w-full text-left hover:bg-gray-50 ${type === typeFilter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        {type}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Active filter indicator */}
            {typeFilter && (
              <div className="flex items-center text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
                <span className="mr-1">{typeFilter}</span>
                <button 
                  onClick={clearTypeFilter}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Entity Timelines */}
        <div className="p-2">
          {filteredEntities.length === 0 ? (
            <div className="text-center py-6">
              <FiInfo size={40} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-gray-600 font-medium mb-1">No entities found</h3>
              <p className="text-sm text-gray-500">
                {typeFilter ? `No ${typeFilter} entities found.` : 'Try a different search term'}
                {typeFilter && ' Try clearing your filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-visible space-y-1">
              {/* Add TimelineHeader above the first timeline */}
              <TimelineHeader />
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`timeline-container-${selectedDay}-${animationKey}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-1 overflow-visible"
                >
                  {filteredEntities.map((entity: Entity, index: number) => (
                    <motion.div
                      key={`${entity.id}-${selectedDay}`}
                      custom={direction}
                      variants={itemVariants}
                      className="bg-white overflow-visible pt-2"
                    >
                      <EntityTimeline
                        userShifts={allUserShifts}
                        entity={entity}
                        currentMonday={currentMonday}
                        selectedDay={selectedDay}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}