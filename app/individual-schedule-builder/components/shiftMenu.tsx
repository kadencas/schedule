"use client";
import React from "react";
import { motion } from "framer-motion";

interface ShiftMenuProps {
  snapToGrid: boolean;
  setSnapToGrid: (value: boolean) => void;
  onAddShift: () => void;
  matchingShift: any;
}

const ShiftMenu: React.FC<ShiftMenuProps> = ({
  snapToGrid,
  setSnapToGrid,
  onAddShift,
  matchingShift,
}) => {
  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4">Menu</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={toggleSnapToGrid}
            className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span className="text-gray-700 font-medium">
            Snap (15 min intervals)
          </span>
        </label>
        {!matchingShift && (
          <motion.button
            onClick={onAddShift}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full block px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all duration-200"
          >
            Add Shift
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ShiftMenu;
