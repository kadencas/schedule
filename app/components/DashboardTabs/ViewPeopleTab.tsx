import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const PeopleComponent = dynamic(() => import("../People/page"), { ssr: false });


export default function PeopleTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-10xl z-10 relative"
      >
        <PeopleComponent />
      </motion.div>
    );
  }