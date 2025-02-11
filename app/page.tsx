"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Mock data for bookings chart
const data = [
  { day: "Mon", bookings: 4 },
  { day: "Tue", bookings: 8 },
  { day: "Wed", bookings: 5 },
  { day: "Thu", bookings: 7 },
  { day: "Fri", bookings: 3 },
  { day: "Sat", bookings: 6 },
  { day: "Sun", bookings: 2 },
];

// Mock data for upcoming events
const upcomingEvents = [
  {
    title: "Team Sync",
    time: "Today 2:00 PM",
    description: "Weekly alignment call with the entire team.",
  },
  {
    title: "Client Check-In",
    time: "Tomorrow 10:30 AM",
    description: "Discuss new requirements and feature requests.",
  },
  {
    title: "Dev Sprint Planning",
    time: "Fri 1:00 PM",
    description: "Plan tasks and deliverables for the upcoming sprint.",
  },
];

// Mock data for tasks
const tasks = [
  {
    name: "Fix scheduling bug",
    status: "In Progress",
  },
  {
    name: "Update user profile design",
    status: "Completed",
  },
  {
    name: "Prepare release notes",
    status: "Pending",
  },
];

export default function Dashboard() {
  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here is an overview of your scheduling activity.</p>
      </motion.div>

      {/* Grid Section: Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow p-4"
        >
          <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
          <ul>
            {upcomingEvents.map((event, idx) => (
              <li key={idx} className="mb-3">
                <h3 className="text-md font-medium text-gray-700">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.time}</p>
                <p className="text-sm text-gray-400">{event.description}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 2: Open Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow p-4"
        >
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          <ul>
            {tasks.map((task, idx) => (
              <li key={idx} className="flex justify-between items-center mb-2">
                <span className="text-gray-700">{task.name}</span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-xl ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : task.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 3: Quick Stats (Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow p-4"
        >
          <h2 className="text-xl font-semibold mb-3">Weekly Bookings</h2>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" stroke="#888888" />
                <YAxis allowDecimals={false} stroke="#888888" />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff" }} />
                <Bar dataKey="bookings" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Additional Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <p className="text-gray-600">
          Tailor this dashboard to your needs. Add more sections for your specific workflow:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Detailed calendar views or scheduling flows</li>
          <li>Reminders or notifications section</li>
          <li>Team collaboration features or chat</li>
          <li>Advanced analytics: usage statistics, scheduling patterns, etc.</li>
        </ul>
      </motion.div>
    </main>
  );
}

