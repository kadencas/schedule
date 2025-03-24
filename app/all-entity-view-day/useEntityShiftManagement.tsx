// useEntityShiftManagement.ts
import { useState, useEffect } from "react";
import { days } from "../individual-schedule-builder/helper/helper";
import { Segment, Shift } from "@/types/types";
import { RRule } from "rrule";

interface ShiftTimesState {
  matchingShift: Shift | null;
  shiftStartTime: Date | null;
  shiftEndTime: Date | null;
  initialX: number;
  initialWidth: number;
}

export function useEntityShiftManagement(
  userShifts: Shift[],
  entityShifts: Shift[],
  currentMonday: Date,
  selectedDay: string
) {
  const [shiftSegments, setShiftSegments] = useState<Segment[]>([]);
  const [shiftTimes, setShiftTimes] = useState<ShiftTimesState>({
    matchingShift: null,
    shiftStartTime: null,
    shiftEndTime: null,
    initialX: 0,
    initialWidth: 100,
  });

  useEffect(() => {
    // 1) Compute the selected date based on currentMonday and selectedDay.
    const dayIndex = days.indexOf(selectedDay);
    const selectedDate = new Date(currentMonday);
    selectedDate.setDate(currentMonday.getDate() + dayIndex);
    
    console.log("==== ENTITY TIMELINE RENDER ====");
    console.log("Selected date:", selectedDate.toDateString(), "Day index:", dayIndex);
    console.log("Current Monday:", currentMonday.toDateString());
    console.log("Selected day string:", selectedDay);
    
    // Count recurring vs non-recurring shifts
    const recurringUserShifts = userShifts.filter(s => s.isRecurring).length;
    const nonRecurringUserShifts = userShifts.length - recurringUserShifts;
    console.log(`Total user shifts: ${userShifts.length} (${recurringUserShifts} recurring, ${nonRecurringUserShifts} non-recurring)`);
    
    // DEBUGGING: Check structure of all user shifts
    if (userShifts.length > 0) {
      console.log("USER SHIFTS SUMMARY:");
      userShifts.forEach((shift, i) => {
        console.log(`  Shift ${i}: ID=${shift.id}, isRecurring=${!!shift.isRecurring}, Segments=${shift.segments?.length || 0}, User=${(shift as any).userName || 'unknown'}`);
        if (shift.isRecurring) {
          console.log(`    Recurrence rule: ${shift.recurrenceRule}`);
        } else {
          console.log(`    Shift date: ${new Date(shift.shiftDate).toDateString()}`);
        }
      });
    }

    // Helper function: checks if a shift occurs on the selected date (handling recurrence).
    function doesShiftOccurOn(shift: Shift, date: Date): boolean {
      // ENHANCED RECURRENCE DETECTION
      
      // For non-recurring shifts, direct date comparison
      if (!shift.isRecurring || !shift.recurrenceRule) {
        const shiftDate = new Date(shift.shiftDate);
        const matches = shiftDate.toDateString() === date.toDateString();
        console.log(`  NON-RECURRING SHIFT ${shift.id} on ${shiftDate.toDateString()} matches ${date.toDateString()}? ${matches}`);
        return matches;
      }
      
      // For recurring shifts, use RRule
      try {
        console.log(`  CHECKING RECURRENCE for shift ${shift.id} with rule: ${shift.recurrenceRule}`);
        
        // Parse the recurrence rule
        const rule = RRule.fromString(shift.recurrenceRule);
        
        // Create a range around the target date (to make sure we catch the day)
        const rangeStart = new Date(date);
        rangeStart.setDate(date.getDate() - 1); // One day before
        rangeStart.setHours(0, 0, 0, 0);
        
        const rangeEnd = new Date(date);
        rangeEnd.setDate(date.getDate() + 1); // One day after
        rangeEnd.setHours(23, 59, 59, 999);
        
        console.log(`  Checking occurrences between ${rangeStart.toDateString()} and ${rangeEnd.toDateString()}`);
        
        // Get all occurrences in our range
        const occurrences = rule.between(rangeStart, rangeEnd, true);
        console.log(`  Found ${occurrences.length} occurrences in range`);
        
        // Check if any occurrence matches our date
        const matches = occurrences.some(occurrence => {
          const occurrenceMatches = occurrence.toDateString() === date.toDateString();
          console.log(`    Occurrence ${occurrence.toDateString()} matches ${date.toDateString()}? ${occurrenceMatches}`);
          return occurrenceMatches;
        });
        
        console.log(`  RECURRING SHIFT ${shift.id} matches ${date.toDateString()}? ${matches}`);
        return matches;
      } catch (err) {
        console.error(`  ❌ INVALID RECURRENCE RULE for shift ${shift.id}:`, shift.recurrenceRule, err);
        return false;
      }
    }

    // 2) Find all matching user shifts for the selected date.
    console.log("\nEXAMINING USER SHIFTS FOR MATCHING DATE:");
    const matchingUserShifts = userShifts.filter(shift => {
      const matches = doesShiftOccurOn(shift, selectedDate);
      console.log(`Shift ${shift.id} occurs on ${selectedDate.toDateString()}? ${matches}`);
      return matches;
    });
    
    console.log(`\nMatching user shifts for date ${selectedDate.toDateString()}: ${matchingUserShifts.length}`);
    matchingUserShifts.forEach((shift, i) => {
      console.log(`  Match ${i}: Shift ID=${shift.id}, isRecurring=${!!shift.isRecurring}, Segments=${shift.segments?.length || 0}, User=${(shift as any).userName || 'unknown'}`);
    });

    // 3) Find all matching entity shifts for the selected date.
    console.log("\nEXAMINING ENTITY SHIFTS FOR MATCHING DATE:");
    const matchingEntityShifts = entityShifts.filter(shift => {
      const matches = doesShiftOccurOn(shift, selectedDate);
      console.log(`Entity shift ${shift.id} occurs on ${selectedDate.toDateString()}? ${matches}`);
      return matches;
    });
    
    console.log(`\nMatching entity shifts for this date: ${matchingEntityShifts.length}`);
    
    // 4) If we found at least one entity shift, process it
    if (matchingEntityShifts.length > 0) {
      // Use the first matching entity shift as the primary shift for the timeline
      const primaryEntityShift = matchingEntityShifts[0];
      const entityId = primaryEntityShift.entityId;
      
      // Store entityId as both string and number for flexible comparison
      const entityIdStr = String(entityId);
      const entityIdNum = Number(entityId);
      
      console.log(`\nPRIMARY ENTITY ID: "${entityId}" (string: "${entityIdStr}", number: ${entityIdNum})`);
      
      // Helper function to deeply search for entity ID in an object
      function deepSearchForEntityId(obj: any): string | null {
        if (!obj) return null;
        
        // Direct property check
        if (obj.id) return obj.id;
        if (obj.entityId) return obj.entityId;
        
        // Check for nested entities
        if (obj.entity && obj.entity.id) return obj.entity.id;
        if (obj.entities && obj.entities.id) return obj.entities.id;
        
        // Recursively check all properties that are objects
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = deepSearchForEntityId(obj[key]);
            if (result) return result;
          }
        }
        
        return null;
      }
      
      // Check if a value matches our entity ID (loose comparison)
      function matchesEntityId(value: any): boolean {
        if (!value) return false;
        
        // Try different comparison strategies
        // 1. Exact match
        if (value === entityId) return true;
        
        // 2. String comparison
        const valueStr = String(value).trim();
        if (valueStr === entityIdStr) return true;
        
        // 3. Number comparison if possible
        const valueNum = Number(value);
        if (!isNaN(valueNum) && valueNum === entityIdNum) return true;
        
        return false;
      }
      
      // Collect ALL segments from ALL user shifts
      const collectAllSegments: any[] = [];
      
      // Process each matching user shift
      matchingUserShifts.forEach(userShift => {
        console.log(`\nProcessing user shift ID: ${userShift.id} with ${userShift.segments?.length || 0} segments`);
        
        // Get the userName from the shift
        const userName = (userShift as any).userName || 'Unknown User';
        
        // Skip if no segments
        if (!userShift.segments || userShift.segments.length === 0) {
          console.log(`  No segments in this shift`);
          return;
        }
        
        // Process each segment
        userShift.segments.forEach(segment => {
          // Deep debug the segment's structure
          console.log(`  Segment ID: ${segment.id}`);
          
          const entityProperties = {
            directEntityId: segment.entityId,
            entityIdFromEntity: segment.entity?.id,
            entityIdFromEntities: segment.entities?.id,
            deepSearchResult: deepSearchForEntityId(segment)
          };
          
          console.log(`  Entity properties:`, entityProperties);
          
          // Try all possible ways to get the entity ID
          let found = false;
          
          // 1. Direct entityId property
          if (matchesEntityId(segment.entityId)) {
            console.log(`  ✓ MATCH via direct entityId: ${segment.entityId}`);
            // Add the userName to the segment
            collectAllSegments.push({
              ...segment,
              user: userName
            });
            found = true;
          }
          
          // 2. Via entity.id
          else if (segment.entity && matchesEntityId(segment.entity.id)) {
            console.log(`  ✓ MATCH via entity.id: ${segment.entity.id}`);
            // Add the userName to the segment
            collectAllSegments.push({
              ...segment,
              user: userName
            });
            found = true;
          }
          
          // 3. Via entities.id
          else if (segment.entities && matchesEntityId(segment.entities.id)) {
            console.log(`  ✓ MATCH via entities.id: ${segment.entities.id}`);
            // Add the userName to the segment
            collectAllSegments.push({
              ...segment,
              user: userName
            });
            found = true;
          }
          
          // 4. Deep search result
          else {
            const deepResult = deepSearchForEntityId(segment);
            if (deepResult && matchesEntityId(deepResult)) {
              console.log(`  ✓ MATCH via deep search: ${deepResult}`);
              // Add the userName to the segment
              collectAllSegments.push({
                ...segment,
                user: userName
              });
              found = true;
            }
          }
          
          if (!found) {
            console.log(`  ✗ NO MATCH with entity ID: ${entityId}`);
            
            // Dump a deeper serialization of the segment for debugging
            console.log(`  Full segment:`, JSON.stringify(segment, null, 2));
          }
        });
      });
      
      console.log(`\nTOTAL MATCHING SEGMENTS FOUND: ${collectAllSegments.length}`);
      
      // Create our combined shift with ALL matching segments
      const combinedShift = {
        ...primaryEntityShift,
        segments: collectAllSegments,
      };

      // Process for display if we have segments
      if (combinedShift.segments.length > 0) {
      const shiftStart = new Date(combinedShift.startTime);
      const mappedSegments = combinedShift.segments.map((seg: any) => {
        const segStart = new Date(seg.startTime);
        const segEnd = new Date(seg.endTime);
        
        // FIXED: Normalize dates to the same day before calculating minute offsets
        // This ensures segments on future days have proper positioning
        const normalizedSegStart = new Date(segStart);
        const normalizedSegEnd = new Date(segEnd);
        const normalizedShiftStart = new Date(shiftStart);
        
        // Set all dates to the same day, keeping only their time components
        normalizedSegStart.setFullYear(2000, 0, 1);
        normalizedSegEnd.setFullYear(2000, 0, 1);
        normalizedShiftStart.setFullYear(2000, 0, 1);
        
        console.log("Normalizing segment times:", {
          original: {
            segStart: segStart.toISOString(),
            segEnd: segEnd.toISOString(),
            shiftStart: shiftStart.toISOString()
          },
          normalized: {
            segStart: normalizedSegStart.toISOString(),
            segEnd: normalizedSegEnd.toISOString(),
            shiftStart: normalizedShiftStart.toISOString()
          }
        });
        
        // Calculate minutes using normalized times
        const startMinutes = Math.round(
          (normalizedSegStart.getTime() - normalizedShiftStart.getTime()) / 60000
        );
        const endMinutes = Math.round(
          (normalizedSegEnd.getTime() - normalizedShiftStart.getTime()) / 60000
        );
          
          // Include the user in the mapped segment
        return {
          id: seg.id,
          label: seg.segmentType,
          start: startMinutes,
          end: endMinutes,
          color: seg.color,
          location: seg.location,
            entity: seg.entities || seg.entity,
            user: seg.user  // Pass through the user name
        } as Segment;
      });
        
      setShiftSegments(mappedSegments);

        // Compute visualization values (timeline positions)
      const shiftEnd = new Date(combinedShift.endTime);
      const baseline = new Date(shiftStart);
      baseline.setHours(9, 0, 0, 0);
      const diffStartMinutes = (shiftStart.getTime() - baseline.getTime()) / 60000;
      const initialX = diffStartMinutes / 0.6;
      const diffShiftMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
      const initialWidth = diffShiftMinutes / 0.6;
      const computedShiftStartTime = new Date(baseline.getTime() + initialX * 0.6 * 60000);
      const computedShiftEndTime = new Date(baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000);

      setShiftTimes({
        matchingShift: combinedShift,
        shiftStartTime: computedShiftStartTime,
        shiftEndTime: computedShiftEndTime,
        initialX,
        initialWidth,
      });
    } else {
        // Empty entity shift - no segments found
        const shiftStart = new Date(primaryEntityShift.startTime);
        const shiftEnd = new Date(primaryEntityShift.endTime);
        const baseline = new Date(shiftStart);
        baseline.setHours(9, 0, 0, 0);
        const diffStartMinutes = (shiftStart.getTime() - baseline.getTime()) / 60000;
        const initialX = diffStartMinutes / 0.6;
        const diffShiftMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;
        const initialWidth = diffShiftMinutes / 0.6;
        const computedShiftStartTime = new Date(baseline.getTime() + initialX * 0.6 * 60000);
        const computedShiftEndTime = new Date(baseline.getTime() + (initialX + initialWidth) * 0.6 * 60000);

        setShiftTimes({
          matchingShift: {
            ...primaryEntityShift,
            segments: [],
          },
          shiftStartTime: computedShiftStartTime,
          shiftEndTime: computedShiftEndTime,
          initialX,
          initialWidth,
        });
        
        setShiftSegments([]);
      }
    } else {
      // No entity shifts found for this date
      setShiftSegments([]);
      setShiftTimes({
        matchingShift: null,
        shiftStartTime: null,
        shiftEndTime: null,
        initialX: 0,
        initialWidth: 100,
      });
    }
  }, [userShifts, entityShifts, currentMonday, selectedDay]);

  return {
    shiftSegments,
    matchingShift: shiftTimes.matchingShift,
    shiftStartTime: shiftTimes.shiftStartTime,
    shiftEndTime: shiftTimes.shiftEndTime,
    initialX: shiftTimes.initialX,
    initialWidth: shiftTimes.initialWidth,
  };
}
