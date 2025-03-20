import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { Entity } from "@/types/types";
import { useEntityShiftManagement } from "./useEntityShiftManagement";
import { FiCalendar, FiMapPin, FiTag } from "react-icons/fi";

interface EntityTimelineProps {
  entity: Entity;
  currentMonday: Date;
  selectedDay: string;
  userShifts: any[];
}

export default function EntityTimeline({
  entity,
  currentMonday,
  selectedDay,
  userShifts,
}: EntityTimelineProps) {
  const snapToGrid = true;
  const grid_height = 90;
  const readOnly = true;

  // Memoize the processed shifts to avoid unnecessary re-renders
  const entityShifts = useMemo(() => {
    return entity.entity_shifts.map((shift) => ({
      ...shift,
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      segments: shift.segments.map((segment) => ({
        ...segment,
        startTime: new Date(segment.startTime),
        endTime: new Date(segment.endTime),
      })),
    }));
  }, [entity.entity_shifts]);

  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
  } = useEntityShiftManagement(userShifts, entityShifts, currentMonday, selectedDay);

  // Check if there are any segments/activities for this entity today
  const hasActivities = matchingShift && matchingShift.segments && matchingShift.segments.length > 0;

  return (
    <div className="relative">
      {/* Entity Header - more compact */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-1.5 ${entity.color ? "" : "bg-blue-400"}`} 
            style={entity.color ? { backgroundColor: entity.color } : {}}></div>
          <h3 className="font-medium text-gray-800 text-xs">{entity.name}</h3>
        </div>
        
        {/* Entity metadata */}
        <div className="flex items-center gap-1.5">
          {entity.location && (
            <div className="flex items-center text-[10px] text-gray-500" title="Location">
              <FiMapPin size={10} className="mr-0.5" />
              <span className="truncate max-w-[80px]">{entity.location}</span>
            </div>
          )}
          
          {entity.type && (
            <div className="flex items-center text-[10px] text-gray-500" title="Type">
              <FiTag size={10} className="mr-0.5" />
              <span>{entity.type}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Entity Timeline - simplified and more compact */}
      <div className="border border-gray-100 rounded overflow-hidden pb-5">
        {/* The actual Timeline component */}
        <div className="relative ml-[60px]">
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
            selectedDay={selectedDay}
            user="" // Passing empty string - the user will come from the segments
            onShiftSave={(shiftId, updatedData) => console.log('Shift save not supported in entity view')}
            entities={[entity]} // Pass the current entity as the only available entity
          />
        </div>
        
        {/* Empty state message - more compact */}
        {!hasActivities && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <FiCalendar className="mx-auto text-gray-300 mb-1" size={14} />
              <p className="text-[10px] text-gray-500">No activities scheduled</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
