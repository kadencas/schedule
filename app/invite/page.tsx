"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InviteTeamMember() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong while sending the invitation.");
      } else {
        setMessage("Invitation sent successfully!");
        setName("");
        setEmail("");
        setRole("");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    }

    setLoading(false);
  };

  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full" variants={itemVariants}>
        <motion.h1 className="text-3xl font-bold mb-6 text-center" variants={itemVariants}>
          Invite New Team Member
        </motion.h1>

        {error && (
          <motion.p className="mb-4 text-red-500 text-center" variants={itemVariants}>
            {error}
          </motion.p>
        )}
        {message && (
          <motion.p className="mb-4 text-green-500 text-center" variants={itemVariants}>
            {message}
          </motion.p>
        )}

        <motion.form onSubmit={handleSubmit} className="flex flex-col space-y-4" variants={itemVariants}>
          <motion.input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            variants={itemVariants}
          />
          <motion.input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            variants={itemVariants}
          />
          <motion.input
            type="text"
            placeholder="Role (Optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            variants={itemVariants}
          />
          <motion.button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {loading ? "Sending Invitation..." : "Send Invitation"}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
