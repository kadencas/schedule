"use client";
import React, { useState } from "react";
import { useAllEntitiesShifts } from "./useAllEntities";
import EntityTimeline from "./entityTimeline";
import { defaultSelectedDay, formatMondayDate, getMostRecentMonday, getNextWeekMonday, getPreviousWeekMonday } from "../individual-schedule-builder/helper/helper";

export default function EntityShiftsPage() {
  const { entities, loading, error } = useAllEntitiesShifts();

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
    const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  
    const handlePreviousWeek = () => {
      setCurrentMonday(getPreviousWeekMonday(currentMonday));
    };
  
    const handleNextWeek = () => {
      setCurrentMonday(getNextWeekMonday(currentMonday));
    };
  
    const formattedMondayDate = formatMondayDate(currentMonday);

  if (loading) return <p>Loading entity shifts...</p>;
  if (error) return <p>Error loading entity shifts: {error.message}</p>;

  return (
    <div>
      {entities.map((entity) => (
  <div key={entity.id} className="">
    <EntityTimeline
      entity={entity}
      currentMonday={currentMonday}
      selectedDay={selectedDay}
    />
  </div>
))}
    </div>
  );
}