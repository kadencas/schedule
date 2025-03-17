"use client";
import React, { useState, useRef } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import SegmentBox from "./segmentBox";
import { FaCheck, FaPlus, FaUser } from "react-icons/fa";
import { MdDragHandle } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';
import { Entity, Segment, Shift } from "@/types/types";
import { FaRepeat } from "react-icons/fa6";
import ShiftBoxMenu from "./shiftBoxMenu";
import ReactDOM from "react-dom";


interface ShiftBoxProps {
  snapToGrid: boolean;
  segments?: Segment[];
  initialX?: number;
  initialWidth?: number;
  startTime: Date;
  endTime: Date;
  shiftId: string;
  readOnly: boolean;
  entities: Entity[],
  isRecurring: boolean;
  recurrenceRule: string;
  onSaveShiftChanges?: (shiftId: string, updatedData: Partial<Shift>) => void;
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
  shiftId,
  entities,
  isRecurring,
  recurrenceRule,
  readOnly = false,
  onSaveShiftChanges,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [width, setWidth] = useState(initialWidth);
  const [position, setPosition] = useState({ x: initialX, y: 0 });
  const [localSegments, setLocalSegments] = useState<Segment[]>(segments);
  // Dirty flag for unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const [localIsRecurring, setLocalIsRecurring] = useState(isRecurring);
  const [localRecurrenceRule, setLocalRecurrenceRule] = useState(recurrenceRule);
  const [isRecurrenceMenuOpen, setIsRecurrenceMenuOpen] = useState(false);

  const grid: [number, number] | undefined = snapToGrid ? [25, 25] : undefined;

  const handleRecurrenceChange = (newRule: string | null, recurring: boolean) => {
    setLocalIsRecurring(recurring);
    // Use an empty string or null as per backend expectations
    setLocalRecurrenceRule(newRule || "");
  };


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
      location: "",
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

  const handleColorUpdate = (id: string, newColor: string) => {
    setLocalSegments((prev) => {
      const updated = prev.map((seg) =>
        seg.id === id ? { ...seg, color: newColor } : seg
      );
      return updated;
    });
    setHasChanges(true);
  };

  const handleEntityUpdate = (id: string, newEntity: Entity) => {
    setLocalSegments((prev) =>
      prev.map((seg) =>
        seg.id === id ? { ...seg, entity: newEntity } : seg
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    const payload = {
      shiftId,
      startTime: dynamicStartTime.toISOString(),
      endTime: dynamicEndTime.toISOString(),
      isRecurring: localIsRecurring,
      recurrenceRule: localRecurrenceRule,
      segments: localSegments.map((seg) => ({
        id: seg.id,
        startTime: new Date(dynamicStartTime.getTime() + seg.start * 60000).toISOString(),
        endTime: new Date(dynamicStartTime.getTime() + seg.end * 60000).toISOString(),
        segmentType: seg.label || "default",
        location: seg.location,
        notes: "",
        color: seg.color,
        entityId: seg.entity ? seg.entity.id : null,
      })),
    };

    try {
      const response = await fetch("/api/updateshiftwithsegments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      // Reset the dirty flag after a successful save

      if (onSaveShiftChanges) {
        onSaveShiftChanges(shiftId, payload);
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  const maxSegmentEndPx =
    localSegments.length > 0 ? Math.max(...localSegments.map((seg) => seg.end)) / 0.6 : 0;

  const repeatIconRef = useRef<HTMLSpanElement>(null);

  let menuStyle: React.CSSProperties = {};
  if (repeatIconRef.current) {
    const rect = repeatIconRef.current.getBoundingClientRect();
    menuStyle = {
      position: "absolute",
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      zIndex: 9999, // make sure it's on top
    };
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      grid={grid}
      position={position}
      onDrag={!readOnly ? handleDrag : undefined}
      onStop={!readOnly ? handleDrag : undefined}
      handle=".shift-drag-handle"
      cancel=".react-resizable-handle, .segment-container"
      disabled={readOnly} // disables dragging when readOnly is true
    >
      <div ref={nodeRef} className="absolute h-[100px]" style={{ width }}>
        <ResizableBox
          width={width}
          height={SHIFT_HEIGHT}
          axis="x"
          resizeHandles={readOnly ? [] : ["e"]} // no handles if readOnly
          minConstraints={[150, SHIFT_HEIGHT]}
          maxConstraints={[1000, SHIFT_HEIGHT]}
          onResize={!readOnly ? handleResize : undefined}
          onResizeStop={!readOnly ? handleResizeStop : undefined}
        >
          {/* SHIFT container */}
          <div className="w-full h-full bg-gray-300 bg-opacity-60 rounded-md overflow-hidden relative">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 rounded text-xs flex"
              >
                <FaCheck size={16} className="mr-1" />
                Save
              </button>
            )}
            <div className="shift-drag-handle h-[30px] bg-gray-700 flex items-center px-2 cursor-move">
              <span><FaUser size={16} className="mr-2 text-white" /></span>

              <div className="relative">
                <span className="block text-white text-md">
                  {dynamicStartTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                  -{" "}
                  {dynamicEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {localIsRecurring && (
                  <span ref={repeatIconRef} /* span so we can attach the ref */
                    style={{ position: "absolute", top: 0, right: -15 }}>
                    <FaRepeat
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRecurrenceMenuOpen(true);
                      }}
                      style={{ color: "yellow", fontSize: "0.8rem", cursor: "pointer" }}
                    />
                  </span>
                )}
                {!readOnly && isRecurrenceMenuOpen && ReactDOM.createPortal(
                  <ShiftBoxMenu
                    isRecurring={localIsRecurring}
                    recurrenceRule={localRecurrenceRule}
                    onRecurrenceChange={handleRecurrenceChange}
                    onClose={() => setIsRecurrenceMenuOpen(false)}
                    style={menuStyle}
                  />,
                  document.body
                )}
              </div>

              {!readOnly && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                  <MdDragHandle size={15} />
                </div>
              )}
            </div>
            <div className="relative h-[70px]">
              {localSegments.map((seg) => (
                <SegmentBox
                  key={seg.id}
                  segment={seg}
                  snapToGrid={snapToGrid}
                  onUpdate={handleSegmentUpdate}
                  onColorUpdate={handleColorUpdate}
                  className="segment-container"
                  onLabelUpdate={handleLabelUpdate}
                  shiftStartTime={dynamicStartTime}
                  minutesPerPixel={MINUTES_PER_PIXEL}
                  onDelete={handleDeleteSegment}
                  readOnly={readOnly}
                  entities={entities}
                  onEntityUpdate={handleEntityUpdate}
                />
              ))}
              <button
                onClick={handleAddSegment}
                style={{
                  position: "absolute",
                  left: `${maxSegmentEndPx + 10}px`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                className="text-grey rounded-full p-1"
              >
                {!readOnly && (
                  <FaPlus size={12} />
                )}
              </button>
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default ShiftBox;
