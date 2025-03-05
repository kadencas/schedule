// WeekDayToggle.tsx
import React from "react";
import { days, getDayDateLabel } from "./helper/helper";
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
    <div className="w-full">
      {/* Header Section */}
      <header className="w-full h-16 bg-white shadow flex items-center justify-between px-5">
        <motion.button
          onClick={handlePreviousWeek}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-blue-500 focus:outline-none"
        >
          <FiChevronLeft size={24} />
          <span className="ml-1 font-medium">Previous Week</span>
        </motion.button>

        <span className="font-bold text-gray-800">
          Week of: {formattedMondayDate}
        </span>

        <motion.button
          onClick={handleNextWeek}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-blue-500 focus:outline-none"
        >
          <span className="mr-1 font-medium">Next Week</span>
          <FiChevronRight size={24} />
        </motion.button>
      </header>

      {/* Day Tabs Section */}
      <div className="bg-gray-100 flex justify-center gap-2 py-3">
        {days.map((day, index) => {
          const dateLabel = getDayDateLabel(currentMonday, index);
          const isSelected = selectedDay === day;
          return (
            <motion.button
              key={day}
              onClick={() => setSelectedDay(day)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 min-w-[90px] rounded-md font-bold transition-all duration-200 
                ${isSelected ? "bg-blue-500 text-white border-2 border-blue-500" : "bg-white text-gray-800 border border-gray-300"}`}
            >
              {day} <span className="text-sm">({dateLabel})</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
