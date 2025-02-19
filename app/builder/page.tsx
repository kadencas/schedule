"use client";
import React, { useState, useEffect, MouseEvent, useRef } from "react";

// Create an array of hours (9 AM -> 10 PM) with both numeric and display labels.
const hours = Array.from({ length: 14 }, (_, i) => {
  const numeric = i + 9; // 9..22
  const hour12 = numeric % 12 === 0 ? 12 : numeric % 12;
  const period = numeric >= 12 ? "PM" : "AM";
  return { numeric, label: `${hour12} ${period}` };
});

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper: get most recent Monday
function getMostRecentMonday(date: Date): Date {
  const day = date.getDay(); // 0..6
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  return monday;
}

interface ShiftSegment {
  startTime: string;   // ISO string
  endTime: string;     // ISO string
  segmentType: string; // e.g. "Work", "Lunch", etc.
  location?: string;
}

interface ShiftData {
  startTime: string; // ISO
  endTime: string;   // ISO
  segments: ShiftSegment[];
}

interface EmployeeData {
  id: string;
  name: string;
  shifts: ShiftData[];
}

/** 
 * A "DraftShift" (or segment) is used in the popup form 
 * for creating or editing segments.
 */
interface DraftShift {
  isEditing: boolean;     // are we editing an existing segment?
  isSegment: boolean;     // (always true in this scenario)
  employeeIndex: number;
  shiftIndex: number;
  segmentIndex: number | null; // which segment are we editing? null = new
  dayIndex: number;       
  startHour: number;
  endHour: number;
  title: string;         
  location?: string;
}

// figure out default selected day
const defaultSelectedDay = (() => {
  const today = new Date();
  const dayNum = today.getDay(); // 0=Sun..6=Sat
  return dayNum === 0 ? "Sunday" : days[dayNum - 1];
})();

