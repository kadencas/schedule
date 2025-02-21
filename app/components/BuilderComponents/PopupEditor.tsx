"use client";
import React from "react";

interface DraftShift {
    isEditing: boolean;
    isSegment: boolean;
    employeeIndex: number;
    shiftIndex: number;
    segmentIndex: number | null;
    dayIndex: number;
    startHour: number;
    endHour: number;
    title: string;
    location?: string;
    notes?: string;
}

interface SegmentPopupProps {
    draftShift: DraftShift;
    onCancel: () => void;
    onSave: (updatedDraft: DraftShift) => void;
    onChange: (field: keyof DraftShift, value: string | number) => void;
}

const PopupEditor: React.FC<SegmentPopupProps> = ({ draftShift, onCancel, onSave, onChange }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        {draftShift.isEditing ? "Edit Segment" : "New Segment"}
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                            <path d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05l1.414-1.414L10 8.586z"/>
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Segment Type</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={draftShift.title}
                            onChange={(e) => onChange("title", e.target.value)}
                        >
                            <option value="Off desk work">Off desk work</option>
                            <option value="Desk">Desk</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Program">Program</option>
                            <option value="Meeting">Meeting</option>
                            <option value="DND">DND (do not disturb)</option>
                            <option value="OOO">OOO (out of office)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="(optional)"
                            value={draftShift.location || ""}
                            onChange={(e) => onChange("location", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Notes</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add any custom notes..."
                            value={draftShift.notes || ""}
                            onChange={(e) => onChange("notes", e.target.value)}
                        ></textarea>
                    </div>
                    <div className="text-sm text-gray-600">
                        <div>
                            <span className="font-semibold">Day:</span> {draftShift.dayIndex}
                        </div>
                        <div>
                            <span className="font-semibold">Start Hour:</span> {draftShift.startHour}:00
                        </div>
                        <div>
                            <span className="font-semibold">End Hour:</span> {draftShift.endHour}:00
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(draftShift)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupEditor;
