"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShiftMenuProps {
  snapToGrid: boolean;
  setSnapToGrid: (value: boolean) => void;
}

const ShiftMenu: React.FC<ShiftMenuProps> = ({ snapToGrid, setSnapToGrid }) => {

  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className=" top-10 left-2 bg-white shadow-lg rounded-lg p-4 w-full z-50"
      >
        <h3 className="text-lg font-semibold mb-4">Menu</h3>

        <button
          onClick={toggleSnapToGrid}
          style={{
            display: "block",
            marginBottom: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          {snapToGrid ? "Disable Snap (15 mins)" : "Enable Snap (15 mins)"}
        </button>
      </motion.div>
    </>
  );
};

export default ShiftMenu;
