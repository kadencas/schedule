  // useShiftManagement.ts
  import { useState, useEffect } from "react";
  import { days } from "../helper/helper";

  export interface Segment {
    id: string;
    label: string;
    start: number;
    end: number;
    color: string;
  }

  export function useShiftManagement(userShifts: any, currentMonday: Date, selectedDay: string) {
    // State for segments
    const [shiftSegments, setShiftSegments] = useState<Segment[]>([]);
    
    // State for new segment fields
    const [newSegmentLabel, setNewSegmentLabel] = useState("");
    const [newSegmentStart, setNewSegmentStart] = useState(30);
    const [newSegmentEnd, setNewSegmentEnd] = useState(60);
    const [newSegmentColor, setNewSegmentColor] = useState("#ffc4d6");
    

    // Update shiftSegments based on the selected day
    useEffect(() => {
      const dayIndex = days.indexOf(selectedDay);
      const selectedDate = new Date(currentMonday);
      selectedDate.setDate(currentMonday.getDate() + dayIndex);
      const selectedDateString = selectedDate.toISOString().split("T")[0];

      const matchingShift = userShifts.find((shift: any) => {
        const shiftDateString = new Date(shift.shiftDate).toISOString().split("T")[0];
        return shiftDateString === selectedDateString;
      });

      if (matchingShift) {
        const shiftStart = new Date(matchingShift.startTime);
        const mappedSegments = matchingShift.segments.map((seg: any) => {
          const segStart = new Date(seg.startTime);
          const segEnd = new Date(seg.endTime);
          const startMinutes = Math.round((segStart.getTime() - shiftStart.getTime()) / 60000);
          const endMinutes = Math.round((segEnd.getTime() - shiftStart.getTime()) / 60000);
          return {
            id: seg.id,
            label: seg.segmentType,
            start: startMinutes,
            end: endMinutes,
            color: seg.location,
          };
        });
        setShiftSegments(mappedSegments);
      } else {
        setShiftSegments([]);
      }
    }, [userShifts, currentMonday, selectedDay]);

    // Compute matching shift for the selected day and layout values
    let shiftStartTime: Date | null = null;
    let shiftEndTime: Date | null = null;
    let initialX = 0;
    let initialWidth = 100; // fallback defaults

    const dayIndex = days.indexOf(selectedDay);
    const selectedDate = new Date(currentMonday);
    selectedDate.setDate(currentMonday.getDate() + dayIndex);
    const selectedDateString = selectedDate.toISOString().split("T")[0];

    const matchingShift = userShifts.find((shift: any) => {
      const shiftDateString = new Date(shift.shiftDate).toISOString().split("T")[0];
      return shiftDateString === selectedDateString;
    });

    if (matchingShift) {
      const shiftStart = new Date(matchingShift.startTime);
      const shiftEnd = new Date(matchingShift.endTime);
      // Set a baseline of 9:00 AM on the same day as shiftStart
      const baseline = new Date(shiftStart);
      baseline.setHours(9, 0, 0, 0);
      // Calculate differences and convert to pixels (1px = 0.6 minutes)
      const diffStartMinutes = (shiftStart.getTime() - baseline.getTime()) / 60000;
      initialX = diffStartMinutes / 0.6;
      const diffShiftMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
      initialWidth = diffShiftMinutes / 0.6;
      // Compute current shift times
      shiftStartTime = new Date(baseline.getTime() + initialX * 0.6 * 60000);
      shiftEndTime = new Date(baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000);
    }

    // Segment Handlers
    const handleAddSegment = (label: string, start: number, end: number, color: string) => {
      const newSegment: Segment = {
        id: `seg-${Date.now()}`,
        label,
        start,
        end,
        color,
      };
      setShiftSegments((prev) => [...prev, newSegment]);
    };

    const handleCreateSegment = () => {
      if (!newSegmentLabel.trim()) {
        alert("Please enter a label for the segment.");
        return;
      }
      if (newSegmentStart >= newSegmentEnd) {
        alert("Start time must be less than end time.");
        return;
      }
      handleAddSegment(newSegmentLabel, newSegmentStart, newSegmentEnd, newSegmentColor);
      setNewSegmentLabel("");
      setNewSegmentStart(30);
      setNewSegmentEnd(60);
      setNewSegmentColor("#ffc4d6");
    };

    return {
      shiftSegments,
      newSegmentLabel,
      setNewSegmentLabel,
      newSegmentStart,
      setNewSegmentStart,
      newSegmentEnd,
      setNewSegmentEnd,
      newSegmentColor,
      setNewSegmentColor,
      handleCreateSegment,
      matchingShift,
      shiftStartTime,
      shiftEndTime,
      initialX,
      initialWidth,
    };
  }
