'use client';

import { useState, useEffect } from "react";
import MyScheduleTab from "./components/dashboard/MyScheduleTab";
import ViewOthersTab from "./components/dashboard/ViewOthersTab";
import ScheduleManager from "./components/dashboard/ScheduleManager";

export default function Dashboard() {
  // =============================
  // Tab state
  // =============================
  const [activeTab, setActiveTab] = useState<"mySchedule" | "viewOthers" | "manager">("mySchedule");

  // =============================
  // Only the user's name is fetched from the server
  // =============================
  const [userName, setUserName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  // =============================
  // Fetch the user's name on mount
  // =============================
  useEffect(() => {
    async function fetchUserName() {
      try {
        const response = await fetch("/api/userSchedule"); 
        const data = await response.json();
        setUserName(data.name || "Employee");
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("Error");
      } finally {
        setLoading(false);
      }
    }

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading user name...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("mySchedule")}
          className={
            `px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ` +
            (activeTab === "mySchedule"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300")
          }
        >
          My Schedule
        </button>
        <button
          onClick={() => setActiveTab("viewOthers")}
          className={
            `px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ` +
            (activeTab === "viewOthers"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300")
          }
        >
          View Others
        </button>
        <button
          onClick={() => setActiveTab("manager")}
          className={
            `px-4 py-2 rounded-2xl font-semibold focus:outline-none transition-colors ` +
            (activeTab === "manager"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300")
          }
        >
          Schedule Manager
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "mySchedule" && <MyScheduleTab userName={userName} />}
      {activeTab === "viewOthers" && <ViewOthersTab />}
      {activeTab === "manager" && <ScheduleManager />}
    </main>
  );
}
