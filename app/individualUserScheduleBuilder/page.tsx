"use client";
import React, { useState } from "react";
import WeekDayToggle from "./weekDayToggle";
import ShiftMenu from "./shiftMenu";
import Timeline from "./timeline";
import styles from "./Page.module.css";
import { useShiftManagement } from "./hooks/useShiftManagement";
import { useUserShifts } from "./hooks/useUserShift";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "./helper/helper";


export default function Page() {


  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentMonday, setCurrentMonday] = useState<Date>(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(defaultSelectedDay);
  const grid_height = 100;
  const { userShifts } = useUserShifts();

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
   * take the user shifts, the current Monday, and the selected day as inputs, 
   * and then process those to return all the relevant shift and segment information
   * shift and segment info passed to timeline component to render
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
        />

        <div className={styles.rightPanel}>
          <ShiftMenu 
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}/>
        </div>
      </div>
    </div>
  );
}
