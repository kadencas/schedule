interface ShiftSegment {
  startTime: string;   
  endTime: string;     
  segmentType: string; 
  location?: string;
}

interface ShiftData {
  startTime: string; 
  endTime: string;   
  segments: ShiftSegment[];
}

interface EmployeeData {
  id: string;
  name: string;
  shifts: ShiftData[];
}

interface DraftShift {
  isEditing: boolean;    
  isSegment: boolean;     
  employeeIndex: number;
  shiftIndex: number;
  segmentIndex: number | null; 
  dayIndex: number;
  startHour: number;
  endHour: number;
  title: string;
  location?: string;
}