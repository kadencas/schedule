export const MINUTES_PER_PIXEL = 5;

export function minutesToPixels(minutes: number): number {
  return minutes / MINUTES_PER_PIXEL;
}

export function pixelsToMinutes(pixels: number): number {
  return pixels * MINUTES_PER_PIXEL;
}
