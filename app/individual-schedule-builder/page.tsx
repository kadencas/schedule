"use client";
import React, { useEffect, useState } from "react";
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
import { Shift } from "@/types/types";
import { useEntities } from "./hooks/useEntities";

export default function Page() {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentMonday, setCurrentMonday] = useState<Date>(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(defaultSelectedDay);
  const grid_height = 100;
  const { userShifts: fetchedUserShifts } = useUserShifts();
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const readOnly = false;
  const { data: session } = useSession();
  const {entities: entities} = useEntities();

  useEffect(() => {
    if (fetchedUserShifts) {
      setUserShifts(fetchedUserShifts);
    }
  }, [fetchedUserShifts]);

  function handleShiftChangesSaved(shiftId: string, updatedData: Partial<Shift>) {
    setUserShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === shiftId
          ? { ...shift, ...updatedData }
          : shift
      )
    );
  }

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
      entity: null,
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
      // Optionally: Refresh shifts or update local state as needed:
      // Merge into your existing userShifts



      const createdShift = data.shift;
      const newShift: Shift = {
        id: createdShift.id,
        userId: createdShift.userId,
        // shiftDate, startTime, endTime are ISO strings on the server
        shiftDate: new Date(createdShift.shiftDate),
        startTime: new Date(createdShift.startTime),
        endTime: new Date(createdShift.endTime),

        // If your server returns booleans/strings, just reuse them
        isRecurring: createdShift.isRecurring,
        recurrenceRule: createdShift.recurrenceRule,
        recurrenceEndDate: createdShift.recurrenceEndDate
          ? new Date(createdShift.recurrenceEndDate)
          : null,
        notes: createdShift.notes,

        // If server didn't return segments, just do an empty array
        segments: createdShift.segments || [],
      };

      // Now you have a well-typed "Shift" object with real Date objects
      // Add it to your local userShifts array
      setUserShifts((prevShifts) => [...prevShifts, newShift]);

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
          onShiftSave={handleShiftChangesSaved}
          entities={entities}
        />

        <div className={styles.rightPanel}>
          <ShiftMenu
            matchingShift={matchingShift}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            onAddShift={handleAddShift}
          />
        </div>
      </div>
    </div>
  );
}
