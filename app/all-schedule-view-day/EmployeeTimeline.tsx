import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { useShiftManagement } from "@/app/individual-schedule-builder/hooks/useShiftManagement";
import { Employee } from "@/types/types";

interface EmployeeTimelineProps {
  employee: Employee;
  currentMonday: Date;
  selectedDay: string;
}

export default function EmployeeTimeline({
  employee,
  currentMonday,
  selectedDay,
}: EmployeeTimelineProps) {


  const snapToGrid = true;
  const grid_height = 100;
  const readOnly = true;

  // Memoize the processed shifts to avoid new references on every render
  const employeeShifts = useMemo(() => {
    return employee.shifts.map((shift) => ({
      ...shift,
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      segments: shift.segments.map((segment) => ({
        ...segment,
        startTime: new Date(segment.startTime),
        endTime: new Date(segment.endTime),
      })),
    }));
  }, [employee.shifts]);

  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
  } = useShiftManagement(employeeShifts, currentMonday, selectedDay);

  return (
    <div style={{ position: "relative" }}>
      <small
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          padding: "4px",
          backgroundColor: "rgba(255, 255, 255, 0.0)",
          zIndex: 10, // This ensures the name stays on top
        }}
      >
        {employee.name}
      </small>
      {/* Wrap the Timeline in a div with a left margin to shift it right */}
      <div style={{ marginLeft: "60px" }}>
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
      </div>
    </div>
  );
}
