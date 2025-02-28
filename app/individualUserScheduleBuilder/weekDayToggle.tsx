// WeekDayToggle.tsx
import React from "react";
import { days, getDayDateLabel } from "./helper/helper";

interface WeekDayToggleProps {
    currentMonday: Date;
    formattedMondayDate: string;
    handlePreviousWeek: () => void;
    handleNextWeek: () => void;
    selectedDay: string;
    setSelectedDay: (day: string) => void;
}


export default function WeekDayToggle({
    currentMonday,
    formattedMondayDate,
    handlePreviousWeek,
    handleNextWeek,
    selectedDay,
    setSelectedDay,
}: WeekDayToggleProps) {
    return (
        <div>
            {/* Header Section */}
            <header
                style={{
                    width: "100%",
                    height: 60,
                    position: "relative",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                }}
            >
                <button onClick={handlePreviousWeek}>Previous Week</button>
                <span style={{ fontWeight: "bold" }}>Week of: {formattedMondayDate}</span>
                <button onClick={handleNextWeek}>Next Week</button>
            </header>

            {/* Day Tabs Section */}
            <div
                style={{
                    backgroundColor: "#f1f1f1",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 0",
                }}
            >
                {days.map((day, index) => {
                    const dateLabel = getDayDateLabel(currentMonday, index);
                    const isSelected = selectedDay === day;
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "4px",
                                border: isSelected ? "2px solid #007bff" : "1px solid #ccc",
                                backgroundColor: isSelected ? "#007bff" : "#fff",
                                color: isSelected ? "#fff" : "#000",
                                cursor: "pointer",
                                minWidth: 90,
                                fontWeight: "bold",
                            }}
                        >
                            {day} ({dateLabel})
                        </button>
                    );
                })}
            </div>
        </div>
    );
}