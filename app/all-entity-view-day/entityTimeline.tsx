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
  const grid_height = 40; // More compact height for minimalistic design
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
  
  console.log("ENTITY TIMELINE RESULTS:", {
    entityName: entity.name,
    hasMatchingShift: !!matchingShift,
    matchingShiftId: matchingShift?.id,
    segmentsCount: shiftSegments?.length || 0
  });

  // FIX: Check for segments in shiftSegments array rather than matchingShift
  // This ensures we display activities when we have processed segments ready to render
  const hasActivities = shiftSegments && shiftSegments.length > 0;

  return (
    <div className="relative overflow-visible flex items-stretch">
      {/* Left side with entity info - minimalist version */}
      <div className="w-[75px] flex-shrink-0 pr-2">
        <div className="flex flex-col">
          {/* Entity color and name */}
          <div className="flex items-start">
            <div 
              className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: extendedEntity.color || '#60a5fa' }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-gray-700 text-xs truncate max-w-[60px]">
                {entity.name}
              </span>
              
              {/* Entity type (if available) */}
              {extendedEntity.type && (
                <span className="text-[9px] text-gray-500">
                  {extendedEntity.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline area - minimalist version */}
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
        
        {/* Minimalist empty state */}
        {!hasActivities && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center opacity-40">
              <FiCalendar className="mx-auto text-gray-300" size={12} />
              <p className="text-[8px] text-gray-400 mt-0.5">No activities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
