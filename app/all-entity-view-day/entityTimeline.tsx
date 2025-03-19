import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { useShiftManagement } from "@/app/individual-schedule-builder/hooks/useShiftManagement";
import { Entity } from "@/types/types";
import { useEntityShiftManagement } from "./useEntityShiftManagement";

interface EntityTimelineProps {
  entity: Entity;
  currentMonday: Date;
  selectedDay: string;
  userShifts: any[];
}

export default function EntityTimeline({
  entity,
  currentMonday,
  selectedDay,
  userShifts,
}: EntityTimelineProps) {

  console.log("entity", entity)
  console.log("userShifts", userShifts)

  const snapToGrid = true;
  const grid_height = 100;
  const readOnly = true;

  // Memoize the processed shifts to avoid unnecessary re-renders
  const entityShifts = useMemo(() => {
    return entity.entity_shifts.map((shift) => ({
      ...shift,
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      segments: shift.segments.map((segment) => ({
        ...segment,
        startTime: new Date(segment.startTime),
        endTime: new Date(segment.endTime),
      })),
    }));
  }, [entity.entity_shifts]);

  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
  } = useEntityShiftManagement(userShifts, entityShifts, currentMonday, selectedDay);
  console.log("matching entity shift", matchingShift)

  return (
    <div style={{ position: "relative" }}>
      <small
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          padding: "4px",
          backgroundColor: "rgba(255, 255, 255, 0.0)",
          zIndex: 10, // Ensures name stays on top
        }}
      >
        {entity.name}
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
