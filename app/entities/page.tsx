"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { LuLampDesk, LuBookOpen, LuClock, LuPlus, LuFilter, LuX } from "react-icons/lu";
import { TbBeach } from "react-icons/tb";
import { PiBooksFill } from "react-icons/pi";
import { BiSortZA } from "react-icons/bi";
import { MdToys, MdBlock } from "react-icons/md";
import { FiPlus, FiMinus, FiInfo, FiTag, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Entity } from "@/types/types";

// Map icon names to the actual components
const iconMap = {
  LuLampDesk,
  LuBookOpen,
  LuClock,
  TbBeach,
  PiBooksFill,
  BiSortZA,
  MdToys,
};

type AllowedIcon = keyof typeof iconMap;

// Tag card animation variants
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

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedType, setSelectedType] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // New Entity form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("STATION");
  const [icon, setIcon] = useState<AllowedIcon | "">("");
  const [color, setColor] = useState("#4F46E5"); // Default to indigo color
  const [requiresCoverage, setRequiresCoverage] = useState(false);
  const [minCoverage, setMinCoverage] = useState<number | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch existing entities
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch("/api/entities", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch entities");

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        setEntities(data);
      } catch (err) {
        console.error(err);
        setError("Could not load entities data");
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  // Unique types for the filter
  const entityTypes = Array.from(new Set(entities.map((e) => e.type)));

  // Filter logic
  const filteredEntities = entities.filter((entity) => {
    const typeMatch = selectedType === "" || entity.type === selectedType;
    const coverageMatch =
      selectedCoverage === ""
        ? true
        : selectedCoverage === "requires"
        ? entity.requiresCoverage
        : !entity.requiresCoverage;

    return typeMatch && coverageMatch;
  });

  // Create new entity
  const handleCreateEntity = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFormSubmitting(true);

    const requestBody = {
      name,
      type,
      icon: icon || null,
      color: color || null,
      requiresCoverage,
      minCoverage,
    };

    try {
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const msg = await response.json();
        throw new Error(msg.error || "Failed to create entity");
      }

      // Successful creation
      const newEntity = await response.json();
      setEntities((prev) => [...prev, newEntity]);

      // Reset the form and close it
      setName("");
      setType("STATION");
      setIcon("");
      setColor("#4F46E5");
      setRequiresCoverage(false);
      setMinCoverage(null);
      
      // Show success toast or notification here
      
      // Optionally close the form after successful submission
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while creating entity.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSelectedType("");
    setSelectedCoverage("");
    setShowFilters(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-8 p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-77.8C58.9,-69.3,69.3,-56.3,76.7,-42.1C84.1,-27.9,88.6,-13.9,87.4,-0.7C86.2,12.6,79.3,25.1,71.2,37.1C63.1,49.1,53.8,60.6,41.9,68.9C30,77.2,15,82.4,0.2,82.1C-14.7,81.8,-29.4,76,-42.5,67.4C-55.6,58.8,-67.1,47.4,-74.3,33.7C-81.6,20,-84.7,4,-82.4,-11.1C-80.1,-26.2,-72.4,-40.5,-61.6,-50.2C-50.8,-59.9,-37,-65,-24,-70.6C-11,-76.2,1.1,-82.3,14.4,-83C27.7,-83.6,41.1,-78.9,45.7,-77.8Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <FiTag className="mr-2" />
              Tags
            </h1>
            <p className="opacity-90 text-sm">
              Create and manage tags for stations, tasks, and more
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 text-white py-2 px-3.5 rounded-lg text-sm font-medium backdrop-blur-sm transition duration-200 flex items-center mr-3"
            >
              <LuFilter className="mr-1.5" />
              Filter
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-white hover:bg-opacity-90 text-indigo-700 py-2 px-3.5 rounded-lg text-sm font-medium transition duration-200 flex items-center"
            >
              <FiPlus className="mr-1.5" />
              New Tag
            </button>
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
                <LuFilter className="mr-2 text-indigo-500" />
                Filter Tags
              </h2>
              <button 
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
              >
                <LuX className="mr-1.5" size={14} />
                Reset
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filter by Type */}
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="filterType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {entityTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Coverage */}
              <div>
                <label htmlFor="coverage" className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Requirement
                </label>
                <select
                  id="coverage"
                  value={selectedCoverage}
                  onChange={(e) => setSelectedCoverage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Coverage Types</option>
                  <option value="requires">Requires Coverage</option>
                  <option value="not-required">No Coverage Required</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <div className="text-sm text-gray-500">
                {filteredEntities.length} tags found
              </div>
              <button 
                onClick={() => setShowFilters(false)} 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tags Display */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-500 text-center">Loading tags...</p>
          </div>
        </div>
      ) : error && entities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-red-500 mb-4">
              <FiXCircle size={40} />
            </div>
            <p className="text-red-500 font-medium mb-1">Unable to load tags</p>
            <p className="text-gray-500 text-center">{error}</p>
          </div>
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-gray-300 mb-4">
              <FiInfo size={40} />
            </div>
            <p className="text-gray-700 font-medium mb-1">No matching tags found</p>
            <p className="text-gray-500 text-center">Try adjusting your filters</p>
            {(selectedType || selectedCoverage) && (
              <button
                onClick={resetFilters}
                className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
            {filteredEntities.map((entity, index) => {
              const IconComponent = entity.icon
                ? iconMap[entity.icon as AllowedIcon]
                : null;

              return (
                <motion.div
                  key={entity.id}
                  custom={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                >
                  <div 
                    className="p-4 text-white font-medium"
                    style={{ 
                      backgroundColor: entity.color || "#4F46E5",
                      color: entity.color ? getTextColor(entity.color) : "white"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {IconComponent ? (
                        <IconComponent size={20} />
                      ) : (
                        <FiTag size={20} />
                      )}
                      <span className="truncate">{entity.name}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 flex-grow bg-gray-50">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
                        {entity.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700">
                      {entity.requiresCoverage ? (
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-500 mr-1.5" size={14} />
                          <span>
                            Min Coverage: <span className="font-medium">{entity.minCoverage ?? 1}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FiXCircle className="text-gray-400 mr-1.5" size={14} />
                          <span>No coverage required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Create New Tag Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) setIsFormOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <LuX size={20} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Create New Tag</h2>
                <p className="text-gray-500 text-sm">Add a new tag to categorize stations and tasks</p>
              </div>
              
              <form onSubmit={handleCreateEntity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Circulation Desk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="STATION">STATION</option>
                    <option value="TASK">TASK</option>
                  </select>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="color"
                      type="color"
                      className="h-10 w-10 rounded-lg border border-gray-300 cursor-pointer"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                    <div 
                      className="px-3 py-2 rounded-lg border border-gray-200 flex-grow"
                      style={{ backgroundColor: color, color: getTextColor(color) }}
                    >
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Optional)
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Object.entries(iconMap).map(([key, Component]) => {
                      const isSelected = icon === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setIcon(key as AllowedIcon)}
                          className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center
                            ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                : "border-gray-200"
                            }`}
                        >
                          <Component size={24} className={isSelected ? "text-indigo-600" : "text-gray-600"} />
                        </button>
                      );
                    })}

                    {/* "No icon" button */}
                    <button
                      type="button"
                      onClick={() => setIcon("")}
                      className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center
                        ${icon === "" ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-gray-200"}`}
                    >
                      <MdBlock size={24} className={icon === "" ? "text-indigo-600" : "text-gray-600"} />
                    </button>
                  </div>
                </div>

                {/* Coverage Options */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      id="requiresCoverage"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={requiresCoverage}
                      onChange={(e) => setRequiresCoverage(e.target.checked)}
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="requiresCoverage">
                      Requires Coverage
                    </label>
                  </div>

                  {requiresCoverage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="minCoverage">
                        Minimum Coverage
                      </label>
                      <input
                        id="minCoverage"
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={minCoverage ?? ""}
                        onChange={(e) => setMinCoverage(e.target.valueAsNumber)}
                        placeholder="e.g. 2"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-1.5" />
                        Create Tag
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to determine if text should be black or white based on background color
function getTextColor(hexColor: string): string {
  // Remove the # if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance - a measure of brightness
  // Formula from WCAG 2.0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

