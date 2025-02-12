'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor, DraggableAttributes, useDraggable } from '@dnd-kit/core';
import { parse, startOfWeek, getDay, format, addHours, differenceInHours, isSameDay } from 'date-fns';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parseShift } from './utils';
import { motion } from 'framer-motion';

// Set up the date-fns localizer for React Big Calendar
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Role colors for visual distinction
const roleColors = {
  "Cashier": { light: '#bfdbfe', dark: '#3b82f6' },
  "Sales Associate": { light: '#bbf7d0', dark: '#22c55e' },
  "Manager": { light: '#fecaca', dark: '#ef4444' },
};

// Mock employees data - replace with your actual data source
const employees = [
  { id: 1, name: "Alice Johnson", role: "Cashier" },
  { id: 2, name: "Bob Smith", role: "Sales Associate" },
  { id: 3, name: "Carol White", role: "Manager" },
  { id: 4, name: "David Brown", role: "Cashier" },
  { id: 5, name: "Eve Wilson", role: "Sales Associate" },
];

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: number;
  role: string;
  resourceId?: number;
}

interface DraggableEmployeeProps {
  employee: typeof employees[0];
  isSelected: boolean;
  onSelect: () => void;
}

function DraggableEmployee({ employee, isSelected, onSelect }: DraggableEmployeeProps) {
  const roleColor = roleColors[employee.role as keyof typeof roleColors];
  
  return (
    <div
      onClick={onSelect}
      className={`p-3 mb-2 rounded-lg shadow cursor-pointer transition-all ${
        isSelected 
          ? `${roleColor.light} shadow-md ring-2 ring-${roleColor.dark}` 
          : 'bg-white hover:shadow-md hover:bg-gray-50'
      }`}
    >
      <h3 className="font-medium text-gray-800">{employee.name}</h3>
      <p className="text-sm text-gray-600">{employee.role}</p>
    </div>
  );
}

export default function ScheduleManager() {
  // Load initial events from localStorage
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('scheduleEvents');
      if (savedEvents) {
        // Parse the dates back into Date objects
        const parsedEvents = JSON.parse(savedEvents);
        return parsedEvents.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
      }
    }
    return [];
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [dragStartSlot, setDragStartSlot] = useState<Date | null>(null);
  const [dragEndSlot, setDragEndSlot] = useState<Date | null>(null);
  const [tempEvent, setTempEvent] = useState<ScheduleEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('scheduleEvents', JSON.stringify(events));
    }
  }, [events]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle employee selection
  const handleEmployeeSelect = (employee: typeof employees[0]) => {
    setSelectedEmployee(prev => prev?.id === employee.id ? null : employee);
    setDragStartSlot(null);
    setDragEndSlot(null);
    setTempEvent(null);
    setSelectedEvent(null);
  };

  // Handle slot selection start
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!selectedEmployee) return;
    setSelectedEvent(null);

    // Create permanent event immediately
    const newEvent: ScheduleEvent = {
      id: `${Date.now()}`,
      title: `${selectedEmployee.name}`,
      start: slotInfo.start,
      end: slotInfo.end,
      employeeId: selectedEmployee.id,
      role: selectedEmployee.role,
    };
    
    setEvents(prev => [...prev, newEvent]);
  };

  // Handle event selection (for editing/deleting)
  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    const employee = employees.find(emp => emp.id === event.employeeId);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => {
      const newEvents = prev.filter(event => event.id !== eventId);
      // Update localStorage
      localStorage.setItem('scheduleEvents', JSON.stringify(newEvents));
      return newEvents;
    });
    setSelectedEvent(null);
  };

  // Clear all events (useful for testing)
  const handleClearAllEvents = () => {
    setEvents([]);
    localStorage.removeItem('scheduleEvents');
    setSelectedEvent(null);
  };


  const allEvents = tempEvent ? [...events, tempEvent] : events;

  return (
    <div className="flex flex-col items-center w-full">
      <DndContext sensors={sensors}>
        <div className="flex gap-4 w-full max-w-7xl">
          {/* Employee List Sidebar */}
          <div className="w-64 bg-gray-50 p-4 rounded-lg shadow-lg self-start sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Employees</h2>
            <div className="space-y-2">
              {employees.map((employee) => (
                <DraggableEmployee 
                  key={employee.id} 
                  employee={employee}
                  isSelected={selectedEmployee?.id === employee.id}
                  onSelect={() => handleEmployeeSelect(employee)}
                />
              ))}
            </div>
            {selectedEmployee && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Click and drag on the calendar to set {selectedEmployee.name}'s shift hours
                </p>
              </div>
            )}
            {selectedEvent && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium mb-2">Selected Shift</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
                </p>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete Shift
                </button>
                
              </div>
            )}
            <button
                  onClick={handleClearAllEvents}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Clear All Shifts
                </button>
          </div>

          {/* Calendar View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex-1 bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Schedule Manager</h2>
            <Calendar
              localizer={localizer}
              events={allEvents}
              defaultView="week"
              views={['week']}
              step={60}
              timeslots={1}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 800 }}
              popup
              eventPropGetter={(event) => {
                const role = event.role as keyof typeof roleColors;
                const colors = roleColors[role];
                return {
                  className: event.id === 'temp' ? 'opacity-50' : '',
                  style: {
                    backgroundColor: colors.light,
                    color: colors.dark,
                    border: `1px solid ${colors.dark}`,
                  }
                };
              }}
            />
          </motion.div>
        </div>
      </DndContext>
    </div>
  );
}
