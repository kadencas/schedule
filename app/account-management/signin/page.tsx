"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setErrorMsg("Invalid credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F9F7F4] px-6 overflow-hidden">
      {/* Back Button */}
      <motion.button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </motion.button>

      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-64 h-64 bg-blue-200 rounded-full filter blur-3xl"
        style={{ top: "-100px", left: "-100px", zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-green-200 rounded-full filter blur-3xl"
        style={{ bottom: "-50px", right: "-50px", zIndex: 0 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sign In Card */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Sign In
        </h1>
        {errorMsg && (
          <p className="text-red-600 text-center mb-4">{errorMsg}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-blue-500"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-blue-500"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          <motion.button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </form>
        <p className="mt-6 text-center">
          Don't have an account?
        </p>

        <p className="mt-6 text-center">
          <Link href="/signup" className="text-green-600 hover:underline">
            Start an orginization
          </Link>
          </p>

          <p className="mt-6 text-center">
          <Link href="/signup" className="text-blue-600 hover:underline">
            Join an existing orginization
          </Link>
          </p>



      </motion.div>
    </div>
  );
}
