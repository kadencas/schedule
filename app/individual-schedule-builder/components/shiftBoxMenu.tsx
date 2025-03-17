"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  onClose, // receiving the callback
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

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="relative space-y-4 p-2 bg-white rounded-lg shadow-md z-50"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-gray-600 text-sm hover:text-gray-900"
      >
        ✕
      </button>

      <h4 className="text-md font-semibold">Recurrence Settings</h4>

      {/* Recurrence Toggle */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={handleToggleRecurring}
          className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
        />
        <span className="text-gray-700">Recurring Shift</span>
      </label>

      {isRecurring && (
        <>
          {/* Frequency */}
          <div className="flex flex-col">
            <label className="text-gray-700 text-sm">Frequency</label>
            <select
              value={frequency}
              onChange={handleFrequencyChange}
              className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="NONE">None</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          {/* Interval */}
          <div className="flex flex-col">
            <label className="text-gray-700 text-sm">Interval</label>
            <input
              type="number"
              min="1"
              value={interval}
              onChange={handleIntervalChange}
              className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <small className="text-xs text-gray-500">
              E.g. 1 for every unit; 2 for every 2 units
            </small>
          </div>

          {/* Days of Week (Only if Weekly) */}
          {frequency === "WEEKLY" && (
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm mb-1">Days of the Week</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day.value} className="flex items-center space-x-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDaySelection(day.value)}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Debugging: Display generated RRULE */}
          <div className="text-xs text-gray-500">
            <strong>Generated RRULE:</strong> {generateRRule() || "None"}
          </div>
        </>
      )}
    </motion.div>
  );
}
