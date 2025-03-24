"use client";
import React, { useEffect, useState } from "react";
import WeekDayToggle from "./components/weekDayToggle";
import ShiftMenu from "./components/shiftMenu";
import Timeline from "./components/timeline";
import { useShiftManagement } from "./hooks/useShiftManagement";
import { useUserShifts } from "./hooks/useUserShift";
import {
  defaultSelectedDay,
  formatMondayDate,
  getMostRecentMonday,
  getNextWeekMonday,
  getPreviousWeekMonday,
} from "./helper/helper";
import { useSession } from "next-auth/react";
import { Shift } from "@/types/types";
import { useEntities } from "./hooks/useEntities";
import { motion } from "framer-motion";
import { FiClock, FiCalendar, FiGrid, FiInfo } from "react-icons/fi";

export default function Page() {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentMonday, setCurrentMonday] = useState<Date>(getMostRecentMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(defaultSelectedDay);
  const grid_height = 100;
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const readOnly = false;
  const { data: session } = useSession();
  const { entities: entities } = useEntities();
  const [isMounted, setIsMounted] = useState(false);

  // returns an object and renames userShifts fetchedUser shifts to indicate they were pulled from backend
  const { userShifts: fetchedUserShifts } = useUserShifts(); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * anytime fetchedUserShifts changes (backend changes), update the array
   */
  useEffect(() => {
    if (fetchedUserShifts) {
      setUserShifts(fetchedUserShifts);
    }
  }, [fetchedUserShifts]);

  useEffect(() => {
    console.log("UserShifts changed:", userShifts);
  }, [userShifts]);

  /**
   * takes shift ID for shift to update, and some updated data,
   * looks at userShifts array and updates the corresponding data
   */
  function handleShiftChangesSaved(shiftId: string, updatedData: Partial<Shift>) {
    console.log("updated data", updatedData)
    setUserShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === shiftId
          ? { ...shift, ...updatedData }
          : shift
      )
    );
    console.log("pre", userShifts)
  }

  /**
   * Handles user clicking previous week button
   * Sets currentMonday to previous week's monday
   */
  const handlePreviousWeek = () => {
    setCurrentMonday(getPreviousWeekMonday(currentMonday));
  };

  /**
   * Handles user clicking next week button
   * Sets currentMonday to next week's monday
   */
  const handleNextWeek = () => {
    setCurrentMonday(getNextWeekMonday(currentMonday));
  };

  const formattedMondayDate = formatMondayDate(currentMonday);

  /**
   * Creates a new shift using the API endpoint.
   * The new shift uses the selected day (e.g., "Friday") added to the currentMonday date.
   * Default times: Start at 9:00 AM, End at 5:00 PM.
   * The userId is retrieved from the session.
   */
  const handleAddShift = async () => {
    if (!session || !session.user) {
      console.error("User not authenticated");
      return;
    }

    // Map weekday names to their offset from Monday (0 = Monday, 1 = Tuesday, etc.)
    const dayOffsets: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const offset = dayOffsets[selectedDay];
    if (offset === undefined) {
      console.error("Invalid selected day:", selectedDay);
      return;
    }

    // Compute the correct shift date by adding the offset to currentMonday.
    const shiftDateObj = new Date(currentMonday);
    shiftDateObj.setDate(shiftDateObj.getDate() + offset);

    // Set default start time at 9:00 AM.
    const startTime = new Date(shiftDateObj);
    startTime.setHours(9, 0, 0, 0);

    // Set default end time at 5:00 PM.
    const endTime = new Date(shiftDateObj);
    endTime.setHours(17, 0, 0, 0);

    // Use the authenticated user's id from the session.
    const userId = session.user.id;

    // Convert Date objects to ISO strings for the API
    const shiftData = {
      userId,
      shiftDate: shiftDateObj.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isRecurring: false,
      recurrenceRule: null,
      recurrenceEndDate: null,
      notes: "",
      entity: null,
    };

    try {
      const response = await fetch("/api/shifts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) {
        throw new Error("Failed to create shift");
      }
      const data = await response.json();

      const createdShift = data.shift;
      const newShift: Shift = {
        id: createdShift.id,
        userId: createdShift.userId,
        shiftDate: new Date(createdShift.shiftDate).toISOString(),
        startTime: new Date(createdShift.startTime),
        endTime: new Date(createdShift.endTime),
        isRecurring: createdShift.isRecurring,
        recurrenceRule: createdShift.recurrenceRule,
        segments: createdShift.segments || [],
      };

      setUserShifts((prevShifts) => [...prevShifts, newShift]);

    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  console.log("shifts for processing", userShifts)
  /**
   * Process shifts and segments for the Timeline component.
   */
  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
    newSegmentLabel,
    setNewSegmentLabel,
    newSegmentStart,
    setNewSegmentStart,
    newSegmentEnd,
    setNewSegmentEnd,
    newSegmentColor,
    setNewSegmentColor,
    handleCreateSegment,
  } = useShiftManagement(userShifts, currentMonday, selectedDay);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="w-full h-screen bg-gray-50 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Simplified Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg font-medium flex items-center">
            <FiCalendar className="mr-2" />
            Schedule Builder
          </h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          className="flex flex-col space-y-2"
        >
          {/* Week Navigation */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <WeekDayToggle
              currentMonday={currentMonday}
              formattedMondayDate={formattedMondayDate}
              handlePreviousWeek={handlePreviousWeek}
              handleNextWeek={handleNextWeek}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          </motion.div>

          {/* Main Layout with Timeline and Shift Menu */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Timeline Section - Minimalistic */}
            <motion.div 
              variants={itemVariants}
              className="flex-grow bg-white rounded-lg shadow-sm p-3 border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-end mb-2">
                <div className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  <FiGrid className="mr-1" size={10} />
                  {snapToGrid ? "Snap to Grid" : "Free Movement"}
                </div>
              </div>
              
              <div className="relative">
                <Timeline
                  snapToGrid={snapToGrid}
                  shiftSegments={shiftSegments}
                  matchingShift={matchingShift}
                  initialX={initialX}
                  initialWidth={initialWidth}
                  shiftStartTime={shiftStartTime}
                  shiftEndTime={shiftEndTime}
                  gridHeight={grid_height}
                  readOnly={readOnly}
                  onShiftSave={handleShiftChangesSaved}
                  entities={entities}
                  selectedDay={selectedDay}
                  user={session?.user?.name || "Anonymous User"}
                />
                
                {!matchingShift && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center text-center"
                  >
                    <div className="max-w-md p-4">
                      <div className="bg-blue-50 rounded-full w-10 h-10 mx-auto flex items-center justify-center mb-2">
                        <FiInfo className="text-blue-400" size={18} />
                      </div>
                      <h3 className="font-medium text-gray-600 text-sm">No shift on {selectedDay}</h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Use the "Add Shift" button to create one
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Simplified Shift Menu */}
            <motion.div
              variants={itemVariants}
              className="w-full md:w-60 bg-white rounded-lg shadow-sm border border-gray-100 p-3"
            >
              <ShiftMenu
                matchingShift={matchingShift}
                snapToGrid={snapToGrid}
                setSnapToGrid={setSnapToGrid}
                onAddShift={handleAddShift}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
