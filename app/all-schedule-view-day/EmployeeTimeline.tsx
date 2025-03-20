import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { useShiftManagement } from "@/app/individual-schedule-builder/hooks/useShiftManagement";
import { Employee, Shift, Segment } from "@/types/types";
import { FiCalendar, FiMapPin, FiBriefcase } from "react-icons/fi";

interface EmployeeTimelineProps {
  employee: Employee;
  currentMonday: Date;
  selectedDay: string;
}

export default function EmployeeTimeline({
  employee,
  currentMonday,
  selectedDay,
}: EmployeeTimelineProps) {
  const snapToGrid = true;
  const grid_height = 45; // More compact height
  const readOnly = true;

  // Memoize the processed shifts to avoid new references on every render
  const employeeShifts = useMemo(() => {
    if (!employee.shifts || !Array.isArray(employee.shifts)) return [];
    
    return employee.shifts.map((shift) => ({
      ...shift,
      startTime: new Date(shift.startTime as string | number | Date),
      endTime: new Date(shift.endTime as string | number | Date),
      segments: (shift.segments || []).map((segment) => ({
        ...segment,
        startTime: new Date(segment.startTime as string | number | Date),
        endTime: new Date(segment.endTime as string | number | Date),
      })),
    }));
  }, [employee.shifts]);

  const {
    shiftSegments,
    matchingShift,
    shiftStartTime,
    shiftEndTime,
    initialX,
    initialWidth,
  } = useShiftManagement(employeeShifts, currentMonday, selectedDay);

  // Check if there are any segments/activities for this employee today
  const hasActivities = matchingShift && matchingShift.segments && matchingShift.segments.length > 0;

  return (
    <div className="relative overflow-visible flex items-stretch pt-0 pb-4">
      {/* Left side with employee info */}
      <div className="w-[75px] flex-shrink-0 border-r border-gray-100 pr-1 pt-0">
        <div className="flex flex-col h-full justify-start">
          {/* Employee color and name */}
          <div className="flex items-start mb-0.5 w-full">
            <div 
              className="w-2.5 h-2.5 rounded-full mr-1 flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: '#60a5fa' }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 text-[12px] leading-tight max-w-[65px]">
                {employee.name}
              </span>
              
              {/* Department (if available) */}
              {employee.department && (
                <div className="flex items-center">
                  <FiBriefcase className="text-gray-400 mr-0.5" size={7} />
                  <span className="text-[9px] text-gray-500">
                    {employee.department}
                  </span>
                </div>
              )}
              
              {/* Location (if available) */}
              {employee.location && (
                <div className="flex items-center">
                  <FiMapPin className="text-gray-400 mr-0.5" size={7} />
                  <span className="text-[9px] text-gray-500">
                    {employee.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline area */}
      <div className="flex-1 overflow-visible relative">
        <Timeline
          user={employee.name}
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
          onShiftSave={(shiftId, updatedData) => console.log('Shift save not supported in employee view')}
          entities={[]} // Empty array as entities are not needed in this view
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
