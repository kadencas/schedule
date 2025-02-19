"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  hoursAllowed: number;
}

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to hold filter selections
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        if (!data.users) throw new Error("Invalid API response");

        setUsers(data.users);
      } catch (error) {
        console.error(error);
        setError("Could not load team data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Gather unique departments, locations, and roles from users
  const departments = Array.from(new Set(users.map((user) => user.department)));
  const locations = Array.from(new Set(users.map((user) => user.location)));
  const roles = Array.from(new Set(users.map((user) => user.role)));

  // Filter users based on selected filters
  const filteredUsers = users.filter((user) => {
    const departmentMatch =
      selectedDepartment === "" || user.department === selectedDepartment;
    const locationMatch =
      selectedLocation === "" || user.location === selectedLocation;
    const roleMatch = selectedRole === "" || user.role === selectedRole;

    return departmentMatch && locationMatch && roleMatch;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Organization</h1>
        <Link href="/invite">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Add Members
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
        <div>
          <label htmlFor="department" className="mr-2 font-semibold">
            Department:
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="">All</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="mr-2 font-semibold">
            Location:
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="">All</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role" className="mr-2 font-semibold">
            Role:
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="">All</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">
          No matching team members found.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500">
                <span className="font-semibold">Role:</span> {user.role}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Department:</span>{" "}
                {user.department}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Location:</span>{" "}
                {user.location}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Hours Allowed:</span>{" "}
                {user.hoursAllowed} hrs
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
