import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const WeekComponent = dynamic(() => import("../ScheduleViews/viewWeek/page"), { ssr: false });

  export default function ViewWeekTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-10xl z-10 relative"
      >
        <WeekComponent />
      </motion.div>
    );
  }