// Time parsing utilities
export function parseTime(timeString: string) {
  const [time, meridiem] = timeString.split(/\s/);
  if (!time) return 0;

  let [hourStr] = time.split(":");
  let hour = parseInt(hourStr, 10);

  if (meridiem?.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (meridiem?.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }
  return hour;
}

// "9:00 AM - 5:00 PM" => { start: 9, end: 17 } or null if "Off"
export function parseShift(shiftString: string) {
  if (!shiftString || shiftString.toLowerCase() === "off") {
    return null;
  }
  const [startTime, endTime] = shiftString.split("-");
  const start = parseTime(startTime.trim());
  const end = parseTime(endTime.trim());
  return { start, end };
}

// Build RBC event objects from a hardcoded { date: shift } map
export function buildEventsFromShifts(shiftsObj: Record<string, string>) {
  const events = [];
  for (const [dateStr, shiftStr] of Object.entries(shiftsObj)) {
    if (!shiftStr || shiftStr.toLowerCase() === "off") continue;
    const parsedShift = parseShift(shiftStr);
    if (!parsedShift) continue;

    const [year, month, day] = dateStr.split("-").map(Number);
    const eventStart = new Date(year, month - 1, day, parsedShift.start);
    const eventEnd = new Date(year, month - 1, day, parsedShift.end);

    events.push({
      title: shiftStr,
      start: eventStart,
      end: eventEnd,
    });
  }
  return events;
}
