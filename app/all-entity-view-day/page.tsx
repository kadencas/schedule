"use client";
import React, { useState } from "react";
import entityTimeline from "./entityTimeline"
import WeekDayToggle from "@/app/individual-schedule-builder/components/weekDayToggle";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "@/app/individual-schedule-builder/helper/helper";

export default function Page() {
  const { entities, loading, error } = useAllEntities();
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
    return <p>Loading entities...</p>;
  }

  if (error) {
    return <p>Error loading entities: {error.message}</p>;
  }

  return (
    <div className="">
      <WeekDayToggle
        currentMonday={currentMonday}
        formattedMondayDate={formattedMondayDate}
        handlePreviousWeek={handlePreviousWeek}
        handleNextWeek={handleNextWeek}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      {entities.map((entity) => (
        <div key={employee.id} className="">
          <EmployeeTimeline
            employee={entity}
            currentMonday={currentMonday}
            selectedDay={selectedDay}
          />
        </div>
      ))}
    </div>
  );
}
