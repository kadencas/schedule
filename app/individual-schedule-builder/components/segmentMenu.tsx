"use client";
import React, { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { LuClock, LuLampDesk, LuBookOpen } from "react-icons/lu";
import { TbBeach } from "react-icons/tb";
import { PiBooksFill } from "react-icons/pi";
import { Entity } from "@/types/types";
import { BiSortZA } from "react-icons/bi";
import { MdToys } from "react-icons/md";

interface SegmentEditorMenuProps {
  popupStyle: React.CSSProperties;
  localLabel: string;
  entities: Entity[];
  onLabelChange: (value: string) => void;
  localColor: string;
  onColorChange: (color: string) => void;
  onEntityChange: (entity: Entity) => void;
  colorOptions: string[];
  onCommit: () => void;
  onCancel: () => void;
}

// If you already have this mapping in another file, you can import it.
// Otherwise, define it here:
const iconMap = {
  LuLampDesk,
  LuBookOpen,
  LuClock,
  TbBeach,
  PiBooksFill,
  BiSortZA,
  MdToys,
};

const SegmentEditorMenu: React.FC<SegmentEditorMenuProps> = ({
  popupStyle,
  localLabel,
  entities,
  onLabelChange,
  localColor,
  onColorChange,
  onEntityChange,
  colorOptions,
  onCommit,
  onCancel,
}) => {
  // Track which entity the user has selected
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={popupStyle}
      className="fixed bg-white border border-gray-300 rounded p-2 z-[1000]"
    >
      {/* Entity Selection List */}
      <div className="mb-2 max-h-40 overflow-y-auto border border-gray-200 rounded">
        {entities.map((entity) => {
          // Resolve the icon component if available
          const EntityIcon = entity.icon ? iconMap[entity.icon] : null;
          const isSelected = selectedEntityId === entity.id;

          return (
            <div
              key={entity.id}
              onClick={() => {
                setSelectedEntityId(entity.id);
                onEntityChange(entity);
                onColorChange(entity.color);
              }}
              className={`flex items-center space-x-2 p-1 cursor-pointer ${
                isSelected ? "bg-gray-200" : ""
              }`}
            >
              {EntityIcon && <EntityIcon size={16} />}
              <span>{entity.name}</span>
            </div>
          );
        })}
      </div>

      {/* Label for Custom Color & Text */}
      <div className="mb-2 font-semibold">Custom Color & Text:</div>

      {/* Segment Name Input */}
      <input
        type="text"
        value={localLabel}
        onChange={(e) => onLabelChange(e.target.value)}
        className="mb-2 block border border-gray-300 rounded px-1 py-0.5 w-full"
        placeholder="Segment name"
      />

      {/* Color Selection Buttons */}
      <div className="flex space-x-2 mb-2">
        {colorOptions.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
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

      {/* Action Buttons */}
      <div className="text-right">
        <button
          onClick={onCommit}
          className="mr-1 bg-transparent border-0 cursor-pointer"
        >
          <FaCheck size={12} />
        </button>
        <button
          onClick={onCancel}
          className="bg-transparent border-0 cursor-pointer"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
};

export default SegmentEditorMenu;
