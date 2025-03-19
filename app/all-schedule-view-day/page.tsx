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
import styles from "@/app/individual-schedule-builder/styles/Timeline.module.css";

export default function Page() {
  // Fetch all employees with their shifts.
  const { employees, loading, error } = useAllEmployeesShifts();

  const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  // New state for filters.
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

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

  // Derive unique departments and locations from the employee list.
  const uniqueDepartments = [...new Set(employees.map((emp) => emp.department))];
  const uniqueLocations = [...new Set(employees.map((emp) => emp.location))];

  // Filter the employees based on the selected department and location.
  const filteredEmployees = employees.filter((employee) => {
    if (filterDepartment && employee.department !== filterDepartment) return false;
    if (filterLocation && employee.location !== filterLocation) return false;
    return true;
  });

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

      {/* Filters UI */}
      <div className="filters" style={{ margin: "1rem 0" }}>
        <label style={{ marginRight: "1rem" }}>
          Department:
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">All</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location:
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">All</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Render employee timelines based on filtered results */}
      {filteredEmployees.map((employee) => (
        <div
          key={`${employee.id}-${selectedDay}`}
          className={`${styles.shiftAnimation} pointer-events-none cursor-default`}
        >
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
