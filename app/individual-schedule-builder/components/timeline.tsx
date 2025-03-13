import React from "react";
import ShiftBox from "./shiftBox";
import { useContainerWidth } from "../hooks/useContainerWidth";
import styles from "../styles/Timeline.module.css";
import { Entity, Shift } from "@/types/types";

interface TimelineProps {
  snapToGrid: boolean;
  shiftSegments: any[];
  matchingShift: any;
  initialX: number;
  initialWidth: number;
  shiftStartTime: Date | null;
  shiftEndTime: Date | null;
  gridHeight: number;
  readOnly: boolean;
  onShiftSave: (shiftId: string, updatedData: Partial<Shift>) => void;
  entities: Entity[],
}

export default function Timeline({
  snapToGrid,
  shiftSegments,
  matchingShift,
  initialX,
  initialWidth,
  shiftStartTime,
  shiftEndTime,
  gridHeight,
  entities,
  readOnly = false,
  onShiftSave,
}: TimelineProps) {
  const { containerRef, width: containerWidth } = useContainerWidth();
  const numTicks = Math.floor(containerWidth / 25) + 1;

  return (
    <div
      ref={containerRef}
      className={styles.timelineContainer}
      style={{ height: gridHeight }} // gridHeight is dynamic
    >
      {Array.from({ length: numTicks }).map((_, i) => {
        const leftPos = i * 25;
        let hourLabel = null;
        if (i % 4 === 0) {
          const computedHour = 9 + i / 4;
          if (computedHour <= 22) {
            // Compute 12-hour format hour
            const displayHour = computedHour > 12 ? computedHour - 12 : computedHour;
            // Determine AM/PM period
            const period = computedHour < 12 ? "am" : "pm";
            hourLabel = `${displayHour} ${period}`;
          }
        }
        return (
          <div key={i}>
            <div
              className={
                i % 4 === 0 ? styles.gridLineMajor : styles.gridLineMinor
              }
              style={{ left: leftPos }} // left is dynamic
            />
            {hourLabel !== null && (
              <span
                className={styles.hourLabel}
                style={{ left: leftPos }} // left is dynamic
              >
                {hourLabel}
              </span>
            )}
          </div>
        );
      })}
      {matchingShift && (
        <ShiftBox
          key={matchingShift.id}
          shiftId={matchingShift.id}
          snapToGrid={snapToGrid}
          segments={shiftSegments}
          initialX={initialX}
          initialWidth={initialWidth}
          startTime={shiftStartTime!}
          endTime={shiftEndTime!}
          readOnly={readOnly}
          onSaveShiftChanges={onShiftSave}
          entities={entities}
        />
      )}
    </div>
  );
}
