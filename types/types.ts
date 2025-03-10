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

export interface Employee {
  department: string;
  id: string;
  location: string;
  name: string;
  role: string;
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


// shiftBox.tsx uses:

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  location: string;
}




