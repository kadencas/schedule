"use client";
// app/dayview/page.tsx
import React from 'react';
import { motion } from 'framer-motion';

type DeskAssignment = {
  desk: string;
  start: number; // e.g., 8 for 8am
  end: number;   // e.g., 10 for 10am (non-inclusive)
};

type WorkerSchedule = {
  name: string;
  shift: { start: number; end: number }; // overall shift hours
  desks: DeskAssignment[]; // one or more desk assignments within the shift
  color: string; // a Tailwind CSS class representing the worker's distinct color
};

// Updated hardcoded data
const workerSchedules: WorkerSchedule[] = [
  {
    name: 'Alice',
    shift: { start: 8, end: 14 }, // works in the morning
    desks: [
      { desk: "Children's Desk", start: 9, end: 13 }, // covers 9am-1pm
    ],
    color: 'bg-red-300',
  },
  {
    name: 'Bob',
    shift: { start: 8, end: 14 },
    desks: [
      { desk: 'Teen Desk', start: 9, end: 13 }, // covers 9am-1pm
    ],
    color: 'bg-green-300',
  },
  {
    name: 'Charlie',
    shift: { start: 9, end: 19 },
    desks: [
      { desk: 'Tween Desk', start: 9, end: 18 }, // covers 9am-6pm (thus 9-5pm fully)
    ],
    color: 'bg-purple-300',
  },
  {
    name: 'David',
    shift: { start: 13, end: 19 }, // afternoon shift
    desks: [
      { desk: "Children's Desk", start: 13, end: 18 }, // covers 1pm-6pm (i.e. 1-5pm)
    ],
    color: 'bg-blue-300',
  },
  {
    name: 'Eve',
    shift: { start: 13, end: 19 },
    desks: [
      { desk: 'Teen Desk', start: 13, end: 18 }, // covers 1pm-6pm
    ],
    color: 'bg-yellow-300',
  },
];

// Hours from 6am to 10pm (16 hourly slots)
const hours = Array.from({ length: 16 }, (_, i) => i + 6);

// Helper: Format hour labels
const formatHour = (hour: number) => {
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
};

/**
 * For a given worker and hour, determine the cell’s state:
 * - "off": hour is outside the worker’s overall shift.
 * - "shift": hour is within the overall shift but not at a desk.
 * - "desk": hour is within one of the worker’s desk assignments.
 */
const getWorkerCellState = (
  worker: WorkerSchedule,
  hour: number
): { state: 'off' | 'shift' | 'desk'; desk?: string } => {
  if (hour >= worker.shift.start && hour < worker.shift.end) {
    let cell = { state: 'shift' as 'shift' | 'desk', desk: undefined as string | undefined };
    for (const assignment of worker.desks) {
      if (hour >= assignment.start && hour < assignment.end) {
        cell = { state: 'desk', desk: assignment.desk };
        break;
      }
    }
    return cell;
  }
  return { state: 'off' };
};

/**
 * Computes contiguous segments for a worker's timeline.
 */
const getWorkerTimelineSegments = (worker: WorkerSchedule) => {
  const segments: { state: 'off' | 'shift' | 'desk'; desk?: string; count: number }[] = [];
  let i = 0;
  while (i < hours.length) {
    const current = getWorkerCellState(worker, hours[i]);
    let count = 1;
    while (i + count < hours.length) {
      const next = getWorkerCellState(worker, hours[i + count]);
      if (next.state === current.state && next.desk === current.desk) {
        count++;
      } else {
        break;
      }
    }
    segments.push({ state: current.state, desk: current.desk, count });
    i += count;
  }
  return segments;
};

/**
 * Renders the mini timeline bar inside the worker's left cell.
 * Desk segments are colored using the worker's distinct color.
 */
const renderWorkerTimeline = (worker: WorkerSchedule) => {
  const segments = getWorkerTimelineSegments(worker);
  return segments.map((seg, idx) => {
    // Calculate width percentage based on total 16 hours.
    const widthPercent = (seg.count / 16) * 100;
    // Use the worker's color only for desk segments.
    const bgColor = seg.state === 'desk' ? worker.color : 'bg-transparent';
    return (
      <div
        key={idx}
        className={`${bgColor} h-full`}
        style={{ width: `${widthPercent}%` }}
      />
    );
  });
};

/**
 * Renders a worker’s main schedule row by merging contiguous hourly cells.
 * When a cell represents a desk assignment, it uses the worker's color.
 */
