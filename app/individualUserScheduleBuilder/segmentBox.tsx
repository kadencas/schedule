"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { FaCheck, FaTimes } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";


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
  className?: string;
}

const SNAP_PX = 25; 

const SegmentBox: React.FC<SegmentBoxProps> = ({
  segment,
  snapToGrid,
  onUpdate,
  onLabelUpdate,
  onColorUpdate,
  className = "",
}) => {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const [leftPx, setLeftPx] = useState(segment.start);
  const [widthPx, setWidthPx] = useState(segment.end - segment.start);
  const [isEditing, setIsEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState(segment.label);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localColor, setLocalColor] = useState(segment.color);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Sync props
  useEffect(() => {
    setLeftPx(segment.start);
    setWidthPx(segment.end - segment.start);
    setLocalLabel(segment.label);
  }, [segment.start, segment.end, segment.label]);

  useEffect(() => {
    setLocalColor(segment.color);
  }, [segment.color]);

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    let newX = data.x;
    if (snapToGrid) {
      newX = Math.round(newX / SNAP_PX) * SNAP_PX;
    }
    setLeftPx(newX);
    onUpdate(segment.id, newX, newX + widthPx);
  };

  const handleResize = (e: React.SyntheticEvent, data: { size: { width: number } }) => {
    setWidthPx(data.size.width);
  };

  const handleResizeStop = (e: React.SyntheticEvent, data: { size: { width: number } }) => {
    let newWidth = data.size.width;
    if (snapToGrid) {
      newWidth = Math.round(newWidth / SNAP_PX) * SNAP_PX;
    }
    setWidthPx(newWidth);
    onUpdate(segment.id, leftPx, leftPx + newWidth);
  };

  // Label editing handlers.
  const handleLabelClick = () => {
    setIsEditing(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLabel(e.target.value);
  };

  const commitLabelChange = () => {
    setIsEditing(false);
    if (onLabelUpdate) {
      onLabelUpdate(segment.id, localLabel);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitLabelChange();
    } else if (e.key === "Escape") {
      setLocalLabel(segment.label);
      setIsEditing(false);
    }
  };

  // Color picker handlers.
  const toggleColorPicker = () => {
    if (!showColorPicker && colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setShowColorPicker((prev) => !prev);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value);
  };

  const commitColorChange = () => {
    if (onColorUpdate) {
      onColorUpdate(segment.id, localColor);
    }
    setShowColorPicker(false);
  };

  const cancelColorChange = () => {
    setLocalColor(segment.color);
    setShowColorPicker(false);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      axis="x"
      position={{ x: leftPx, y: 3 }}
      bounds="parent"
      onDrag={handleDrag}
      cancel=".react-resizable-handle"
    >
      <div
        ref={nodeRef}
        className={className}
        style={{
          position: "absolute",
          top: 0,
          height: 40,
        }}
      >
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
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: localColor,
              borderRadius: 4,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#000",
              position: "relative",
              cursor: "move",
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={localLabel}
                onChange={handleLabelChange}
                onBlur={commitLabelChange}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  background: "transparent",
                }}
              />
            ) : (
              <span onClick={handleLabelClick}>{localLabel}</span>
            )}
            <button
              ref={colorButtonRef}
              onClick={toggleColorPicker}
              style={{
                position: "absolute",
                top: 2,
                left: 2,
                background: "rgba(255,255,255,0)",
                border: "none",
                borderRadius: "50%",
                width: 15,
                height: 15,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CiMenuKebab size={10} />
            </button>
            {showColorPicker &&
              ReactDOM.createPortal(
                <div
                  style={{
                    position: "fixed",
                    top: pickerPosition.top,
                    left: pickerPosition.left,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    padding: 4,
                    zIndex: 1000,
                  }}
                >
                  <input
                    type="color"
                    value={localColor}
                    onChange={handleColorChange}
                    style={{ cursor: "pointer" }}
                  />
                  <div style={{ marginTop: 4, textAlign: "right" }}>
                    <button onClick={commitColorChange} style={{ marginRight: 4, background: "transparent", border: "none", cursor: "pointer" }}>
                      <FaCheck size={12} />
                    </button>
                    <button onClick={cancelColorChange} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default SegmentBox;

