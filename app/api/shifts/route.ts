// pages/api/save-shifts.ts (or your shifts endpoint file)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Fetch all users along with their work_shifts and segments
    const users = await prisma.users.findMany({
      include: { 
        work_shifts: { 
          include: { segments: true } 
        } 
      },
    });

    // Transform the data into the structure the frontend expects.
    // Now each employee includes their id, and each shift/segment includes its id.
    const employees = users.map(user => ({
      id: user.id, // include user's primary key
      name: user.name,
      shifts: user.work_shifts.map(shift => ({
        id: shift.id, // include shift id
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        segments: shift.segments.map(segment => ({
          id: segment.id, // include segment id
          startTime: segment.startTime.toISOString(),
          endTime: segment.endTime.toISOString(),
          segmentType: segment.segmentType,
          location: segment.location,
          notes: segment.notes,
        })),
      })),
    }));

    console.log(employees[0]?.shifts[0]?.segments);
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
