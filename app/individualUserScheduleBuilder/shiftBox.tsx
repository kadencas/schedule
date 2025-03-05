"use client";
import React, { useState, useRef } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import SegmentBox from "./segmentBox";
import { FaCheck, FaPlus, FaSave } from "react-icons/fa";
import { MdDragHandle } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';

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
  shiftId: string;
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
  shiftId
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [width, setWidth] = useState(initialWidth);
  const [position, setPosition] = useState({ x: initialX, y: 0 });
  const [localSegments, setLocalSegments] = useState<Segment[]>(segments);
  // Dirty flag for unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  const grid: [number, number] | undefined = snapToGrid ? [25, 25] : undefined;

  const handleLabelUpdate = (id: string, newLabel: string) => {
    setLocalSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, label: newLabel } : seg))
    );
    setHasChanges(true);
  };

  const handleDeleteSegment = (id: string) => {
    setLocalSegments((prevSegments) => prevSegments.filter((seg) => seg.id !== id));
    setHasChanges(true);
  };

  // DRAG: update the position state
  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: 0 });
    setHasChanges(true);
  };

  // RESIZE: update width while dragging
  const handleResize = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    setWidth(data.size.width);
    setHasChanges(true);
  };

  // RESIZE STOP: snap width and update width state
  const handleResizeStop = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    let newWidth = data.size.width;
    if (snapToGrid) {
      newWidth = Math.round(newWidth / 25) * 25;
    }
    setWidth(newWidth);
    setHasChanges(true);
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
      id: uuidv4(),
      label: "Segment",
      start: newStart,
      end: newStart + 100,
      color: "#ffffff",
    };
    setLocalSegments((prev) => [...prev, newSeg]);
    setHasChanges(true);
  };

  // Update a segment's start and end positions (in px)
  const handleSegmentUpdate = (id: string, newStart: number, newEnd: number) => {
    setLocalSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, start: newStart, end: newEnd } : s))
    );
    setHasChanges(true);
  };

  // Calculate dynamic start and end times based on the drag and width.
  const dynamicStartTime = new Date(
    startTime.getTime() + (position.x - initialX) * MINUTES_PER_PIXEL * 60000
  );
  const dynamicEndTime = new Date(
    dynamicStartTime.getTime() + width * MINUTES_PER_PIXEL * 60000
  );

  const handleSave = async () => {
    const payload = {
      shiftId,
      startTime: dynamicStartTime.toISOString(),
      endTime: dynamicEndTime.toISOString(),
      segments: localSegments.map((seg) => ({
        id: seg.id,
        startTime: new Date(dynamicStartTime.getTime() + seg.start * MINUTES_PER_PIXEL * 60000).toISOString(),
        endTime: new Date(dynamicStartTime.getTime() + seg.end * MINUTES_PER_PIXEL * 60000).toISOString(),
        segmentType: seg.label || "default",
        location: "",
        notes: "",
      })),
    };

    console.log("Payload", payload);

    try {
      const response = await fetch("/api/updateshiftwithsegments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Shift saved:", data);
      // Reset the dirty flag after a successful save
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  const maxSegmentEnd =
    localSegments.length > 0 ? Math.max(...localSegments.map((seg) => seg.end)) : 0;

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
      <div ref={nodeRef} className="absolute h-[100px]" style={{ width }}>
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
          <div className="w-full h-full bg-gray-300 bg-opacity-60 rounded-md overflow-hidden relative">
            {/* Only render the save button when changes have been made */}
            {hasChanges && (
              <button
                onClick={handleSave}
                className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 rounded text-xs flex"
              >
                <FaCheck size={16} className="mr-1" />
                Save
              </button>
            )}
            {/* SHIFT header/drag handle with dynamic times */}
            <div className="shift-drag-handle h-[30px] bg-gray-600 flex items-center px-2 cursor-move">
              <span className="mr-auto text-white text-sm">
                {dynamicStartTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {dynamicEndTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                <MdDragHandle size={15} />
              </div>
            </div>

            {/* SHIFT content area where segments appear */}
            <div className="relative h-[70px]">
              {localSegments.map((seg) => (
                <SegmentBox
                  key={seg.id}
                  segment={seg}
                  snapToGrid={snapToGrid}
                  onUpdate={handleSegmentUpdate}
                  className="segment-container"
                  onLabelUpdate={handleLabelUpdate}
                  shiftStartTime={dynamicStartTime}
                  minutesPerPixel={MINUTES_PER_PIXEL}
                  onDelete={handleDeleteSegment}
                />
              ))}
              <button
                onClick={handleAddSegment}
                style={{
                  position: "absolute",
                  left: `${maxSegmentEnd + 10}px`, // 10px margin after the furthest segment
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                className="text-grey rounded-full p-1"
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default ShiftBox;
