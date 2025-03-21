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
  const grid_height = 40; // Even more compact height
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
    <div className="relative overflow-visible flex items-stretch">
      {/* Left side with employee info - minimalist version */}
      <div className="w-[70px] flex-shrink-0 pr-2">
        <div className="flex flex-col">
          <div className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" 
              style={{ backgroundColor: '#60a5fa' }}
            />
            <span className="font-medium text-gray-700 text-xs truncate">
              {employee.name}
            </span>
          </div>
          
          {/* Department and location as simple text */}
          <div className="ml-3.5 mt-0.5">
            {employee.department && (
              <div className="text-[9px] text-gray-500 flex items-center">
                <FiBriefcase className="text-gray-400 mr-1" size={7} />
                <span className="truncate max-w-[55px]">{employee.department}</span>
              </div>
            )}
            
            {employee.location && (
              <div className="text-[9px] text-gray-500 flex items-center">
                <FiMapPin className="text-gray-400 mr-1" size={7} />
                <span className="truncate max-w-[55px]">{employee.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Timeline area - minimalist version */}
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
        
        {/* Minimalist empty state */}
        {!hasActivities && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center opacity-40">
              <FiCalendar className="mx-auto text-gray-300" size={12} />
              <p className="text-[8px] text-gray-400 mt-0.5">No schedule</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
