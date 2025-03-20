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
    <div className="w-full max-w-6xl mx-auto mb-3">
      {/* Header Section - Compact date display with navigation */}
      <div className="flex items-center justify-between mb-2 px-1">
        <motion.button
          onClick={handlePreviousWeek}
          whileTap={{ scale: 0.95 }}
          className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
          aria-label="Previous week"
        >
          <FiChevronLeft size={16} />
        </motion.button>

        <h2 className="text-sm font-medium text-gray-700">
          {formattedMondayDate}
        </h2>

        <motion.button
          onClick={handleNextWeek}
          whileTap={{ scale: 0.95 }}
          className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none"
          aria-label="Next week"
        >
          <FiChevronRight size={16} />
        </motion.button>
      </div>

      {/* Days Toggle - Sleeker, more compact design */}
      <div className="flex gap-0.5 w-full">
        {days.map((day, index) => {
          const dateLabel = getDayDateLabel(currentMonday, index);
          const isSelected = selectedDay === day;
          const today = new Date();
          const dayDate = new Date(currentMonday);
          dayDate.setDate(currentMonday.getDate() + index);
          const isToday = 
            today.getDate() === dayDate.getDate() && 
            today.getMonth() === dayDate.getMonth() && 
            today.getFullYear() === dayDate.getFullYear();
          
          return (
            <motion.button
              key={day}
              onClick={() => setSelectedDay(day)}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 px-0.5 rounded-md transition-all duration-200 ${
                isSelected
                  ? "bg-blue-500 text-white shadow-sm"
                  : isToday
                  ? "bg-blue-50 text-gray-800"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={`text-xs font-medium truncate w-full text-center ${isSelected ? "text-white" : "text-gray-700"}`}>
                {day}
              </span>
              <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                {dateLabel.split(" ")[0]}
              </span>
              
              {isToday && !isSelected && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
