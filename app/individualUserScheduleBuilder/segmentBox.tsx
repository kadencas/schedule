"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { FaCheck, FaPencilAlt, FaTimes } from "react-icons/fa";
import { MdDelete, MdDragHandle } from "react-icons/md";

interface SegmentData {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
}

interface SegmentBoxProps {
  segment: SegmentData;
  snapToGrid: boolean;
  onUpdate: (id: string, newStart: number, newEnd: number) => void;
  onLabelUpdate?: (id: string, newLabel: string) => void;
  onColorUpdate?: (id: string, newColor: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  shiftStartTime?: Date;
  minutesPerPixel?: number;
}

const SNAP_PX = 25;

const SegmentBox: React.FC<SegmentBoxProps> = ({
  segment,
  snapToGrid,
  onUpdate,
  onLabelUpdate,
  onColorUpdate,
  onDelete,
  className = "",
  shiftStartTime,
  minutesPerPixel,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const [leftPx, setLeftPx] = useState(segment.start);
  const [widthPx, setWidthPx] = useState(segment.end - segment.start);
  const [showEditor, setShowEditor] = useState(false);
  const [localLabel, setLocalLabel] = useState(segment.label);
  const [localColor, setLocalColor] = useState(segment.color);

  // Preset color options (6 distinct choices)
  const colorOptions = [
    "#6BA0E5", // Brighter Blue
    "#7ACF8F", // Brighter Green
    "#FFA1A1", // Brighter Coral
    "#FFD27F", // Brighter Yellow
    "#BAA1E0", // Brighter Purple
    "#77D3D3"  // Brighter Teal
  ];

  // Sync with props
  useEffect(() => {
    setLeftPx(segment.start);
    setWidthPx(segment.end - segment.start);
    setLocalLabel(segment.label);
  }, [segment.start, segment.end, segment.label]);

  useEffect(() => {
    setLocalColor(segment.color);
  }, [segment.color]);

  // DRAG: update position state and notify parent
  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    let newX = data.x;
    if (snapToGrid) {
      newX = Math.round(newX / SNAP_PX) * SNAP_PX;
    }
    setLeftPx(newX);
    onUpdate(segment.id, newX, newX + widthPx);
  };

  // RESIZE: update width during drag
  const handleResize = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    setWidthPx(data.size.width);
    onUpdate(segment.id, leftPx, leftPx + data.size.width);
  };

  // RESIZE STOP: snap width and update parent state
  const handleResizeStop = (_: React.SyntheticEvent, data: { size: { width: number } }) => {
    let newWidth = data.size.width;
    if (snapToGrid) {
      newWidth = Math.round(newWidth / SNAP_PX) * SNAP_PX;
    }
    setWidthPx(newWidth);
    onUpdate(segment.id, leftPx, leftPx + newWidth);
  };

  // Toggle the editor for the segment name and color.
  const toggleEditor = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dragging when clicking the edit button
    setShowEditor((prev) => !prev);
  };

  // Commit both label and color changes
  const commitChanges = () => {
    if (onLabelUpdate) onLabelUpdate(segment.id, localLabel);
    if (onColorUpdate) onColorUpdate(segment.id, localColor);
    setShowEditor(false);
  };

  const cancelChanges = () => {
    setLocalLabel(segment.label);
    setLocalColor(segment.color);
    setShowEditor(false);
  };

  // Delete handler
  const handleDelete = () => {
    if (onDelete) {
      onDelete(segment.id);
    } else {
      console.log(`Delete segment ${segment.id}`);
    }
  };

  const rect = editButtonRef.current?.getBoundingClientRect();
const popupStyle = {
  top: rect ? rect.bottom + window.scrollY : 0,
  left: rect ? rect.left + window.scrollX : 0,
};

  // Calculate the segment's start and end times based on left position and width.
  let segmentStartTimeStr: string | undefined;
  let segmentEndTimeStr: string | undefined;
  if (shiftStartTime && minutesPerPixel) {
    const segStart = new Date(shiftStartTime.getTime() + leftPx * minutesPerPixel * 60000);
    segmentStartTimeStr = segStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const segEnd = new Date(shiftStartTime.getTime() + (leftPx + widthPx) * minutesPerPixel * 60000);
    segmentEndTimeStr = segEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      position={{ x: leftPx, y: 3 }}
      bounds="parent"
      onDrag={handleDrag}
      cancel=".react-resizable-handle"
    >
      <div ref={nodeRef} className={`${className} absolute top-0 h-10`}>
        <ResizableBox
          width={widthPx}
          height={64}
          axis="x"
          resizeHandles={["e"]}
          minConstraints={[30, 40]}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          handleSize={[8, 8]}
        >
          <div
            className="w-full h-full rounded shadow-lg flex items-center justify-center text-sm font-semibold text-black relative cursor-move"
            style={{ backgroundColor: localColor }}
          >
            <span>{localLabel}</span>
            {/* Delete button in top left */}
            <button
              onClick={handleDelete}
              className="absolute top-1 left-1 bg-transparent border-0 rounded-full cursor-pointer p-0 flex items-center justify-center"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MdDelete size={17} />
            </button>
            {/* Edit button in top right to open label/color editor */}
            <button
              ref={editButtonRef}
              onClick={toggleEditor}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-1 right-1 bg-transparent border-0 rounded-full w-4 h-4 cursor-pointer p-0 flex items-center justify-center"
            >
              <FaPencilAlt size={14} className="text-white-500" />
            </button>
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <MdDragHandle size={15} />
            </div>
            {showEditor &&
              ReactDOM.createPortal(
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  style={popupStyle}
                  className="fixed bg-white border border-gray-300 rounded p-2 z-[1000]"
                >
                  {/* Input to update the label */}
                  <input
                    type="text"
                    value={localLabel}
                    onChange={(e) => setLocalLabel(e.target.value)}
                    className="mb-2 block border border-gray-300 rounded px-1 py-0.5 w-full"
                    placeholder="Segment name"
                  />
                  {/* Preset color options */}
                  <div className="flex space-x-2 mb-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setLocalColor(color)}
                        style={{
                          backgroundColor: color,
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          border: localColor === color ? "2px solid black" : "1px solid #ccc",
                        }}
                        className="cursor-pointer"
                      />
                    ))}
                  </div>
                  <div className="text-right">
                    <button onClick={commitChanges} className="mr-1 bg-transparent border-0 cursor-pointer">
                      <FaCheck size={12} />
                    </button>
                    <button onClick={cancelChanges} className="bg-transparent border-0 cursor-pointer">
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>,
                document.body
              )}
            {/* Display segment's time range */}
            {segmentStartTimeStr && segmentEndTimeStr && (
              <div className="absolute bottom-1 text-[10px] text-gray-600">
                {`${segmentStartTimeStr} - ${segmentEndTimeStr}`}
              </div>
            )}
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default SegmentBox;
