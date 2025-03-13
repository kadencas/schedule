// app/api/updateshiftwithsegments/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    console.error("Error parsing payload:", err);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { shiftId, startTime, endTime, segments } = payload;
  if (!shiftId || !startTime || !endTime || !Array.isArray(segments)) {
    return NextResponse.json(
      { error: "Missing shiftId, startTime, endTime or segments" },
      { status: 400 }
    );
  }

  try {
    // Update the shift record
    const updatedShift = await prisma.work_shifts.update({
      where: { id: shiftId },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    for (const segment of segments) {
      const { id, startTime: segStart, endTime: segEnd, segmentType, location, notes, color, entityId } = segment;
      await prisma.segments.upsert({
        where: { id },
        update: {
          startTime: new Date(segStart),
          endTime: new Date(segEnd),
          segmentType,
          location: location || '',
          notes: notes || '',
          color: color,
          entityId: entityId || null,
        },
        create: {
          id, // Use the provided id from the client
          shiftId,
          startTime: new Date(segStart),
          endTime: new Date(segEnd),
          segmentType,
          location: location || '',
          notes: notes || '',
          color: color,
          entityId: entityId || null,
        },
      });
    }

    return NextResponse.json({ success: true, shift: updatedShift });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Error updating shift" }, { status: 500 });
  }
}
