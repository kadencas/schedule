// app/api/updateshifts/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  let payload;
  try {
    payload = await request.json();
    console.log("Received payload:", payload);
  } catch (err) {
    console.error("Error parsing payload:", err);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { companyId, schedule } = payload;
  if (!companyId || !schedule) {
    return NextResponse.json({ error: "Missing companyId or schedule data" }, { status: 400 });
  }

  try {
    // Process each employee's schedule
    for (const employee of schedule) {
      for (const shift of employee.shifts) {
        const shiftStart = new Date(shift.startTime);
        const shiftEnd = new Date(shift.endTime);
        const shiftDate = new Date(shiftStart);
        shiftDate.setHours(0, 0, 0, 0);

        let shiftRecord;
        if (shift.id) {
          // Update an existing shift
          shiftRecord = await prisma.work_shifts.update({
            where: { id: shift.id },
            data: {
              startTime: shiftStart,
              endTime: shiftEnd,
              shiftDate,
            },
          });
        } else {
          // Create a new shift. Note: use employee.id (from your payload) as the userId.
          shiftRecord = await prisma.work_shifts.create({
            data: {
              userId: employee.id, // updated here!
              companyId,
              shiftDate,
              startTime: shiftStart,
              endTime: shiftEnd,
              isRecurring: false,
            },
          });
        }

        // Process segments for this shift
        for (const segment of shift.segments) {
          const segStart = new Date(segment.startTime);
          const segEnd = new Date(segment.endTime);

          if (segment.id) {
            // Update existing segment
            await prisma.segments.update({
              where: { id: segment.id },
              data: {
                startTime: segStart,
                endTime: segEnd,
                segmentType: segment.segmentType,
                location: segment.location || '',
                notes: segment.notes || '',
              },
            });
          } else {
            // Create a new segment for the shift
            await prisma.segments.create({
              data: {
                shiftId: shiftRecord.id,
                startTime: segStart,
                endTime: segEnd,
                segmentType: segment.segmentType,
                location: segment.location || '',
                notes: segment.notes || '',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shifts:", error);
    return NextResponse.json({ error: "Error updating shifts" }, { status: 500 });
  }
}

