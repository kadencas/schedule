"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Icons for your entity picker
import { LuLampDesk, LuBookOpen, LuClock } from "react-icons/lu";
import { TbBeach } from "react-icons/tb";
import { PiBooksFill } from "react-icons/pi";
import { BiSortZA } from "react-icons/bi";
import { MdToys, MdBlock } from "react-icons/md";

// **Font Awesome** icons for the minimize/maximize toggle
import { FaPlus, FaMinus } from "react-icons/fa";
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


export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedType, setSelectedType] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState("");

  // New Entity form states
  const [isFormOpen, setIsFormOpen] = useState(false); // tracks collapse/expand
  const [name, setName] = useState("");
  const [type, setType] = useState("LOCATION");
  const [icon, setIcon] = useState<AllowedIcon | "">("");
  const [color, setColor] = useState("");
  const [requiresCoverage, setRequiresCoverage] = useState(false);
  const [minCoverage, setMinCoverage] = useState<number | null>(null);

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

      // Reset the form
      setName("");
      setType("LOCATION");
      setIcon("");
      setColor("");
      setRequiresCoverage(false);
      setMinCoverage(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while creating entity.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tags</h1>
      </div>

      {/* Filter UI */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
        {/* Filter by Type */}
        <div>
          <label htmlFor="filterType" className="mr-2 font-semibold">
            Filter by Type:
          </label>
          <select
            id="filterType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="">All</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Coverage */}
        <div>
          <label htmlFor="coverage" className="mr-2 font-semibold">
            Coverage:
          </label>
          <select
            id="coverage"
            value={selectedCoverage}
            onChange={(e) => setSelectedCoverage(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="">All</option>
            <option value="requires">Requires Coverage</option>
            <option value="not-required">No Coverage Required</option>
          </select>
        </div>
      </div>

      {/* Display Entities */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error && entities.length === 0 ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredEntities.length === 0 ? (
        <p className="text-center text-gray-500">
          No matching entities found.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredEntities.map((entity) => {
            const IconComponent = entity.icon
              ? iconMap[entity.icon as AllowedIcon]
              : null;

            return (
              <motion.div
                key={entity.id}
                style={{ backgroundColor: entity.color ?? "#FFFFFF" }}
                className="shadow-md rounded-lg p-4 border border-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {IconComponent && <IconComponent size={24} />}
                  {entity.name}
                </h2>
                <p className="text-gray-700">
                  <span className="font-semibold">Type:</span> {entity.type}
                </p>
                {entity.requiresCoverage ? (
                  <p className="text-gray-700">
                    <span className="font-semibold">Min Coverage:</span>{" "}
                    {entity.minCoverage ?? 1}
                  </p>
                ) : (
                  <p className="text-gray-700">
                    <span className="font-semibold">Coverage:</span> None
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* CREATE NEW ENTITY (Collapsible Section) */}
      <div className="border p-4 rounded-md bg-white shadow-sm">
        {/* Minimize / Maximize Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Create a New Tag</h2>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="text-gray-800 px-2 py-1 rounded"
          >
            {isFormOpen ? <FaMinus /> : <FaPlus />}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleCreateEntity} className="space-y-4">
            <div>
              <label className="block font-semibold" htmlFor="name">
                Name:
              </label>
              <input
                id="name"
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Circulation Desk"
              />
            </div>

            <div>
              <label className="block font-semibold" htmlFor="type">
                Type:
              </label>
              <select
                id="type"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="LOCATION">LOCATION</option>
                <option value="TASK">TASK</option>
              </select>
            </div>

            {/* Visual Icon Picker (no icon name shown) */}
            <div>
              <label className="block font-semibold mb-2">
                Pick an Icon (optional):
              </label>
              <div className="flex flex-wrap gap-4">
                {/* Each icon button shows only the icon, no text */}
                {Object.entries(iconMap).map(([key, Component]) => {
                  const isSelected = icon === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setIcon(key as AllowedIcon)}
                      className={`p-3 border rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                    >
                      <Component size={32} />
                    </button>
                  );
                })}

                {/* "No icon" button */}
                <button
                  type="button"
                  onClick={() => setIcon("")}
                  className={`p-3 border rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center
                    ${icon === "" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                >
                  <MdBlock size={32} />
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold" htmlFor="color">
                Color (optional):
              </label>
              <input
                id="color"
                type="color"
                className="border border-gray-300 rounded-md p-1 h-10 w-16"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="requiresCoverage"
                type="checkbox"
                checked={requiresCoverage}
                onChange={(e) => setRequiresCoverage(e.target.checked)}
              />
              <label className="font-semibold" htmlFor="requiresCoverage">
                Requires Coverage?
              </label>
            </div>

            {requiresCoverage && (
              <div>
                <label className="block font-semibold" htmlFor="minCoverage">
                  Min Coverage:
                </label>
                <input
                  id="minCoverage"
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={minCoverage ?? ""}
                  onChange={(e) => setMinCoverage(e.target.valueAsNumber)}
                  placeholder="e.g. 2"
                />
              </div>
            )}

            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Create Entity
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

