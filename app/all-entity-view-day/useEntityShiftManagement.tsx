// useEntityShiftManagement.ts
import { useState, useEffect } from "react";
import { days } from "../individual-schedule-builder/helper/helper";
import { Segment, Shift } from "@/types/types";
import { RRule } from "rrule";

interface ShiftTimesState {
  matchingShift: Shift | null;
  shiftStartTime: Date | null;
  shiftEndTime: Date | null;
  initialX: number;
  initialWidth: number;
}

export function useEntityShiftManagement(
  userShifts: Shift[],
  entityShifts: Shift[],
  currentMonday: Date,
  selectedDay: string
) {
  const [shiftSegments, setShiftSegments] = useState<Segment[]>([]);
  const [shiftTimes, setShiftTimes] = useState<ShiftTimesState>({
    matchingShift: null,
    shiftStartTime: null,
    shiftEndTime: null,
    initialX: 0,
    initialWidth: 100,
  });

  useEffect(() => {
    // 1) Compute the selected date based on currentMonday and selectedDay.
    const dayIndex = days.indexOf(selectedDay);
    const selectedDate = new Date(currentMonday);
    selectedDate.setDate(currentMonday.getDate() + dayIndex);

    // Helper function: checks if a shift occurs on the selected date (handling recurrence).
    function doesShiftOccurOn(shift: Shift, date: Date): boolean {
      if (!shift.isRecurring || !shift.recurrenceRule) {
        const shiftDate = new Date(shift.shiftDate);
        return shiftDate.toDateString() === date.toDateString();
      }
      try {
        const rule = RRule.fromString(shift.recurrenceRule);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        const occurrences = rule.between(startOfWeek, endOfWeek, true);
        return occurrences.some(
          (occurrence) => occurrence.toDateString() === date.toDateString()
        );
      } catch (err) {
        console.error("Invalid Recurrence Rule:", shift.recurrenceRule, err);
        return false;
      }
    }

    // 2) Find all matching user shifts for the selected date.
    const matchingUserShifts = userShifts.filter((shift) =>
      doesShiftOccurOn(shift, selectedDate)
    );

    // 3) Find a matching entity shift for the selected date.
    const matchingEntityShift = entityShifts.find((shift) =>
      doesShiftOccurOn(shift, selectedDate)
    );

    // 4) Build the combined shift if the entity shift exists.
    // Use the entity shift's metadata and merge segments from all matching user shifts
    // that have segments with entityId equal to the matching entity shift's entityId.
    let combinedShift: Shift | null = null;
    if (matchingEntityShift) {
      const combinedSegments = matchingUserShifts.flatMap((shift) =>
        shift.segments.filter((seg: any) => seg.entityId === matchingEntityShift.entityId)
      );
      combinedShift = {
        ...matchingEntityShift,
        segments: combinedSegments,
      };
    } else {
      combinedShift = null;
    }

    // 5) Map segments (which come from all matching user shifts) for timeline display.
    if (combinedShift) {
      const shiftStart = new Date(combinedShift.startTime);
      const mappedSegments = combinedShift.segments.map((seg: any) => {
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
          location: seg.location,
          entity: seg.entities,
        } as Segment;
      });
      setShiftSegments(mappedSegments);

      // 6) Compute visualization values (timeline positions) using the entity shift's timing.
      const shiftEnd = new Date(combinedShift.endTime);
      const baseline = new Date(shiftStart);
      baseline.setHours(9, 0, 0, 0);
      const diffStartMinutes = (shiftStart.getTime() - baseline.getTime()) / 60000;
      const initialX = diffStartMinutes / 0.6;
      const diffShiftMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
      const initialWidth = diffShiftMinutes / 0.6;
      const computedShiftStartTime = new Date(baseline.getTime() + initialX * 0.6 * 60000);
      const computedShiftEndTime = new Date(baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000);

      setShiftTimes({
        matchingShift: combinedShift,
        shiftStartTime: computedShiftStartTime,
        shiftEndTime: computedShiftEndTime,
        initialX,
        initialWidth,
      });
    } else {
      // If no valid matching shift, clear segments and shift times.
      setShiftSegments([]);
      setShiftTimes({
        matchingShift: null,
        shiftStartTime: null,
        shiftEndTime: null,
        initialX: 0,
        initialWidth: 100,
      });
    }
  }, [userShifts, entityShifts, currentMonday, selectedDay]);

  return {
    shiftSegments,
    matchingShift: shiftTimes.matchingShift,
    shiftStartTime: shiftTimes.shiftStartTime,
    shiftEndTime: shiftTimes.shiftEndTime,
    initialX: shiftTimes.initialX,
    initialWidth: shiftTimes.initialWidth,
  };
}
