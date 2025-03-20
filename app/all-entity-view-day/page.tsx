"use client";
import React, { useState, useMemo } from "react";
import { useAllEntitiesShifts } from "./useAllEntities";
import EntityTimeline from "./entityTimeline";
import { defaultSelectedDay, formatMondayDate, getMostRecentMonday, getNextWeekMonday, getPreviousWeekMonday } from "../individual-schedule-builder/helper/helper";
import WeekDayToggle from "../individual-schedule-builder/components/weekDayToggle";
import { useAllEmployeesShifts } from "../all-schedule-view-day/useAllEmployeeShifts";
import { Shift, Employee } from "@/types/types";

export default function EntityShiftsPage() {
  const { entities, loading: entitiesLoading, error: entitiesError } = useAllEntitiesShifts();
  const { employees, loading: employeesLoading, error: employeesError } = useAllEmployeesShifts(); 

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);

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
    
    console.log(`Processed ${allShifts.length} total shifts from ${employees.length} employees`);
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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div>
      <WeekDayToggle
        currentMonday={currentMonday}
        formattedMondayDate={formattedMondayDate}
        handlePreviousWeek={handlePreviousWeek}
        handleNextWeek={handleNextWeek}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      {entities.map((entity) => (
        <div key={`${entity.id}-${selectedDay}`} className="">
          <EntityTimeline
            userShifts={allUserShifts}
            entity={entity}
            currentMonday={currentMonday}
            selectedDay={selectedDay}
          />
        </div>
      ))}
    </div>
  );
}