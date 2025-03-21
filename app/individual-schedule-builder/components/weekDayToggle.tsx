import React, { useState } from "react";
import { days, getDayDateLabel } from "../helper/helper";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

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
  // State to track animation direction
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animationKey, setAnimationKey] = useState(0);
  
  // Updated handlers with animation direction
  const handlePrevious = () => {
    setDirection("right");
    setAnimationKey(prev => prev + 1);
    handlePreviousWeek();
  };
  
  const handleNext = () => {
    setDirection("left");
    setAnimationKey(prev => prev + 1);
    handleNextWeek();
  };
  
  // Animation variants
  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-2">
      {/* Date centered at the top */}
      <div className="flex items-center justify-center mb-1 pt-1">
      </div>

      {/* Days Toggle with arrows on sides */}
      <div className="flex items-center w-full">
        {/* Left arrow */}
        <motion.button
          onClick={handlePrevious}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 text-gray-400 hover:text-blue-500 focus:outline-none"
          aria-label="Previous week"
        >
          <FiChevronLeft size={14} />
        </motion.button>

        {/* Days with animation */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={animationKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="flex gap-[1px] w-full"
            >
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
                    className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-md transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-sm"
                        : isToday
                        ? "bg-blue-50/70 text-gray-800"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`text-[11px] font-medium ${isSelected ? "text-white" : "text-gray-700"}`}>
                      {day.substring(0, 3)}
                    </span>
                    <span className={`text-[9px] mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                      {dateLabel.split(" ")[0]}
                    </span>
                    
                    {isToday && !isSelected && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400 rounded-t-md" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right arrow */}
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 text-gray-400 hover:text-blue-500 focus:outline-none"
          aria-label="Next week"
        >
          <FiChevronRight size={14} />
        </motion.button>
      </div>
    </div>
  );
}
