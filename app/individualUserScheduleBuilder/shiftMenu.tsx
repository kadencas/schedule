"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ShiftMenu: React.FC = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    // Add deletion logic here.
    console.log("Shift deleted");
    setShowDeleteConfirm(false);
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
        <h3 className="text-lg font-semibold mb-4">Shift Options</h3>
        <div className="space-y-4">
          {/* Pay Type Dropdown */}
          <div>
            <label htmlFor="payType" className="block text-sm font-medium text-gray-700">
              Pay Type
            </label>
            <select
              id="payType"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="regular">Regular</option>
              <option value="overtime">Overtime</option>
            </select>
          </div>

          {/* Repeat Shift with Day Selectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Repeat Shift?</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex items-center">
                  <input
                    id={`day-${day}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`day-${day}`} className="ml-1 text-xs text-gray-900">
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Repeat Week Selector */}
          <div>
            <label htmlFor="repeatWeek" className="block text-sm font-medium text-gray-700">
              Repeat Week?
            </label>
            <select
              id="repeatWeek"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">None</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi Weekly (starting this week)</option>
              <option value="monthly">Monthly (starting this week)</option>
            </select>
          </div>

          {/* Edit Time Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Edit Time</label>
            <div className="mt-1 space-y-2">
              <div>
                <label htmlFor="startTime" className="block text-xs font-medium text-gray-600">
                  Start Time
                </label>
                <input
                  id="startTime"
                  type="text"
                  placeholder="e.g., 9:00 AM"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-xs font-medium text-gray-600">
                  End Time
                </label>
                <input
                  id="endTime"
                  type="text"
                  placeholder="e.g., 5:00 PM"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Shift Color Selector */}
          <div>
            <label htmlFor="shiftColor" className="block text-sm font-medium text-gray-700">
              Shift Color
            </label>
            <input
              id="shiftColor"
              type="color"
              defaultValue="#79a8ff"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete Shift
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 z-50 w-80"
            >
              <h4 className="text-lg font-semibold mb-4">Confirm Delete</h4>
              <p className="mb-6">Are you sure you want to delete this shift?</p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Shift
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShiftMenu;
