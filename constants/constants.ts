// constants.ts

// Create an array of hours (9 AM -> 10 PM) with both numeric and display labels.
export const hours = Array.from({ length: 14 }, (_, i) => {
    const numeric = i + 9; // 9..22
    const hour12 = numeric % 12 === 0 ? 12 : numeric % 12;
    const period = numeric >= 12 ? "PM" : "AM";
    return { numeric, label: `${hour12} ${period}` };
  });
  
  export const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  
  // Default selected day based on today’s day.
  export const defaultSelectedDay = (() => {
    const today = new Date();
    const dayNum = today.getDay(); // 0=Sun..6=Sat
    return dayNum === 0 ? "Sunday" : days[dayNum - 1];
  })();
  