'use client';

import { motion } from "framer-motion";

// Hardcoded coworkers data
const coworkers = [
  { name: "Alice", shift: "8:00 AM - 4:00 PM" },
  { name: "John", shift: "10:00 AM - 6:00 PM" },
  { name: "Maria", shift: "2:00 PM - 10:00 PM" },
];

export default function ViewOthersTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl bg-white rounded-2xl shadow p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Others&apos; Schedules</h2>
      <ul className="space-y-3">
        {coworkers.map((cw, idx) => (
          <li key={idx} className="flex justify-between text-lg text-gray-700">
            <span className="font-medium">{cw.name}</span>
            <span>{cw.shift}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}