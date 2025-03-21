"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TbRepeat, TbX } from "react-icons/tb";
import { FiCalendar, FiClock, FiRepeat } from "react-icons/fi";

type Frequency = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

interface ShiftBoxMenuProps {
  isRecurring: boolean;
  recurrenceRule: string;
  onRecurrenceChange: (newRule: string | null, isRecurring: boolean) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}

const DAYS_OF_WEEK = [
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" },
];

export default function ShiftBoxMenu({
  isRecurring: initialRecurring,
  recurrenceRule: initialRecurrenceRule,
  onRecurrenceChange,
  onClose,
  style = {}
}: ShiftBoxMenuProps) {
  const [isRecurring, setIsRecurring] = useState(initialRecurring);
  const [frequency, setFrequency] = useState<Frequency>("NONE");
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Parse the initial recurrence rule
  useEffect(() => {
    if (initialRecurring && initialRecurrenceRule) {
      const parts = initialRecurrenceRule.split(";");
      let freq: Frequency = "NONE";
      let intVal = 1;
      let days: string[] = [];

      parts.forEach((part) => {
        if (part.startsWith("FREQ=")) {
          const val = part.replace("FREQ=", "");
          if (val === "DAILY") freq = "DAILY";
          if (val === "WEEKLY") freq = "WEEKLY";
          if (val === "MONTHLY") freq = "MONTHLY";
        }
        if (part.startsWith("INTERVAL=")) {
          intVal = parseInt(part.replace("INTERVAL=", ""), 10) || 1;
        }
        if (part.startsWith("BYDAY=")) {
          days = part.replace("BYDAY=", "").split(",").filter(Boolean);
        }
      });

      setFrequency(freq);
      setInterval(intVal);
      setSelectedDays(days);
    } else {
      setFrequency("NONE");
      setInterval(1);
      setSelectedDays([]);
    }
    setIsRecurring(initialRecurring);
  }, [initialRecurring, initialRecurrenceRule]);

  // Helper to build an RRULE string
  function buildRRule(
    recurring: boolean,
    freq: Frequency,
    intv: number,
    days: string[]
  ): string | null {
    if (!recurring || freq === "NONE") return null;
    let rule = `FREQ=${freq};INTERVAL=${intv}`;
    if (freq === "WEEKLY" && days.length > 0) {
      rule += `;BYDAY=${days.join(",")}`;
    }
    return rule;
  }

  function generateRRule(): string | null {
    return buildRRule(isRecurring, frequency, interval, selectedDays);
  }

  // ---- HANDLERS that call onRecurrenceChange directly ----
  function handleToggleRecurring(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setIsRecurring(checked);
    if (!checked) {
      setFrequency("NONE");
      setInterval(1);
      setSelectedDays([]);
    }
    onRecurrenceChange(checked ? generateRRule() : null, checked);
  }

  function handleFrequencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newFreq = e.target.value as Frequency;
    setFrequency(newFreq);

    if (newFreq !== "WEEKLY") {
      setSelectedDays([]);
    }
    onRecurrenceChange(buildRRule(isRecurring, newFreq, interval, []), isRecurring);
  }

  function handleIntervalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = parseInt(e.target.value, 10) || 1;
    setInterval(newVal);
    onRecurrenceChange(buildRRule(isRecurring, frequency, newVal, selectedDays), isRecurring);
  }

  function handleDaySelection(dayValue: string) {
    let updatedDays: string[];
    if (selectedDays.includes(dayValue)) {
      updatedDays = selectedDays.filter((d) => d !== dayValue);
    } else {
      updatedDays = [...selectedDays, dayValue];
    }
    setSelectedDays(updatedDays);
    onRecurrenceChange(buildRRule(isRecurring, frequency, interval, updatedDays), isRecurring);
  }

  // Get frequency description for display
  const getFrequencyDescription = (): string => {
    if (!isRecurring) return "Not recurring";
    if (frequency === "NONE") return "No pattern set";
    if (frequency === "DAILY") {
      return interval === 1 ? "Every day" : `Every ${interval} days`;
    }
    if (frequency === "WEEKLY") {
      if (selectedDays.length === 0) {
        return interval === 1 ? "Every week" : `Every ${interval} weeks`;
      } else {
        const dayLabels = selectedDays.map(
          (day) => DAYS_OF_WEEK.find((d) => d.value === day)?.label
        ).join(", ");
        return interval === 1 
          ? `Every week on ${dayLabels}` 
          : `Every ${interval} weeks on ${dayLabels}`;
      }
    }
    if (frequency === "MONTHLY") {
      return interval === 1 ? "Every month" : `Every ${interval} months`;
    }
    return "Custom pattern";
  };

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.2 }}
      className="w-64 relative bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <FiRepeat className="text-white mr-2" size={14} />
          <h4 className="text-sm font-medium text-white">Recurrence Settings</h4>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors focus:outline-none"
          aria-label="Close"
        >
          <TbX size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Recurrence Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="recurring-toggle" className="flex items-center space-x-2 cursor-pointer w-full">
            <div 
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isRecurring ? 'bg-green-500' : 'bg-gray-300'}`}
              onClick={(e) => {
                e.preventDefault();
                const newValue = !isRecurring;
                setIsRecurring(newValue);
                if (!newValue) {
                  setFrequency("NONE");
                  setInterval(1);
                  setSelectedDays([]);
                }
                onRecurrenceChange(newValue ? generateRRule() : null, newValue);
              }}
            >
              <motion.div 
                className="bg-white w-3.5 h-3.5 rounded-full shadow-md" 
                animate={{ x: isRecurring ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Recurring Shift</span>
          </label>
          <input 
            type="checkbox" 
            checked={isRecurring} 
            onChange={handleToggleRecurring} 
            className="sr-only" 
            id="recurring-toggle"
          />
        </div>

        {isRecurring && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="flex items-center text-xs font-medium text-gray-500">
                <FiCalendar className="mr-1.5" size={12} />
                Frequency
              </label>
              <select
                value={frequency}
                onChange={handleFrequencyChange}
                className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="NONE">None</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {/* Interval */}
            <div className="space-y-1.5">
              <label className="flex items-center text-xs font-medium text-gray-500">
                <FiClock className="mr-1.5" size={12} />
                Repeat every
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={handleIntervalChange}
                  className="w-16 border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {frequency === "DAILY" && "day(s)"}
                  {frequency === "WEEKLY" && "week(s)"}
                  {frequency === "MONTHLY" && "month(s)"}
                  {frequency === "NONE" && "period(s)"}
                </span>
              </div>
            </div>

            {/* Days of Week (Only if Weekly) */}
            {frequency === "WEEKLY" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1.5"
              >
                <label className="flex items-center text-xs font-medium text-gray-500">
                  On these days
                </label>
                <div className="flex justify-between flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => handleDaySelection(day.value)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all
                        ${selectedDays.includes(day.value) 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {day.label.substring(0, 1)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium">Summary</div>
              <div className="text-sm text-gray-800 mt-1">
                {getFrequencyDescription()}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
