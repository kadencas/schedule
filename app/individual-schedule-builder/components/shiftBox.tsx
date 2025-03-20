"use client";
import React, { useState, useRef, useEffect } from "react";
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
import { TbRepeat, TbRepeatOff } from "react-icons/tb";
import { RRule } from "rrule";


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
  user: string,
  onSaveShiftChanges?: (shiftId: string, updatedData: Partial<Shift>) => void;
  height?: number;
  onHeightChange?: (shiftId: string, newHeight: number) => void;
}

interface ShiftUpdatePayload {
  shiftId: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceRule: string;
  segments: {
    id: string;
    startTime: string;
    endTime: string;
    segmentType: string;
    location: string;
    notes: string;
    color: string;
    entities: any;
    entityId: any;
  }[];
}

const SHIFT_HEIGHT = 100;
const SEGMENT_HEIGHT = 70;
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
  user,
  readOnly = false,
  onSaveShiftChanges,
  height = SHIFT_HEIGHT,
  onHeightChange,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [width, setWidth] = useState(initialWidth);
  const [position, setPosition] = useState({ x: initialX, y: 0 });
  const [localSegments, setLocalSegments] = useState<Segment[]>(segments);
  const [segmentRows, setSegmentRows] = useState(1);
  const [segmentYPositions, setSegmentYPositions] = useState<Record<string, number>>({});

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
      label: " ",
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

  const getHumanReadableRRule = (ruleString: string) => {
    if (!ruleString) return "No recurrence rule specified";
    try {
      return RRule.fromString(ruleString).toText();
    } catch (error) {
      console.error("Failed to parse RRule string:", ruleString, error);
      // Fallback to the raw rule string or a default message
      return ruleString || "N/A";
    }
  };

  const handleSaveChanges = async () => {
    console.log("local segs to save", localSegments);
    const payload: ShiftUpdatePayload = {
      shiftId,
      startTime: dynamicStartTime.toISOString(),
      endTime: dynamicEndTime.toISOString(),
      isRecurring: localIsRecurring,
      recurrenceRule: localRecurrenceRule,
      segments: localSegments.map((seg) => ({
        id: seg.id,
        startTime: new Date(dynamicStartTime.getTime() + seg.start * 60000).toISOString(),
        endTime: new Date(dynamicStartTime.getTime() + seg.end * 60000).toISOString(),
        segmentType: seg.label || " ",
        location: seg.location || "default",
        notes: "",
        color: seg.color,
        entities: seg.entity || null,
        entityId: seg.entity?.id ?? null,
      })),
    };

    console.log("payload", payload);

    try {
      const response = await fetch("/api/updateshiftwithsegments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("API response:", data);


    

      if (onSaveShiftChanges) {
        onSaveShiftChanges(shiftId, payload);
      }

      // Update local state with the processed segments
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

  // Function to calculate segment layout and required height
  const calculateSegmentLayout = () => {
    if (localSegments.length === 0) return { rows: 1, segmentPositions: {} };

    // Sort segments by start time
    const sortedSegments = [...localSegments].sort((a, b) => a.start - b.start);
    
    // Track which row each segment should be placed in
    const segmentPositions: Record<string, number> = {};
    
    // Keep track of the end position of the last segment in each row
    const rowEndPositions: number[] = [];
    
    // Assign each segment to a row
    sortedSegments.forEach(segment => {
      // Find the first row where this segment doesn't overlap
      let rowIndex = 0;
      while (rowIndex < rowEndPositions.length) {
        if (segment.start >= rowEndPositions[rowIndex]) {
          // This row has space for the segment
          break;
        }
        rowIndex++;
      }
      
      // Place segment in this row
      segmentPositions[segment.id] = rowIndex;
      
      // Update the end position for this row
      rowEndPositions[rowIndex] = segment.end;
    });
    
    // Calculate required height based on number of rows
    const rows = Math.max(1, rowEndPositions.length);
    
    return { rows, segmentPositions };
  };

  // Update segment layout whenever segments change
  useEffect(() => {
    const { rows, segmentPositions } = calculateSegmentLayout();
    setSegmentRows(rows);
    setSegmentYPositions(segmentPositions);
  }, [localSegments]);

  // Calculate dynamic height based on number of rows
  const dynamicHeight = 30 + (segmentRows * SEGMENT_HEIGHT);

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange && dynamicHeight !== height) {
      onHeightChange(shiftId, dynamicHeight);
    }
  }, [dynamicHeight, shiftId, onHeightChange, height]);

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
      disabled={readOnly}
    >
      <div ref={nodeRef} className="absolute" style={{ width }}>
        <ResizableBox
          width={width}
          height={dynamicHeight}
          axis="x"
          resizeHandles={readOnly ? [] : ["e"]}
          minConstraints={[150, dynamicHeight]}
          maxConstraints={[1000, dynamicHeight]}
          onResize={!readOnly ? handleResize : undefined}
          onResizeStop={!readOnly ? handleResizeStop : undefined}
        >
          {/* SHIFT container */}
          <div className="w-full h-full bg-gray-300 bg-opacity-60 rounded-md overflow-hidden relative">
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
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

                <span ref={repeatIconRef} style={{ position: "absolute", top: 0, right: -15 }}>
                  {localIsRecurring ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRecurrenceMenuOpen(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        pointerEvents: "auto",
                      }}
                      title={`Repeats: ${getHumanReadableRRule(localRecurrenceRule)}`}
                    >
                      <TbRepeat style={{ color: "#2bff00", fontSize: "1rem",  transform: "translateX(2px) translateY(-2px)",}} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRecurrenceMenuOpen(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <TbRepeatOff
                        style={{
                          color: "grey",
                          fontSize: "1rem",
                          transform: "translateX(2px) translateY(-2px)", // shifts the icon right by 2px
                        }}
                      />
                    </button>
                  )}
                </span>

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
            <div className="relative" style={{ height: dynamicHeight - 30 }}>
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
                  user={(seg as any).user || user}
                  style={{
                    top: `${segmentYPositions[seg.id] * SEGMENT_HEIGHT}px`
                  }}
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