const ScheduleTable = () => {
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [scheduleData, setScheduleData] = useState<EmployeeData[]>([]);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragEmployeeIndex, setDragEmployeeIndex] = useState<number | null>(null);
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragEndHour, setDragEndHour] = useState<number | null>(null);

  // Segment-drag vs new-shift-drag
  const [isSegmentDrag, setIsSegmentDrag] = useState(false);
  const [dragShiftIndex, setDragShiftIndex] = useState<number | null>(null);
  // We’ll store shift boundaries to clamp new segments.
  const [shiftStartHourBound, setShiftStartHourBound] = useState<number | null>(null);
  const [shiftEndHourBound, setShiftEndHourBound] = useState<number | null>(null);

  // Popup form
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [draftShift, setDraftShift] = useState<DraftShift | null>(null);

  // Add a ref to guard against multiple mouseup calls per drag.
  const mouseUpHandledRef = useRef(false);

  const today = new Date();
  const mondayDate = getMostRecentMonday(today);
  const formattedMondayDate = mondayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // day index
  const selectedDayIndex = days.indexOf(selectedDay);
  // actual Date object for the selected day
  const selectedDate = new Date(mondayDate);
  selectedDate.setDate(mondayDate.getDate() + selectedDayIndex);

  useEffect(() => {
    console.log("%cuseEffect(fetchData) called", "color: orange");
    // Example fetch from /api/shifts
    const fetchData = async () => {
      try {
        console.log("Fetching data from /api/shifts...");
        const res = await fetch("/api/shifts");
        const data = await res.json();
        console.log("Data fetched: ", data);
        setScheduleData(data.employees || []);
      } catch (error) {
        console.error("Error fetching shift data:", error);
      }
    };
    fetchData();
  }, []);

  /**
   * Finds a shift covering the given hour (for the selected day) for the given employee.
   * Returns shiftIndex if found, else null.
   */
  function findShiftCoveringHour(employeeIndex: number, hour: number): number | null {
    const employee = scheduleData[employeeIndex];
    if (!employee) return null;

    for (let i = 0; i < employee.shifts.length; i++) {
      const shift = employee.shifts[i];
      const sStart = new Date(shift.startTime);
      const sEnd = new Date(shift.endTime);

      // Must match the same date
      if (sStart.toDateString() !== selectedDate.toDateString()) continue;

      // If hour in [shiftStart, shiftEnd)
      if (hour >= sStart.getHours() && hour < sEnd.getHours()) {
        return i;
      }
    }
    return null;
  }

  /**
   * handleMouseDown:
   *   - if we found a shift covering that hour => segment drag
   *   - else => new shift drag
   */
  const handleMouseDown = (
    e: MouseEvent<HTMLTableDataCellElement>,
    employeeIndex: number,
    hour: number
  ) => {
    console.log("handleMouseDown =>", { employeeIndex, hour, button: e.buttons });
    if (e.buttons !== 1) return; // only left-click

    // Reset the mouseup guard for a new drag.
    mouseUpHandledRef.current = false;

    const shiftIndex = findShiftCoveringHour(employeeIndex, hour);
    console.log("Shift covering hour?", shiftIndex);
    if (shiftIndex === null) {
      // => new SHIFT
      setIsSegmentDrag(false);
      setDragShiftIndex(null);
      setShiftStartHourBound(null);
      setShiftEndHourBound(null);
      console.log("No existing shift found => new SHIFT mode");
    } else {
      // => new SEGMENT inside an existing shift
      setIsSegmentDrag(true);
      setDragShiftIndex(shiftIndex);
      // store boundaries for that shift
      const shift = scheduleData[employeeIndex].shifts[shiftIndex];
      const sStart = new Date(shift.startTime).getHours();
      const sEnd = new Date(shift.endTime).getHours();
      setShiftStartHourBound(sStart);
      setShiftEndHourBound(sEnd);
      console.log("Existing shift found => new SEGMENT mode, boundaries:", {
        sStart,
        sEnd,
      });
    }

    setIsDragging(true);
    setDragEmployeeIndex(employeeIndex);
    setDragStartHour(hour);
    setDragEndHour(hour);
  };

  const handleMouseEnter = (
    e: MouseEvent<HTMLTableDataCellElement>,
    employeeIndex: number,
    hour: number
  ) => {
    // Only if we’re actively dragging on the same employee row
    if (!isDragging || dragEmployeeIndex !== employeeIndex || dragStartHour == null) {
      return;
    }

    // We’re continuing a drag
    let updatedHour = hour;
    if (isSegmentDrag && shiftStartHourBound !== null && shiftEndHourBound !== null) {
      // clamp hour to shift boundaries
      updatedHour = Math.max(shiftStartHourBound, updatedHour);
      updatedHour = Math.min(shiftEndHourBound - 1, updatedHour); // shiftEndHour is exclusive
    }

    // If the user drags backward in time
    if (updatedHour < dragStartHour) {
      setDragEndHour(dragStartHour);
      setDragStartHour(updatedHour);
    } else {
      setDragEndHour(updatedHour);
    }

    // For debugging continuous drag
    // console.log("handleMouseEnter => dragging to hour:", updatedHour);
  };

  /**
   * handleMouseUp:
   *   - if it was a new SHIFT => create instantly with "Work"
   *   - if it was a new SEGMENT => open popup to define
   */
  const handleMouseUp = (
    e: MouseEvent<HTMLTableDataCellElement>,
    employeeIndex: number,
    hour: number
  ) => {
    // Ensure we only process this event once per drag.
    if (mouseUpHandledRef.current) {
      console.log("handleMouseUp => Already handled, skipping.");
      return;
    }
    mouseUpHandledRef.current = true;

    console.log("handleMouseUp =>", {
      employeeIndex,
      hour,
      isDragging,
      dragEmployeeIndex,
      dragStartHour,
      dragEndHour,
      isSegmentDrag,
    });

    if (!isDragging) {
      console.log("handleMouseUp => not dragging, exit.");
      return;
    }

    // final start & end
    let start = dragStartHour ?? hour;
    let end = dragEndHour ?? hour;
    // clamp if in segment mode
    if (isSegmentDrag && shiftStartHourBound !== null && shiftEndHourBound !== null) {
      start = Math.max(shiftStartHourBound, start);
      start = Math.min(shiftEndHourBound - 1, start);

      end = Math.max(shiftStartHourBound, end);
      end = Math.min(shiftEndHourBound, end);
    }

    if (start > end) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    // typical hour-block logic => end + 1 if we want that block covered
    end += 1;

    if (!isSegmentDrag) {
      // =========== NEW SHIFT ===========
      if (dragEmployeeIndex === null) {
        console.log("No dragEmployeeIndex => cannot create new shift.");
        resetDrag();
        return;
      }
      // If we ended up with a zero-length or invalid shift, skip
      if (start >= end) {
        console.log("Invalid shift, start>=end => skipping.");
        resetDrag();
        return;
      }
      console.log(
        "Creating a NEW SHIFT for employeeIndex",
        dragEmployeeIndex,
        "start hour=" + start,
        "end hour=" + end
      );

      const newShift = buildNewShift(selectedDayIndex, start, end);

      setScheduleData((prev) => {
        console.log("setScheduleData => adding new SHIFT to employee:", dragEmployeeIndex);
        const clone = [...prev];
        clone[dragEmployeeIndex].shifts.push(newShift);
        console.log("shifts after push:", clone[dragEmployeeIndex].shifts);
        return clone;
      });
    } else {
      // =========== NEW SEGMENT ===========
      if (dragEmployeeIndex === null || dragShiftIndex === null) {
        console.log("Missing dragEmployeeIndex or dragShiftIndex => skipping new segment.");
        resetDrag();
        return;
      }
      // zero-length?
      if (start >= end) {
        console.log("Invalid segment, start>=end => skipping.");
        resetDrag();
        return;
      }

      console.log(
        "Creating NEW SEGMENT for employee:",
        dragEmployeeIndex,
        " shiftIndex:",
        dragShiftIndex,
        " start:",
        start,
        " end:",
        end
      );

      // Build a draft for the popup
      const newDraft: DraftShift = {
        isEditing: false,
        isSegment: true,
        employeeIndex: dragEmployeeIndex,
        shiftIndex: dragShiftIndex,
        segmentIndex: null,
        dayIndex: selectedDayIndex,
        startHour: start,
        endHour: end,
        title: "",
        location: "",
      };
      setDraftShift(newDraft);
      setShowShiftForm(true);
    }

    resetDrag();
  };

  function resetDrag() {
    console.log("resetDrag => clearing drag state");
    setIsDragging(false);
    setDragEmployeeIndex(null);
    setDragStartHour(null);
    setDragEndHour(null);
    setIsSegmentDrag(false);
    setDragShiftIndex(null);
    setShiftStartHourBound(null);
    setShiftEndHourBound(null);
  }

  /**
   * Build a brand new shift with a single "Work" segment.
   */
  function buildNewShift(dayIdx: number, startHr: number, endHr: number): ShiftData {
    console.log("buildNewShift => dayIdx:", dayIdx, "startHr:", startHr, "endHr:", endHr);
    const draftDate = new Date(mondayDate);
    draftDate.setDate(mondayDate.getDate() + dayIdx);
  
    const sDate = new Date(draftDate);
    sDate.setHours(startHr, 0, 0, 0);
    const eDate = new Date(draftDate);
    eDate.setHours(endHr, 0, 0, 0);
  
    const shift: ShiftData = {
      startTime: sDate.toISOString(),
      endTime: eDate.toISOString(),
      segments: [] // No default segment here!
    };
    console.log("New shift built:", shift);
    return shift;
  }

  /** 
   * Handle clicking an existing segment => edit
   */
  const handleSegmentEdit = (
    employeeIndex: number,
    shiftIndex: number,
    segmentIndex: number
  ) => {
    console.log("handleSegmentEdit =>", { employeeIndex, shiftIndex, segmentIndex });
    const shift = scheduleData[employeeIndex].shifts[shiftIndex];
    const seg = shift.segments[segmentIndex];
    if (!seg) return;

    const shiftDayIndex = getDayIndexFromDate(new Date(seg.startTime));
    const startHour = new Date(seg.startTime).getHours();
    const endHour = new Date(seg.endTime).getHours();

    const draft: DraftShift = {
      isEditing: true,
      isSegment: true,
      employeeIndex,
      shiftIndex,
      segmentIndex,
      dayIndex: shiftDayIndex,
      startHour,
      endHour,
      title: seg.segmentType,
      location: seg.location || "",
    };
    setDraftShift(draft);
    setShowShiftForm(true);
  };

  function getDayIndexFromDate(date: Date) {
    // date might be e.g. Wednesday
    // we compare it to mondayDate to see how many days difference
    const dayDiff = (date.getTime() - mondayDate.getTime()) / (1000 * 3600 * 24);
    // floor or round it
    return Math.round(dayDiff);
  }

  // CANCEL popup form
  function handleCancelShiftForm() {
    console.log("handleCancelShiftForm => closing popup");
    setShowShiftForm(false);
    setDraftShift(null);
  }

  /**
   * SAVE popup form
   *   - either editing an existing segment
   *   - or creating a new segment
   */
  const handleSaveShiftForm = () => {
    console.log("handleSaveShiftForm => Attempting to save draft shift:", draftShift);
    if (!draftShift) return;

    const {
      isEditing,
      employeeIndex,
      shiftIndex,
      segmentIndex,
      dayIndex,
      startHour,
      endHour,
      title,
      location,
    } = draftShift;

    const draftDate = new Date(mondayDate);
    draftDate.setDate(mondayDate.getDate() + dayIndex);

    const sDate = new Date(draftDate);
    sDate.setHours(startHour, 0, 0, 0);
    const eDate = new Date(draftDate);
    eDate.setHours(endHour, 0, 0, 0);

    setScheduleData((prev) => {
      console.log("setScheduleData => saving segment for employee:", employeeIndex);
      const clone = [...prev];
      const emp = clone[employeeIndex];
      const sh = emp.shifts[shiftIndex];

      if (!isEditing) {
        // new segment
        const newSeg: ShiftSegment = {
          startTime: sDate.toISOString(),
          endTime: eDate.toISOString(),
          segmentType: title || "Work",
          location: location || "",
        };
        sh.segments.push(newSeg);
        console.log("New segment pushed:", newSeg);
      } else {
        // editing existing
        if (segmentIndex == null) return clone;
        console.log("Editing existing segment index:", segmentIndex);
        const seg = sh.segments[segmentIndex];
        seg.startTime = sDate.toISOString();
        seg.endTime = eDate.toISOString();
        seg.segmentType = title || "Work";
        seg.location = location || "";
      }
      return clone;
    });

    setShowShiftForm(false);
    setDraftShift(null);
  };

  function handleDraftChange(field: keyof DraftShift, value: string | number) {
    if (!draftShift) return;
    setDraftShift({ ...draftShift, [field]: value });
  }

  /**
   * Renders a clickable segment in the grid
   */
  function renderSegmentSpan(
    employeeIndex: number,
    shiftIndex: number,
    segmentIndex: number,
    location: string | undefined,
    label: string
  ) {
    let colorClass = "bg-blue-200 text-blue-800";
    if (location) {
      if (location === "Desk 1") colorClass = "bg-red-200 text-red-800";
      if (location === "Desk 2") colorClass = "bg-yellow-200 text-yellow-800";
      if (location === "Desk 3") colorClass = "bg-green-200 text-green-800";
    }

    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          handleSegmentEdit(employeeIndex, shiftIndex, segmentIndex);
        }}
        className={`${colorClass} rounded absolute inset-0 flex items-center justify-center w-[90%] h-[90%] m-auto text-xs cursor-pointer`}
      >
        {label}
      </span>
    );
  }

  /**
   * getCellContent: show the first segment that covers this hour 
   * (or none if not covered).
   */
  function getCellContent(hourObj: { numeric: number; label: string }, employeeIndex: number) {
    const { numeric } = hourObj;
    const employee = scheduleData[employeeIndex];
    if (!employee) return null;

    for (let i = 0; i < employee.shifts.length; i++) {
      const shift = employee.shifts[i];
      const sStart = new Date(shift.startTime);
      const sEnd = new Date(shift.endTime);
      if (sStart.toDateString() !== selectedDate.toDateString()) continue;

      // if hour is in [shiftStart, shiftEnd)
      if (numeric >= sStart.getHours() && numeric < sEnd.getHours()) {
        // see which segment covers it
        for (let s = 0; s < shift.segments.length; s++) {
          const seg = shift.segments[s];
          const segStart = new Date(seg.startTime).getHours();
          const segEnd = new Date(seg.endTime).getHours();
          if (numeric >= segStart && numeric < segEnd) {
            return renderSegmentSpan(employeeIndex, i, s, seg.location, seg.segmentType || "Work");
          }
        }
        // fallback
        return renderSegmentSpan(employeeIndex, i, 0, "", "Work");
      }
    }
    return null;
  }

  /**
   * For desk rows: show employees at that desk each hour
   */
  function getDeskCellContent(desk: string, hour: number) {
    const employeeNames = new Set<string>();
  
    scheduleData.forEach((emp) => {
      emp.shifts.forEach((shift) => {
        const sStart = new Date(shift.startTime);
        const sEnd = new Date(shift.endTime);
        if (sStart.toDateString() !== selectedDate.toDateString()) return;
  
        if (hour >= sStart.getHours() && hour < sEnd.getHours()) {
          shift.segments.forEach((seg) => {
            const segStart = new Date(seg.startTime).getHours();
            const segEnd = new Date(seg.endTime).getHours();
            if (hour >= segStart && hour < segEnd) {
              if (seg.location === desk) {
                employeeNames.add(emp.name);
              }
            }
          });
        }
      });
    });
  
    if (employeeNames.size === 0) return null;
  
    let colorClass = "bg-blue-200 text-blue-800";
    if (desk === "Desk 1") colorClass = "bg-red-200 text-red-800";
    if (desk === "Desk 2") colorClass = "bg-yellow-200 text-yellow-800";
    if (desk === "Desk 3") colorClass = "bg-green-200 text-green-800";
  
    return (
      <div className={`${colorClass} rounded w-full h-full flex flex-col items-center justify-center text-xs p-1`}>
        {[...employeeNames].map((emp, idx) => (
          <div key={idx}>{emp}</div>
        ))}
      </div>
    );
  }
  
  const handleSaveAll = async () => {
    // Build the payload to send
    const payload = {
      companyId: "123", // replace with your actual company id
      schedule: scheduleData,
    };
  
    // Print the payload to the console for debugging
    console.log("handleSaveAll => Payload being sent:", payload);
  
    try {
      const response = await fetch("/api/updateshifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with ${response.statusText}`);
      }
      alert("All changes saved!");
    } catch (error) {
      console.error("Error saving shifts:", error);
      alert("Error saving shifts. Check console for details.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      {/* Title */}
      <div className="flex justify-center mb-4">
        <span className="text-lg font-medium">Week of: {formattedMondayDate}</span>
      </div>

      {/* Weekday tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {days.map((day, idx) => {
          const dDate = new Date(mondayDate);
          dDate.setDate(mondayDate.getDate() + idx);
          const formatted = dDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
          return (
            <button
              key={day}
              onClick={() => {
                console.log("Selected day changed to:", day);
                setSelectedDay(day);
              }}
              className={`px-4 py-2 rounded-t-md font-semibold text-sm transition-colors duration-200 ${
                selectedDay === day
                  ? "bg-blue-600 text-white border-b-4 border-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day} {formatted}
            </button>
          );
        })}
      </div>

      {/* Main table */}
      <table
        className="w-full table-fixed border-collapse"
        // Just in case user releases the mouse outside a cell
        onMouseUp={() => {
          if (isDragging) {
            console.log("table.onMouseUp => forcibly ending drag");
            setIsDragging(false);
          }
        }}
      >
        <thead className="bg-gray-500 text-white">
          <tr>
            <th className="border border-gray-300 px-2 py-2 w-24">Locations</th>
            {hours.map((hr) => (
              <th
                key={hr.numeric}
                className="border border-gray-300 px-2 py-2 text-sm w-1/12"
              >
                {hr.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Desk rows */}
          {["Desk 1", "Desk 2", "Desk 3"].map((desk) => (
            <tr key={desk} className="bg-gray-100 border-b border-gray-400">
              <td className="border border-gray-300 px-2 py-2 font-semibold h-12">
                {desk}
              </td>
              {hours.map((h) => (
                <td
                  key={h.numeric}
                  className="border border-gray-300 px-1 py-1 relative h-12"
                >
                  {getDeskCellContent(desk, h.numeric)}
                </td>
              ))}
            </tr>
          ))}

          {/* Spacer row */}
          <tr>
            <td colSpan={hours.length + 1} className="h-4" />
          </tr>

          {/* Employee heading row */}
          <tr className="bg-white">
            <td className="border border-gray-300 px-2 py-2 font-semibold w-24 h-12">
              Employees
            </td>
            {hours.map((hr) => (
              <td
                key={hr.numeric}
                className="border border-gray-300 px-2 py-2 text-sm text-gray-600 text-center w-1/12 h-12"
              >
                {hr.label}
              </td>
            ))}
          </tr>

          {/* Employee rows */}
          {scheduleData.map((emp, empIdx) => {
            console.log(`Rendering row for employee[${empIdx}]: ${emp.name}`, emp.shifts);
            return (
              <tr key={empIdx} className="border border-gray-300">
                <td className="border border-gray-300 px-2 py-2 font-semibold h-12">
                  {emp.name}
                </td>
                {hours.map((hourObj) => {
                  const hour = hourObj.numeric;
                  return (
                    <td
                      key={hour}
                      className="border border-gray-300 px-1 py-1 relative h-12 cursor-pointer"
                      onMouseDown={(e) => handleMouseDown(e, empIdx, hour)}
                      onMouseEnter={(e) => handleMouseEnter(e, empIdx, hour)}
                      onMouseUp={(e) => {
                        e.stopPropagation(); // prevent the table’s onMouseUp from firing
                        handleMouseUp(e, empIdx, hour);
                      }}
                    >
                      {getCellContent(hourObj, empIdx)}

                      {/* Highlight range while dragging */}
                      {isDragging &&
                        dragEmployeeIndex === empIdx &&
                        dragStartHour !== null &&
                        dragEndHour !== null && (() => {
                          // figure out if hour is in the highlight range
                          let startH = dragStartHour;
                          let endH = dragEndHour;
                          if (startH > endH) {
                            const t = startH;
                            startH = endH;
                            endH = t;
                          }

                          // if segment drag => clamp highlight
                          if (isSegmentDrag && shiftStartHourBound && shiftEndHourBound) {
                            startH = Math.max(shiftStartHourBound, startH);
                            endH = Math.min(shiftEndHourBound - 1, endH);
                          }

                          return hour >= startH && hour <= endH ? (
                            <div className="absolute inset-0 bg-blue-100 opacity-50 pointer-events-none"></div>
                          ) : null;
                        })()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* SAVE ALL */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save All
        </button>
      </div>

      {/* POPUP FORM for segments */}
      {showShiftForm && draftShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-[300px]">
            <h3 className="text-lg font-bold mb-2">
              {draftShift.isEditing ? "Edit Segment" : "New Segment"}
            </h3>

            <div className="mb-2">
              <label className="block text-sm font-semibold">Segment Type:</label>
              <input
                type="text"
                className="border rounded w-full p-1"
                value={draftShift.title}
                onChange={(e) => handleDraftChange("title", e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold">Location:</label>
              <input
                type="text"
                className="border rounded w-full p-1"
                placeholder="(optional)"
                value={draftShift.location}
                onChange={(e) => handleDraftChange("location", e.target.value)}
              />
            </div>

            <div className="mb-2 text-sm text-gray-600">
              <div>
                <strong>Day:</strong> {days[draftShift.dayIndex]}
              </div>
              <div>
                <strong>Start Hour:</strong> {draftShift.startHour}:00
              </div>
              <div>
                <strong>End Hour:</strong> {draftShift.endHour}:00
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelShiftForm}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShiftForm}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
