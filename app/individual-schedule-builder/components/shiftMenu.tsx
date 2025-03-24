"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiPlus, FiGrid, FiToggleRight } from "react-icons/fi";

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3"
    >
      {/* Modern Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <FiGrid className="mr-2" size={14} />
          <span>Snap to Grid</span>
        </div>
        <button 
          onClick={toggleSnapToGrid}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
            snapToGrid ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              snapToGrid ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="border-t border-gray-100 my-1"></div>
      
      {/* Add Shift Button */}
      {!matchingShift && (
        <motion.button
          onClick={onAddShift}
          whileHover={{ backgroundColor: '#3b82f6', y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center w-full px-3 py-2 rounded-md 
            bg-blue-500 text-white font-medium text-sm transition-all"
        >
          <FiPlus className="mr-1.5" size={16} />
          Add Shift
        </motion.button>
      )}
      
      {matchingShift && (
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-500 mb-1">Shift Details</div>
          <div className="text-sm text-gray-700">
            {new Date(matchingShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            {new Date(matchingShift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShiftMenu;
