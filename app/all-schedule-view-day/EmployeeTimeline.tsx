import React, { useMemo } from "react";
import Timeline from "@/app/individual-schedule-builder/components/timeline";
import { useShiftManagement } from "@/app/individual-schedule-builder/hooks/useShiftManagement";
import { Employee, Shift, Segment } from "@/types/types";
import { FiCalendar, FiMapPin, FiBriefcase, FiMail, FiPhone } from "react-icons/fi";

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
  const grid_height = 90; // Setting to 90 to match EntityTimeline
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
    <div className="relative">
      {/* Employee Header - more compact */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-1.5 bg-blue-500"></div>
          <h3 className="font-medium text-gray-800 text-xs">{employee.name}</h3>
        </div>
        
        {/* Employee metadata */}
        <div className="flex items-center gap-1.5">
          {employee.department && (
            <div className="flex items-center text-[10px] text-gray-500" title="Department">
              <FiBriefcase size={10} className="mr-0.5" />
              <span className="truncate max-w-[80px]">{employee.department}</span>
            </div>
          )}
          
          {employee.location && (
            <div className="flex items-center text-[10px] text-gray-500" title="Location">
              <FiMapPin size={10} className="mr-0.5" />
              <span className="truncate max-w-[80px]">{employee.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Employee Timeline - simplified and more compact */}
      <div className="border border-gray-100 rounded overflow-hidden pb-5">
        {/* The actual Timeline component */}
        <div className="relative ml-[60px]">
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
