export const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

/**
take a date and return the most recent monday
*/
export const getMostRecentMonday = (date: Date): Date => {
    const day = date.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    return monday;
};

/**
function called immediately to determine the current day and returns a string of Monday, Tuesday etc.
*/
export const defaultSelectedDay = (() => {
    const today = new Date();
    const dayNumber = today.getDay();
    return dayNumber === 0 ? "Sunday" : days[dayNumber - 1];
})();

/**
* Returns the previous week's Monday.
*/
export const getPreviousWeekMonday = (currentMonday: Date): Date => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(newMonday.getDate() - 7);
    return newMonday;
};

/**
 * Returns the next week's Monday.
 */
export const getNextWeekMonday = (currentMonday: Date): Date => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(newMonday.getDate() + 7);
    return newMonday;
};

/**
 * Formats a Monday date as "Jan 1, 2025"
 */
export const formatMondayDate = (monday: Date): string => {
    return monday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

/**
 * Returns a short date label for a day in the current week, e.g. "1/1".
 * @param currentMonday - The Monday of the current week.
 * @param dayIndex - Index (0 for Monday, 6 for Sunday).
 */
export const getDayDateLabel = (
    currentMonday: Date,
    dayIndex: number
): string => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + dayIndex);
    return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
    });
};
