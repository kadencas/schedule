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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Section */}
        <header className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between px-6">
          <motion.button
            onClick={handlePreviousWeek}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none"
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
            className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-indigo-700 focus:outline-none"
          >
            <span className="mr-2 font-medium">Next Week</span>
            <FiChevronRight size={24} />
          </motion.button>
        </header>

        {/* Day Tabs Section */}
        <div className="bg-white flex justify-center gap-3 py-4 px-4">
          {days.map((day, index) => {
            const dateLabel = getDayDateLabel(currentMonday, index);
            const isSelected = selectedDay === day;
            return (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 min-w-[90px] rounded-lg font-bold transition-all duration-200 
                  ${isSelected
                    ? "bg-blue-600 text-white border-2 border-blue-600 shadow-md"
                    : "bg-gray-50 text-gray-800 border-2 border-gray-300 hover:bg-blue-50"
                  }`}
              >
                {day}
                <span className="text-xs block mt-1">({dateLabel})</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
