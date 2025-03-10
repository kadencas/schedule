"use client";
import React, { useState } from "react";
import WeekDayToggle from "./components/weekDayToggle";
import ShiftMenu from "./components/shiftMenu";
import Timeline from "./components/timeline";
import styles from "./styles/Page.module.css"
import { useShiftManagement } from "./hooks/useShiftManagement";
import { useUserShifts } from "./hooks/useUserShift";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "./helper/helper";
import { useSession } from "next-auth/react";

export default function Page() {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentMonday, setCurrentMonday] = useState<Date>(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(defaultSelectedDay);
  const grid_height = 100;
  const { userShifts } = useUserShifts();
  const readOnly = false;
  const { data: session } = useSession();

  /**
   * Handles user clicking previous week button
   * Sets currentMonday to previous week's monday
   */
  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  /**
   * Handles user clicking next week button
   * Sets currentMonday to next week's monday
   */
  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  /**
   * Creates a new shift using the API endpoint.
   * The new shift uses the selected day (e.g., "Friday") added to the currentMonday date.
   * Default times: Start at 9:00 AM, End at 5:00 PM.
   * The userId is retrieved from the session.
   */
  const handleAddShift = async () => {
    // Ensure the user is authenticated
    if (!session || !session.user) {
      console.error("User not authenticated");
      return;
    }

    // Map weekday names to their offset from Monday (0 = Monday, 1 = Tuesday, etc.)
    const dayOffsets: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const offset = dayOffsets[selectedDay];
    if (offset === undefined) {
      console.error("Invalid selected day:", selectedDay);
      return;
    }

    // Compute the correct shift date by adding the offset to currentMonday.
    const shiftDateObj = new Date(currentMonday);
    shiftDateObj.setDate(shiftDateObj.getDate() + offset);

    // Set default start time at 9:00 AM.
    const startTime = new Date(shiftDateObj);
    startTime.setHours(9, 0, 0, 0);

    // Set default end time at 5:00 PM.
    const endTime = new Date(shiftDateObj);
    endTime.setHours(17, 0, 0, 0);

    // Use the authenticated user's id from the session.
    const userId = session.user.id;

    const shiftData = {
      userId,
      shiftDate: shiftDateObj.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isRecurring: false,
      recurrenceRule: null,
      recurrenceEndDate: null,
      notes: "",
    };

    try {
      const response = await fetch("/api/shifts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) {
        throw new Error("Failed to create shift");
      }
      const data = await response.json();
      // Optionally: Refresh shifts or update local state as needed.
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  /**
   * Process shifts and segments for the Timeline component.
   */
  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
    newSegmentLabel,
    setNewSegmentLabel,
    newSegmentStart,
    setNewSegmentStart,
    newSegmentEnd,
    setNewSegmentEnd,
    newSegmentColor,
    setNewSegmentColor,
    handleCreateSegment,
  } = useShiftManagement(userShifts, currentMonday, selectedDay);

  return (
    <div className={styles.container}>
      <WeekDayToggle
        currentMonday={currentMonday}
        formattedMondayDate={formattedMondayDate}
        handlePreviousWeek={handlePreviousWeek}
        handleNextWeek={handleNextWeek}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />

      <div className={styles.mainLayout}>
        <Timeline
          snapToGrid={snapToGrid}
          shiftSegments={shiftSegments}
          matchingShift={matchingShift}
          initialX={initialX}
          initialWidth={initialWidth}
          shiftStartTime={shiftStartTime}
          shiftEndTime={shiftEndTime}
          gridHeight={grid_height}
          readOnly={readOnly}
        />

        <div className={styles.rightPanel}>
          <ShiftMenu 
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            onAddShift={handleAddShift}
          />
        </div>
      </div>
    </div>
  );
}
