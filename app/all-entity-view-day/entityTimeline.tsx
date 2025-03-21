import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { Entity } from "@/types/types";
import { useEntityShiftManagement } from "./useEntityShiftManagement";
import { FiCalendar } from "react-icons/fi";

interface EntityTimelineProps {
  entity: Entity;
  currentMonday: Date;
  selectedDay: string;
  userShifts: any[];
}

// Extend the Entity type to include the properties we're using
interface ExtendedEntity extends Omit<Entity, 'type'> {
  entity_shifts: any[];
  location?: string;
  type?: string;
  color?: string;
}

export default function EntityTimeline({
  entity,
  currentMonday,
  selectedDay,
  userShifts,
}: EntityTimelineProps) {
  const snapToGrid = true;
  const grid_height = 45; // Compact height
  const readOnly = true;
  
  // Cast entity to ExtendedEntity to fix TypeScript errors
  const extendedEntity = entity as ExtendedEntity;

  // Memoize the processed shifts to avoid unnecessary re-renders
  const entityShifts = useMemo(() => {
    return extendedEntity.entity_shifts.map((shift) => ({
      ...shift,
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      segments: shift.segments.map((segment: any) => ({
        ...segment,
        startTime: new Date(segment.startTime),
        endTime: new Date(segment.endTime),
      })),
    }));
  }, [extendedEntity.entity_shifts]);

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
    <div className="relative overflow-visible flex items-stretch pt-0 pb-4">
      {/* Left side with entity info */}
      <div className="w-[75px] flex-shrink-0 border-r border-gray-100 pr-1 pt-0">
        <div className="flex flex-col h-full justify-start">
          {/* Entity color and name */}
          <div className="flex items-start mb-0.5 w-full">
            <div 
              className="w-2.5 h-2.5 rounded-full mr-1 flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: extendedEntity.color || '#60a5fa' }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 text-[12px] leading-tight max-w-[65px]">
                {entity.name}
              </span>
              
              {/* Entity type (if available) */}
              {extendedEntity.type && (
                <span className="text-[10px] text-gray-500">
                  {extendedEntity.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline area */}
      <div className="flex-1 overflow-visible relative">
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
        
        {/* Empty state message */}
        {!hasActivities && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="text-center">
              <FiCalendar className="mx-auto text-gray-300 mb-0.5" size={8} />
              <p className="text-[7px] text-gray-500">No activities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
