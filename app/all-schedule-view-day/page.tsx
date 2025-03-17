"use client";
import React, { useState } from "react";
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

export default function Page() {

  // instead of getting one array of shifts, we go get all employees, and all of their shifts. 
  const { employees, loading, error } = useAllEmployeesShifts();


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
    return <p>Loading employees...</p>;
  }

  if (error) {
    return <p>Error loading employees: {error.message}</p>;
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
      {employees.map((employee) => (
        <div key={employee.id} className="">
          <EmployeeTimeline
            employee={employee}
            currentMonday={currentMonday}
            selectedDay={selectedDay}
          />
        </div>
      ))}
    </div>
  );
}
