"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUsers, 
  FiFilter, 
  FiPlus, 
  FiMail, 
  FiBriefcase, 
  FiMapPin, 
  FiClock, 
  FiInfo, 
  FiX, 
  FiUserPlus 
} from "react-icons/fi";
import { useSession } from "next-auth/react";

// Array of roles that can add team members
const ADMIN_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "TEAM_LEAD"];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  hoursAllowed: number;
}

// Person card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2
    }
  }
};

export default function Team() {
  // Get session data for role-based access control
  const { data: session, status } = useSession();
  
  // Check if user has permission to add team members
  const canAddMembers = Boolean(
    session?.user?.role && ADMIN_ROLES.includes(session.user.role)
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to hold filter selections
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const resetFilters = () => {
    setSelectedDepartment("");
    setSelectedLocation("");
    setSelectedRole("");
    setShowFilters(false);
  };

  // Get background color based on role
  const getRoleColor = (role: string) => {
    const roleColors: {[key: string]: string} = {
      'Admin': '#4F46E5', // Indigo
      'Manager': '#0891B2', // Cyan
      'Employee': '#2563EB', // Blue
      'Supervisor': '#7C3AED', // Purple
      'Intern': '#10B981', // Emerald
    };
    
    return roleColors[role] || '#6366F1'; // Default indigo if role not found
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Show loading state
  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg mb-8 p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-77.8C58.9,-69.3,69.3,-56.3,76.7,-42.1C84.1,-27.9,88.6,-13.9,87.4,-0.7C86.2,12.6,79.3,25.1,71.2,37.1C63.1,49.1,53.8,60.6,41.9,68.9C30,77.2,15,82.4,0.2,82.1C-14.7,81.8,-29.4,76,-42.5,67.4C-55.6,58.8,-67.1,47.4,-74.3,33.7C-81.6,20,-84.7,4,-82.4,-11.1C-80.1,-26.2,-72.4,-40.5,-61.6,-50.2C-50.8,-59.9,-37,-65,-24,-70.6C-11,-76.2,1.1,-82.3,14.4,-83C27.7,-83.6,41.1,-78.9,45.7,-77.8Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <FiUsers className="mr-2" />
              Your Organization
            </h1>
            <p className="opacity-90 text-sm">
              {filteredUsers.length} team members
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm font-medium backdrop-blur-sm transition duration-200 flex items-center"
            >
              <FiFilter className="mr-1.5" />
              Filter
            </button>
            
            {/* Only show Add Members button for users with permission */}
            {canAddMembers && (
              <Link href="/account-management/invite">
                <button className="bg-white hover:bg-opacity-90 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition duration-200 flex items-center">
                  <FiUserPlus className="mr-1.5" />
                  Add Members
                </button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiFilter className="mr-2 text-blue-500" />
                Filter Team Members
              </h2>
              <button 
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
              >
                <FiX className="mr-1.5" size={14} />
                Reset
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Filter by Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filter by Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filter by Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <div className="text-sm text-gray-500">
                {filteredUsers.length} people found
              </div>
              <button 
                onClick={() => setShowFilters(false)} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* People Display */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 text-center">Loading team members...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-red-500 mb-4">
              <FiX size={40} />
            </div>
            <p className="text-red-500 font-medium mb-1">Unable to load team data</p>
            <p className="text-gray-500 text-center">{error}</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-gray-300 mb-4">
              <FiInfo size={40} />
            </div>
            <p className="text-gray-700 font-medium mb-1">No matching team members found</p>
            <p className="text-gray-500 text-center">Try adjusting your filters</p>
            {(selectedDepartment || selectedLocation || selectedRole) && (
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                custom={index}
                variants={cardVariants}
                whileHover="hover"
                className="rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex items-center p-4 border-b border-gray-100">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{user.name}</h2>
                    <p className="text-gray-500 text-sm flex items-center">
                      <FiMail className="mr-1" size={14} />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex-grow">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <FiBriefcase className="mr-1 text-blue-500 flex-shrink-0" size={14} />
                        <span className="truncate">{user.role}</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <FiUsers className="mr-1 text-blue-500 flex-shrink-0" size={14} />
                        <span className="truncate">{user.department}</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <FiMapPin className="mr-1 text-blue-500 flex-shrink-0" size={14} />
                        <span className="truncate">{user.location}</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Weekly Hours</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <FiClock className="mr-1 text-blue-500 flex-shrink-0" size={14} />
                        <span>{user.hoursAllowed} hrs</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
