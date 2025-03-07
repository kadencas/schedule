// useShiftManagement.ts
import { useState, useEffect } from "react";
import { days } from "../helper/helper";

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
}

interface ShiftTimesState {
  matchingShift: any;           
  shiftStartTime: Date | null;
  shiftEndTime: Date | null;
  initialX: number;
  initialWidth: number;
}

export function useShiftManagement(
  userShifts: any,
  currentMonday: Date,
  selectedDay: string
) {
  const [shiftSegments, setShiftSegments] = useState<Segment[]>([]);
  const [newSegmentLabel, setNewSegmentLabel] = useState("");
  const [newSegmentStart, setNewSegmentStart] = useState(30);
  const [newSegmentEnd, setNewSegmentEnd] = useState(60);
  const [newSegmentColor, setNewSegmentColor] = useState("#ffc4d6");
  const [shiftTimes, setShiftTimes] = useState<ShiftTimesState>({
    matchingShift: null,
    shiftStartTime: null,
    shiftEndTime: null,
    initialX: 0,
    initialWidth: 100,
  });

  console.log(userShifts);

  // Update shiftSegments AND compute time/position in one effect
  useEffect(() => {
    console.log("selectedDay changed:", selectedDay);

    // 1) Figure out which date corresponds to the selectedDay
    const dayIndex = days.indexOf(selectedDay);
    const selectedDate = new Date(currentMonday);
    selectedDate.setDate(currentMonday.getDate() + dayIndex);
    const selectedDateString = selectedDate.toISOString().split("T")[0];

    // 2) Find the matching shift
    const matchingShift = userShifts.find((shift: any) => {
      const shiftDateString = new Date(shift.shiftDate)
        .toISOString()
        .split("T")[0];
      return shiftDateString === selectedDateString;
    });

    // 3) Build the segments array for this matching shift (or empty if none)
    if (matchingShift) {
      const shiftStart = new Date(matchingShift.startTime);
      console.log(matchingShift.startTime); //raw time
      console.log(shiftStart); // javaScript's data object auto converts to EST


      // Map the segments from the matching shift
      const mappedSegments = matchingShift.segments.map((seg: any) => {
        const segStart = new Date(seg.startTime);
        const segEnd = new Date(seg.endTime);
        const startMinutes = Math.round(
          (segStart.getTime() - shiftStart.getTime()) / 60000
        );
        const endMinutes = Math.round(
          (segEnd.getTime() - shiftStart.getTime()) / 60000
        );
        return {
          id: seg.id,
          label: seg.segmentType,
          start: startMinutes,
          end: endMinutes,
          color: seg.color,
        };
      });

      setShiftSegments(mappedSegments);
    } else {
      setShiftSegments([]);
    }

    // 4) Compute time/position values (shiftStartTime, shiftEndTime, initialX, initialWidth)
    let shiftStartTime: Date | null = null;
    let shiftEndTime: Date | null = null;
    let initialX = 0;
    let initialWidth = 100;

    if (matchingShift) {
      const shiftStart = new Date(matchingShift.startTime);
      const shiftEnd = new Date(matchingShift.endTime);

      // Baseline = 9:00 AM on the same day as shiftStart
      const baseline = new Date(shiftStart);
      baseline.setHours(9, 0, 0, 0);

      // 1px = 0.6 minutes => diff in minutes from baseline to shiftStart
      const diffStartMinutes =
        (shiftStart.getTime() - baseline.getTime()) / 60000;
      initialX = diffStartMinutes / 0.6;

      // Shift length in minutes
      const diffShiftMinutes =
        (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
      initialWidth = diffShiftMinutes / 0.6;

      // If you want actual start/end times from baseline
      shiftStartTime = new Date(
        baseline.getTime() + initialX * 0.6 * 60000
      );
      shiftEndTime = new Date(
        baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000
      );
    }

    // 5) Update local state with these new values
    setShiftTimes({
      matchingShift,
      shiftStartTime,
      shiftEndTime,
      initialX,
      initialWidth,
    });
  }, [userShifts, currentMonday, selectedDay]);

  // Segment Handlers
  const handleAddSegment = (
    label: string,
    start: number,
    end: number,
    color: string
  ) => {
    const newSegment: Segment = {
      id: `seg-${Date.now()}`,
      label,
      start,
      end,
      color,
    };
    setShiftSegments((prev) => [...prev, newSegment]);
  };

  const handleCreateSegment = () => {
    if (!newSegmentLabel.trim()) {
      alert("Please enter a label for the segment.");
      return;
    }
    if (newSegmentStart >= newSegmentEnd) {
      alert("Start time must be less than end time.");
      return;
    }
    handleAddSegment(
      newSegmentLabel,
      newSegmentStart,
      newSegmentEnd,
      newSegmentColor
    );
    setNewSegmentLabel("");
    setNewSegmentStart(30);
    setNewSegmentEnd(60);
    setNewSegmentColor("#ffc4d6");
  };

  console.log(shiftTimes);

  // Now return everything we need, including times from shiftTimes state
  return {
    shiftSegments,

    // Form fields
    newSegmentLabel,
    setNewSegmentLabel,
    newSegmentStart,
    setNewSegmentStart,
    newSegmentEnd,
    setNewSegmentEnd,
    newSegmentColor,
    setNewSegmentColor,
    handleCreateSegment,

    // Times (and matchingShift) from shiftTimes state
    matchingShift: shiftTimes.matchingShift,
    shiftStartTime: shiftTimes.shiftStartTime,
    shiftEndTime: shiftTimes.shiftEndTime,
    initialX: shiftTimes.initialX,
    initialWidth: shiftTimes.initialWidth,
  };
}