const renderWorkerRow = (worker: WorkerSchedule) => {
  const segments: { state: 'off' | 'shift' | 'desk'; desk?: string; count: number }[] = [];
  let i = 0;
  while (i < hours.length) {
    const current = getWorkerCellState(worker, hours[i]);
    let count = 1;
    while (i + count < hours.length) {
      const next = getWorkerCellState(worker, hours[i + count]);
      if (next.state === current.state && next.desk === current.desk) {
        count++;
      } else {
        break;
      }
    }
    segments.push({ state: current.state, desk: current.desk, count });
    i += count;
  }

  return segments.map((seg, idx) => {
    let cellClass =
      'border border-gray-300 p-4 h-20 flex items-center justify-center transition-colors duration-200';
    let cellContent = '';
    if (seg.state === 'off') {
      cellClass += ' bg-white';
    } else if (seg.state === 'shift') {
      cellClass += ' bg-green-200';
      cellContent = 'Shift';
    } else if (seg.state === 'desk') {
      // Use the worker's distinct color for desk segments.
      cellClass += ` ${worker.color}`;
      cellContent = seg.desk || '';
    }
    return (
      <motion.div
        key={idx}
        className={cellClass}
        style={{ gridColumn: `span ${seg.count}` }}
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-sm font-semibold">{cellContent}</span>
      </motion.div>
    );
  });
};

/**
 * For a given desk and hour, check if any worker has an assignment for that desk.
 * Now also returns the worker's distinct color if occupied.
 */
const getDeskCellState = (
  desk: string,
  hour: number
): { state: 'empty' | 'occupied'; worker?: string; color?: string } => {
  for (const worker of workerSchedules) {
    for (const assignment of worker.desks) {
      if (assignment.desk === desk && hour >= assignment.start && hour < assignment.end) {
        return { state: 'occupied', worker: worker.name, color: worker.color };
      }
    }
  }
  return { state: 'empty' };
};

/**
 * Renders a desk row by merging contiguous hourly cells that share the same state.
 * When occupied, the cell uses the occupying worker's distinct color.
 */
const renderDeskRow = (desk: string) => {
  const segments: { state: 'empty' | 'occupied'; worker?: string; color?: string; count: number }[] = [];
  let i = 0;
  while (i < hours.length) {
    const current = getDeskCellState(desk, hours[i]);
    let count = 1;
    while (i + count < hours.length) {
      const next = getDeskCellState(desk, hours[i + count]);
      if (next.state === current.state && next.worker === current.worker) {
        count++;
      } else {
        break;
      }
    }
    segments.push({ state: current.state, worker: current.worker, color: current.color, count });
    i += count;
  }
  return segments.map((seg, idx) => {
    let cellClass =
      'border border-gray-300 p-4 h-20 flex items-center justify-center transition-colors duration-200';
    let cellContent = '';
    if (seg.state === 'empty') {
      cellClass += ' bg-white';
    } else if (seg.state === 'occupied') {
      // Use the occupying worker's distinct color.
      cellClass += ` ${seg.color}`;
      cellContent = seg.worker || '';
    }
    return (
      <motion.div
        key={idx}
        className={cellClass}
        style={{ gridColumn: `span ${seg.count}` }}
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-sm font-semibold">{cellContent}</span>
      </motion.div>
    );
  });
};

// Framer Motion variants for container and cell animations.
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { when: 'beforeChildren', staggerChildren: 0.05 },
  },
};

const cellVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// List of desks to display in the desk section.
const desks = ["Children's Desk", 'Teen Desk', 'Tween Desk'];

const DayView = () => {
  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-5 text-center">Day View - Manager's Schedule</h1>
      <motion.div
        className="overflow-x-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main grid: 200px left column for worker/desk labels and 16 hourly columns */}
        <div className="grid grid-cols-[200px_repeat(16,1fr)] border border-gray-300 rounded-lg shadow-lg bg-white">
          {/* Header Row */}
          <motion.div className="border border-gray-300 p-4 font-semibold" variants={cellVariants}>
            Worker / Desk
          </motion.div>
          {hours.map((hour) => (
            <motion.div
              key={`hour-${hour}`}
              className="border border-gray-300 p-4 text-center font-semibold"
              variants={cellVariants}
            >
              {formatHour(hour)}
            </motion.div>
          ))}

          {/* Worker Rows */}
          {workerSchedules.map((worker) => (
            <React.Fragment key={worker.name}>
              {/* Worker label cell with mini timeline.
                  The cell uses the worker's distinct color. */}
              <motion.div
                className={`border border-gray-300 p-4 font-medium ${worker.color}`}
                variants={cellVariants}
              >
                <div>{worker.name}</div>
                <div className="mt-2 flex h-2 w-full">
                  {renderWorkerTimeline(worker)}
                </div>
              </motion.div>
              {/* Worker schedule row */}
              {renderWorkerRow(worker)}
            </React.Fragment>
          ))}

          {/* Desk Rows */}
          {desks.map((desk) => (
            <React.Fragment key={desk}>
              {/* Desk label cell */}
              <motion.div className="border border-gray-300 p-4 font-medium bg-gray-200" variants={cellVariants}>
                {desk}
              </motion.div>
              {/* Desk schedule row with colored segments */}
              {renderDeskRow(desk)}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DayView;

