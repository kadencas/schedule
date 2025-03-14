import React from "react";
import { days, getDayDateLabel } from "../helper/helper";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface WeekDayToggleProps {
  currentMonday: Date;
  formattedMondayDate: string;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
}

export default function WeekDayToggle({
  currentMonday,
  formattedMondayDate,
  handlePreviousWeek,
  handleNextWeek,
  selectedDay,
  setSelectedDay,
}: WeekDayToggleProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Section */}
        <header className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-600 text-white flex items-center justify-between px-6">
          <motion.button
            onClick={handlePreviousWeek}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-700 focus:outline-none"
          >
            <FiChevronLeft size={24} />
            <span className="ml-2 font-medium">Previous Week</span>
          </motion.button>

          <span className="font-semibold text-lg">
            Week of: {formattedMondayDate}
          </span>

          <motion.button
            onClick={handleNextWeek}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-700 focus:outline-none"
          >
            <span className="mr-2 font-medium">Next Week</span>
            <FiChevronRight size={24} />
          </motion.button>
        </header>

        {/* Day Tabs Section */}
        <div className="bg-white grid grid-cols-7 gap-2 py-2 px-4">
          {days.map((day, index) => {
            const dateLabel = getDayDateLabel(currentMonday, index);
            const isSelected = selectedDay === day;
            return (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center justify-center py-2 rounded-lg font-bold transition-all duration-200 
                  ${
                    isSelected
                      ? "bg-gray-400 text-gray-900 border border-gray-400 shadow-md"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
              >
                <span>{day}</span>
                <span className="text-xs mt-1">({dateLabel})</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
