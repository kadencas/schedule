"use client";
import React, { useState } from "react";
import { useAllEntitiesShifts } from "./useAllEntities";
import EntityTimeline from "./EntityTimeline"; 
import WeekDayToggle from "@/app/individual-schedule-builder/components/weekDayToggle";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "@/app/individual-schedule-builder/helper/helper";

export default function Page() {
  const { entities, loading, error } = useAllEntitiesShifts(); // ✅ Fetch entities instead of employees
  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);

  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  if (loading) {
    return <p>Loading entities...</p>; // ✅ Updated label
  }

  if (error) {
    return <p>Error loading entities: {error.message}</p>; // ✅ Updated label
  }

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
        <div key={entity.id}>
          <EntityTimeline
            entity={entity} // ✅ Pass entity instead of employee
            currentMonday={currentMonday}
            selectedDay={selectedDay}
          />
        </div>
      ))}
    </div>
  );
}
