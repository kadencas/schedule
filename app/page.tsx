"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PT_Serif } from 'next/font/google';


const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: '700', // adjust if you need a different weight
});

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const headerItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const titleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 },
    },
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen bg-[#F9F7F4] px-6 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-64 h-64 bg-blue-200 rounded-full filter blur-3xl"
        style={{ top: '-100px', left: '-100px', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-green-200 rounded-full filter blur-3xl"
        style={{ bottom: '-50px', right: '-50px', zIndex: 0 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header Navigation */}
      <motion.div
        className="absolute top-6 right-6 flex gap-4 z-10"
        variants={headerItemVariants}
      >
        <motion.button
          className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Free
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Book a Demo
        </motion.button>
        <Link href="/signin">
          <motion.button
            className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </Link>
      </motion.div>

      {/* Title and Subtitle */}
      <motion.h1
        className={`${ptSerif.className} text-[12rem] font-extrabold text-blue-600 mt-20 leading-none`}
        variants={titleVariants}
      >
        When
      </motion.h1>
      <motion.p
        className={`${ptSerif.className} text-gray-500 text-xl mt-4 z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        A Better way to Schedule
      </motion.p>

      {/* Timeline Arrows */}
      <div className="mt-12 space-y-6 w-full max-w-4xl flex flex-col items-end z-10">
        <motion.div
          className="flex items-center w-full"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-orange-400 h-12 flex-grow rounded-l-full"></div>
          <div className="bg-orange-400 h-12 w-12 rounded-r-full -ml-2"></div>
        </motion.div>

        <motion.div
          className="flex items-center w-[90%]"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-purple-400 h-12 flex-grow rounded-l-full"></div>
          <div className="bg-purple-400 h-12 w-12 rounded-r-full -ml-2"></div>
        </motion.div>

        <motion.div
          className="flex items-center w-[80%]"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-green-400 h-12 flex-grow rounded-l-full"></div>
          <div className="bg-green-400 h-12 w-12 rounded-r-full -ml-2"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}
