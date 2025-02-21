"use client";
import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const TeamComponent = dynamic(() => import("../ScheduleViews/viewDay/page"), { ssr: false });

export default function ViewDayTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-10xl z-10 relative"
    >
      <TeamComponent />
    </motion.div>
  );
}
