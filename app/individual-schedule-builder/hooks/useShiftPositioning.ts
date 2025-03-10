// useShiftPositioning.ts
import { useMemo } from "react";

export function useShiftPositioning(matchingShift: any) {
  let shiftStartTime: Date | null = null;
  let shiftEndTime: Date | null = null;
  let initialX = 0;
  let initialWidth = 100; // default values

  if (matchingShift) {
    const shiftStart = new Date(matchingShift.startTime);
    const shiftEnd = new Date(matchingShift.endTime);
    const baseline = new Date(shiftStart);
    baseline.setHours(9, 0, 0, 0);

    const diffStartMinutes = (shiftStart.getTime() - baseline.getTime()) / 60000;
    initialX = diffStartMinutes / 0.6;

    const diffShiftMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
    initialWidth = diffShiftMinutes / 0.6;

    shiftStartTime = new Date(baseline.getTime() + initialX * 0.6 * 60000);
    shiftEndTime = new Date(baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000);
  }

  return { initialX, initialWidth, shiftStartTime, shiftEndTime };
}

