import React from "react";
import ShiftBox from "./shiftBox";
import { useContainerWidth } from "./hooks/useContainerWidth";
import styles from "./Timeline.module.css";

interface TimelineProps {
  snapToGrid: boolean;
  shiftSegments: any[];
  matchingShift: any;
  initialX: number;
  initialWidth: number;
  shiftStartTime: Date | null;
  shiftEndTime: Date | null;
  gridHeight: number;
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
            hourLabel = computedHour > 12 ? computedHour - 12 : computedHour;
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
          snapToGrid={snapToGrid}
          segments={shiftSegments}
          initialX={initialX}
          initialWidth={initialWidth}
          startTime={shiftStartTime!}
          endTime={shiftEndTime!}
        />
      )}
    </div>
  );
}
