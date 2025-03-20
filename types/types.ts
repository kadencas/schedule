export interface Shift {
  recurrenceRule: string;
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  userId?: string;
  segments: Segment[];
  shiftDate: string;
  isRecurring?: boolean;
  entityId?: string;
}

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  location: string;
  entity?: any;
  entities?: any;
  entityId?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  segmentType?: string;
  user?: string;
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








