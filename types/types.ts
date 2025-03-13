
export interface Shift {
  id: string;
  startTime: string; 
  endTime: string;   
  segments: Segment[];
  shiftDate: Date;
}

export interface Segment {
  entity: any;
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


export interface Entity {
  id: string;
  name: string;
  type: string; // "STATION" | "TASK"
  icon?: string | null;
  color?: string | null;
  requiresCoverage: boolean;
  minCoverage?: number | null;
  createdAt?: string;
  updatedAt?: string;
}








