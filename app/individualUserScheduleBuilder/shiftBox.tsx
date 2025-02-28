"use client";
import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import SegmentBox from "./segmentBox";
import { FaPlus } from "react-icons/fa";

interface Segment {
  id: string;
  label: string;
  start: number; 
  end: number; 
  color: string;
}

interface ShiftBoxProps {
  snapToGrid: boolean;
  segments?: Segment[];
  initialX?: number;
  initialWidth?: number;
  startTime: Date;
  endTime: Date;
}

const SHIFT_HEIGHT = 100;
const MINUTES_PER_PIXEL = 0.6; // 1px equals 0.6 minutes

const ShiftBox: React.FC<ShiftBoxProps> = ({
  snapToGrid,
  segments = [],
  initialX = 0,
  initialWidth = 200,
  startTime,
  endTime,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [width, setWidth] = useState(initialWidth);
  const [position, setPosition] = useState({ x: initialX, y: 0 });
  const [localSegments, setLocalSegments] = useState<Segment[]>(segments);

  const grid: [number, number] | undefined = snapToGrid ? [25, 25] : undefined;

  // DRAG: update the position state
  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: 0 });
  };

  // RESIZE: update width while dragging
  const handleResize = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    setWidth(data.size.width);
  };

  // RESIZE STOP: snap width and update width state
  const handleResizeStop = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    let newWidth = data.size.width;
    if (snapToGrid) {
      newWidth = Math.round(newWidth / 25) * 25;
    }
    setWidth(newWidth);
  };

  const handleAddSegment = () => {
    // Find the first available space for a new segment
    const existingSegments = localSegments.sort((a, b) => a.start - b.start);
    let newStart = 0;
    for (const seg of existingSegments) {
      if (seg.start >= newStart + 60) break;
      newStart = seg.end;
    }
    const newSeg: Segment = {
      id: "seg-" + Date.now(),
      label: "Segment",
      start: newStart,
      end: newStart + 60,
      color: "#ffefc3",
    };
    setLocalSegments((prev) => [...prev, newSeg]);
  };

  // Update a segment's start and end positions (in px)
  const handleSegmentUpdate = (id: string, newStart: number, newEnd: number) => {
    setLocalSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, start: newStart, end: newEnd } : s))
    );
  };

  // Calculate dynamic start and end times based on drag and width.
  // The shift's displayed start time is updated by how far it has been dragged
  // from its initial position, and the duration is determined by its current width.
  const dynamicStartTime = new Date(
    startTime.getTime() + (position.x - initialX) * MINUTES_PER_PIXEL * 60000
  );
  const dynamicEndTime = new Date(
    dynamicStartTime.getTime() + width * MINUTES_PER_PIXEL * 60000
  );

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      grid={grid}
      position={position}
      onDrag={handleDrag}
      onStop={handleDrag}
      handle=".shift-drag-handle"
      cancel=".react-resizable-handle, .segment-container"
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          height: SHIFT_HEIGHT,
          width,
        }}
      >
        <ResizableBox
          width={width}
          height={SHIFT_HEIGHT}
          axis="x"
          resizeHandles={["e"]}
          minConstraints={[150, SHIFT_HEIGHT]}
          maxConstraints={[1000, SHIFT_HEIGHT]}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
        >
          {/* SHIFT container */}
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#d0d7db",
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* SHIFT header/drag handle with dynamic times */}
            <div
              className="shift-drag-handle"
              style={{
                height: 30,
                background: "#b0b0b0",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                cursor: "move",
              }}
            >
              <span style={{ marginRight: "auto" }}>
              {dynamicStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {dynamicEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={handleAddSegment}>
                <FaPlus />
              </button>
            </div>

            {/* SHIFT content area where segments appear */}
            <div style={{ position: "relative", height: SHIFT_HEIGHT - 30 }}>
              {localSegments.map((seg) => (
                <SegmentBox
                  key={seg.id}
                  segment={seg}
                  snapToGrid={snapToGrid}
                  onUpdate={handleSegmentUpdate}
                  className="segment-container"
                />
              ))}
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default ShiftBox;
