
export interface Shift {
  id: string;
  startTime: string; 
  endTime: string;   
  segments: Segment[];
  shiftDate: Date;
}

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  location: string;
}

export interface Employee {
  department: string;
  id: string;
  location: string;
  name: string;
  role: string;
  shifts: Shift[];
}

export interface DraftShift {
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








