import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";


const ScheduleBuilderComponent = dynamic(() => import("../../builder/page"), { ssr: false });


export default function ScheduleEditorTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-10xl z-10 relative"
    >
      <ScheduleBuilderComponent />
    </motion.div>
  );
}